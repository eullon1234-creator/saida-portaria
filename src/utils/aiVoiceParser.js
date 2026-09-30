// Utilitário de Inteligência Artificial para Processamento de Voz e Extração Estruturada de Romaneios
import { formatPlate } from './plateUtils';

const GEMINI_STORAGE_KEY = 'gel_portaria_gemini_api_key';

/**
 * Obtém a chave da API do Gemini (localStorage ou .env)
 */
export function getSavedGeminiKey() {
  try {
    const saved = localStorage.getItem(GEMINI_STORAGE_KEY);
    if (saved) return saved.trim();
  } catch (e) {
    console.warn('Erro ao ler chave do Gemini do localStorage:', e);
  }
  return import.meta.env.VITE_GEMINI_API_KEY || '';
}

/**
 * Salva a chave da API do Gemini
 */
export function saveGeminiKey(key) {
  if (!key) {
    localStorage.removeItem(GEMINI_STORAGE_KEY);
  } else {
    localStorage.setItem(GEMINI_STORAGE_KEY, key.trim());
  }
}

// Dicionário de números falados em português
const PORTUGUESE_NUMBERS = {
  'zero': 0, 'um': 1, 'uma': 1, 'hum': 1,
  'dois': 2, 'duas': 2,
  'três': 3, 'tres': 3,
  'quatro': 4,
  'cinco': 5,
  'seis': 6, 'meia': 6,
  'sete': 7,
  'oito': 8,
  'nove': 9,
  'dez': 10,
  'onze': 11, 'doze': 12, 'treze': 13, 'quatorze': 14, 'catorze': 14, 'quinze': 15,
  'dezesseis': 16, 'dezeseis': 16, 'dezessete': 17, 'dezesete': 17, 'dezoito': 18, 'dezenove': 19,
  'vinte': 20, 'trinta': 30, 'quarenta': 40, 'cinquenta': 50,
  'sessenta': 60, 'setenta': 70, 'oitenta': 80, 'noventa': 90,
  'cem': 100, 'cento': 100, 'duzentos': 200, 'trezentos': 300, 'quinhentos': 500, 'mil': 1000
};

/**
 * Normaliza números por extenso em português para dígitos numéricos
 */
export function normalizeNumbersInText(text) {
  if (!text) return '';
  let res = text;
  
  // Trata números compostos (ex: "vinte e três" -> "23", "trinta e cinco" -> "35")
  const tens = ['vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const units = ['um', 'uma', 'dois', 'duas', 'três', 'tres', 'quatro', 'cinco', 'seis', 'meia', 'sete', 'oito', 'nove'];
  
  for (const t of tens) {
    for (const u of units) {
      const reg = new RegExp(`\\b${t}\\s+e\\s+${u}\\b`, 'gi');
      const val = PORTUGUESE_NUMBERS[t] + PORTUGUESE_NUMBERS[u];
      res = res.replace(reg, String(val));
    }
  }

  // Trata números simples
  for (const [word, val] of Object.entries(PORTUGUESE_NUMBERS)) {
    const reg = new RegExp(`\\b${word}\\b`, 'gi');
    res = res.replace(reg, String(val));
  }

  return res;
}

/**
 * Parser Local Inteligente de Alta Precisão (Offline First)
 * Extrai placa, motorista, destino e lista de materiais sem depender de conexão externa.
 */
export function parseSpokenTextLocally(text, knownVehicles = []) {
  if (!text || !text.trim()) return null;

  const result = {
    origem: null,
    motorista: '',
    placa: '',
    empresa: '',
    destino: '',
    itens: [],
    observacoes_gerais: ''
  };

  let working = ' ' + text.trim() + ' ';
  const phrasesToRemove = [];

  // 1. Origem (UHE Estrela ou PCH Taboca)
  if (/uhe\s*estrela|estrela/i.test(working)) {
    result.origem = 'UHE Estrela';
    const m = working.match(/\b(?:uhe\s*estrela|canteiro\s*estrela|estrela)\b/i);
    if (m) phrasesToRemove.push(m[0]);
  } else if (/pch\s*taboca|taboca/i.test(working)) {
    result.origem = 'PCH Taboca';
    const m = working.match(/\b(?:pch\s*taboca|canteiro\s*taboca|taboca)\b/i);
    if (m) phrasesToRemove.push(m[0]);
  }

  // 2. Empresa / Transportadora
  if (/gel\s+engenharia|\bgel\b|propria|própria/i.test(working)) {
    result.empresa = 'GEL Engenharia';
    const m = working.match(/\b(?:empresa|transportadora)?\s*(?:gel\s+engenharia|\bgel\b|propria|própria)\b/i);
    if (m) phrasesToRemove.push(m[0]);
  }

  // 3. Local de Destino
  const destMatch = working.match(/\b(?:destino|indo\s+para|para\s+o|para\s+a|com\s+destino\s+a)\s+([a-zA-ZÀ-ÿ0-9\s-]{3,30}?)(?=\s*(?:,|\blevando\b|\bplaca\b|\bmotorista\b|\bcom\s+carga\b|$))/i);
  if (destMatch) {
    result.destino = destMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase());
    phrasesToRemove.push(destMatch[0]);
  }

  // 4. Placa do Veículo
  // Captura após a palavra "placa", "veículo" ou padrão isolado
  const plateMatch = working.match(/\b(?:placa|veículo|veiculo|caminhão|caminhao|saiu\s+na\s+placa|na\s+placa)\s*:?\s*([A-Za-z0-9\s-]{6,25})(?=\s*(?:,|\btá\b|\bta\b|\besta\b|\bestá\b|\blevando\b|\bcom\b|\bvai\b|\bmotorista\b|\bdestino\b|$))/i);
  let rawPlateCandidate = '';
  
  if (plateMatch) {
    phrasesToRemove.push(plateMatch[0]);
    rawPlateCandidate = plateMatch[1];
  } else {
    // Procura por padrão estrito Mercosul (ex: BRA2E19) ou Antigo (ex: ABC1234)
    const strictPlate = working.match(/\b([A-Za-z]{3}\s*[\d]\s*[A-Za-z0-9]\s*[\d]{2,3})\b/);
    if (strictPlate) {
      phrasesToRemove.push(strictPlate[0]);
      rawPlateCandidate = strictPlate[1];
    }
  }

  if (rawPlateCandidate) {
    let p = rawPlateCandidate.toUpperCase()
      .replace(/\b(UM|UMA)\b/g, '1')
      .replace(/\b(DOIS|DUAS)\b/g, '2')
      .replace(/\b(TRES|TRÊS)\b/g, '3')
      .replace(/\b(QUATRO)\b/g, '4')
      .replace(/\b(CINCO)\b/g, '5')
      .replace(/\b(SEIS|MEIA)\b/g, '6')
      .replace(/\b(SETE)\b/g, '7')
      .replace(/\b(OITO)\b/g, '8')
      .replace(/\b(NOVE)\b/g, '9')
      .replace(/\b(ZERO)\b/g, '0')
      .replace(/\b(DE|DÊ)\b/g, 'D')
      .replace(/[^A-Z0-9]/g, '');

    if (/^[A-Z]{3}/.test(p)) {
      // Padrão Mercosul: 3 letras + 1 dígito + 1 letra + 2 dígitos (ex: ABC1D31)
      const mercMatch = p.match(/^([A-Z]{3})(\d)([A-Z])(\d{2})/);
      if (mercMatch) {
        result.placa = `${mercMatch[1]}${mercMatch[2]}${mercMatch[3]}${mercMatch[4]}`;
      } else {
        // Padrão Antigo: 3 letras + 4 dígitos (ex: ABC1234)
        const antMatch = p.match(/^([A-Z]{3})(\d{4})/);
        if (antMatch) {
          result.placa = `${antMatch[1]}-${antMatch[2]}`;
        } else if (p.length >= 7) {
          result.placa = formatPlate(p.slice(0, 7));
        }
      }
    }
  }

  // 5. Motorista
  // a) Procura primeiro se falou "motorista [Nome]" ou "condutor [Nome]"
  const driverMatch = working.match(/\b(?:motorista|condutor)\s*(?:é|de\s+nome)?\s*([a-zA-ZÀ-ÿ\s]{3,30}?)(?=\s*(?:,|\bplaca\b|\btá\b|\bta\b|\besta\b|\bestá\b|\blevando\b|\bcom\b|\bvai\b|\bdestino\b|\d|$))/i);
  if (driverMatch && driverMatch[1]) {
    result.motorista = driverMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase());
    phrasesToRemove.push(driverMatch[0]);
  } else {
    // b) Se a frase começou direto com o nome do motorista antes da placa ou ação:
    // Ex: "Eduardo Francisco placa ABC1D310..."
    const beforeActionMatch = working.match(/^\s*([A-ZÀ-ÿa-zà-ÿ]{3,15}\s+[A-ZÀ-ÿa-zà-ÿ]{3,15})\s+(?:placa|com\s+a\s+placa|saiu|vai|levando)/i);
    if (beforeActionMatch) {
      result.motorista = beforeActionMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase());
      phrasesToRemove.push(beforeActionMatch[1]);
    } else {
      // c) Cruza com a lista de motoristas já cadastrados no sistema
      for (const v of knownVehicles) {
        if (v.motorista && working.toLowerCase().includes(v.motorista.toLowerCase())) {
          result.motorista = v.motorista;
          phrasesToRemove.push(v.motorista);
          break;
        }
      }
    }
  }

  // Se identificou a placa mas não achou o motorista, tenta cruzar com veículos cadastrados
  if (!result.motorista && result.placa && knownVehicles && knownVehicles.length > 0) {
    const cleanP = result.placa.replace(/[^A-Z0-9]/g, '');
    const matchedV = knownVehicles.find(v => v.placa && v.placa.replace(/[^A-Z0-9]/g, '') === cleanP);
    if (matchedV && matchedV.motorista) {
      result.motorista = matchedV.motorista;
    }
  }

  // 6. Extração de Materiais (com MASCARAMENTO de tudo que já foi extraído!)
  let cargoClean = working;
  for (const phrase of phrasesToRemove) {
    if (phrase && phrase.trim()) {
      cargoClean = cargoClean.replace(phrase, ' ');
    }
  }

  // Remove verbos parasitas de transporte
  cargoClean = cargoClean.replace(/\b(?:tá|ta|esta|está|vai|foi|saiu|saindo|com\s+a)?\s*(?:levando|carregando|transportando|com\s+carga\s+de|com\s+carga|saída\s+de|saiu\s+com|com)\b/gi, ' ');

  // Normaliza números ("três sacos" -> "3 sacos")
  cargoClean = normalizeNumbersInText(cargoClean);

  const unitPatterns = '(?:sacos?|scs?|sc|sacas?|barras?|peças?|pçs?|pcs?|pç|pc|unidades?|un|metros?\\s*cúbicos?|m3|m³|metros?|m\\b|quilos?|kg|toneladas?|ton|caixas?|cx|cxs?|tambores?|tb|fardos?|fd|latas?|galões?|galão|litros?|l\\b|tubos?)';
  const itemRegex = new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*(${unitPatterns})?\\s*(?:de\\s+)?([a-zA-ZÀ-ÿ0-9\\s/.-]{2,35}?)(?=(?:,|\\be\\b|\\bmais\\b|\\d+|$)|\$)`, 'gi');

  let m;
  while ((m = itemRegex.exec(cargoClean)) !== null) {
    const rawQty = m[1].replace(',', '.');
    const rawUnit = (m[2] || '').toLowerCase().trim();
    let rawMat = m[3].trim().replace(/^(?:de\s+)/i, '').replace(/[,.;]$/, '').trim();

    if (rawMat.length >= 2 && !/^(?:e|mais|com|para)$/i.test(rawMat)) {
      let unit = 'un';
      if (/saco|sc|saca/i.test(rawUnit)) unit = 'sc';
      else if (/barra/i.test(rawUnit)) unit = 'barra';
      else if (/cúbico|cubico|m3|m³/i.test(rawUnit)) unit = 'm³';
      else if (/peça|pç|pc/i.test(rawUnit)) unit = 'pç';
      else if (/tambor/i.test(rawUnit)) unit = 'tb';
      else if (/fardo|fd/i.test(rawUnit)) unit = 'fd';
      else if (/tonelada|ton/i.test(rawUnit)) unit = 'ton';
      else if (/caixa|cx/i.test(rawUnit)) unit = 'cx';
      else if (/quilo|kg/i.test(rawUnit)) unit = 'kg';
      else if (/metro|m\b/i.test(rawUnit)) unit = 'm';
      else if (/lata|galão|litro|l\b/i.test(rawUnit)) unit = 'l';
      else if (/tubo/i.test(rawUnit)) {
        unit = 'un';
        if (!/tubo/i.test(rawMat)) rawMat = `Tubo de ${rawMat}`;
      }

      result.itens.push({
        id: Date.now() + Math.random(),
        material: rawMat.replace(/\b\w/g, c => c.toUpperCase()),
        quantidade: Number(rawQty) || 1,
        unidade: unit,
        observacao: ''
      });
    }
  }

  // Fallback caso sobrou texto sem número explícito
  if (result.itens.length === 0) {
    const fallbackMat = cargoClean.trim().replace(/\s+/g, ' ');
    if (fallbackMat.length >= 2) {
      result.itens.push({
        id: Date.now(),
        material: fallbackMat.replace(/\b\w/g, c => c.toUpperCase()),
        quantidade: 1,
        unidade: 'un',
        observacao: ''
      });
    }
  }

  return result;
}

/**
 * Processa a fala com a API do Google Gemini 1.5 Flash
 * Se não houver chave ou der erro de rede, utiliza o Parser Local Inteligente como contingência.
 */
export async function parseSpokenRomaneioWithGemini(spokenText, currentOrigem = 'UHE Estrela', knownVehicles = []) {
  if (!spokenText || !spokenText.trim()) {
    throw new Error('Nenhum texto de voz informado.');
  }

  const apiKey = getSavedGeminiKey();

  // Se o usuário não configurou a chave da API Gemini, executa o parser local inteligente
  if (!apiKey) {
    console.log('ℹ️ Usando Parser Local Inteligente Avançado');
    const localParsed = parseSpokenTextLocally(spokenText, knownVehicles);
    return {
      ...localParsed,
      usedEngine: 'local_nlp'
    };
  }

  const systemInstruction = `Você é o assistente inteligente de portaria e almoxarifado da empresa de engenharia GEL (Goetze Lobato Engenharia S.A.) nos canteiros UHE Estrela e PCH Taboca.
Sua função é receber uma frase falada por um conferente da portaria e extrair os dados organizados em JSON para preencher o Romaneio de Saída de Materiais.

Regras Estritas de Extração:
1. "origem": deve ser exatamente "UHE Estrela" ou "PCH Taboca". Se o usuário não citar, mantenha "${currentOrigem}".
2. "motorista": Nome completo do motorista (capitalizado, ex: "Eduardo Francisco", "Carlos Silva"). Se citado antes da placa ou sem a palavra motorista, identifique o nome da pessoa.
3. "placa": Placa do veículo. Converta falas soletradas (ex: "bê érre á dois é dezenove", "bra 2 e 19", "ABC1D310", "abc 1 d 31") no formato padrão Mercosul (ex: "ABC1D31") ou antigo (ex: "ABC-1234"). Retorne sempre em letras maiúsculas e sem espaços.
4. "empresa": Nome da transportadora ou empresa. Se falar "gel" ou "própria", coloque "GEL Engenharia".
5. "destino": Local para onde a carga está sendo enviada (ex: "Frente de Barragem", "Almoxarifado Central", "Oficina Mecânica").
6. "itens": Lista de materiais. Para cada item:
   - "material": Nome padronizado do material (ex: "Cimento CP-II", "Barra de Aço CA-50", "Tubo PVC 100mm"). Remova palavras como "levando", "tá levando", "carga de".
   - "quantidade": Número (ex: se falado "três sacos", quantidade é 3; se falado "dez barras", quantidade é 10).
   - "unidade": Unidade de medida correspondente: "un", "kg", "m³", "sc", "barra", "pç", "tb", "fd", "ton", "cx".
   - "observacao": Nota fiscal, lote ou detalhe citado para o item, ou vazio "".
7. "observacoes_gerais": Qualquer detalhe adicional da liberação.

Formato de Resposta Obrigatório:
Retorne APENAS um objeto JSON válido, sem crases de código e sem texto antes ou depois, seguindo esta estrutura:
{
  "origem": "UHE Estrela",
  "motorista": "Eduardo Francisco",
  "placa": "ABC1D31",
  "empresa": "GEL Engenharia",
  "destino": "Frente de Barragem",
  "itens": [
    { "material": "Cimento CP-II", "quantidade": 3, "unidade": "sc", "observacao": "" }
  ],
  "observacoes_gerais": ""
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: systemInstruction },
          { text: `Texto falado pelo porteiro:\n"${spokenText}"` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json'
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Erro na API do Gemini (${response.status})`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('A IA não retornou resposta.');
    }

    const parsedJson = JSON.parse(candidateText.trim());

    // Assegura IDs únicos para os itens
    if (parsedJson.itens && Array.isArray(parsedJson.itens)) {
      parsedJson.itens = parsedJson.itens.map((it, idx) => ({
        id: Date.now() + idx,
        material: it.material || 'Material',
        quantidade: Number(it.quantidade) || 1,
        unidade: it.unidade || 'un',
        observacao: it.observacao || ''
      }));
    }

    return {
      ...parsedJson,
      usedEngine: 'gemini_flash'
    };
  } catch (err) {
    console.warn('⚠️ Falha na API do Gemini, acionando contingência do Parser Local:', err);
    const fallbackParsed = parseSpokenTextLocally(spokenText, knownVehicles);
    return {
      ...fallbackParsed,
      usedEngine: 'local_nlp_fallback',
      warning: `Gemini indisponível (${err.message}). Processado pelo motor local inteligente.`
    };
  }
}
