// Utilitário de Inteligência Artificial para Processamento de Voz e Extração Estruturada de Romaneios
import { cleanPlate, formatPlate } from './plateUtils';

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

/**
 * Parser Local Inteligente (Offline First - funciona sem chave de API)
 * Utiliza Expressões Regulares avançadas para capturar placa, motorista, destino e materiais falados em português.
 */
export function parseSpokenTextLocally(text) {
  if (!text) return null;
  const raw = text.toLowerCase();
  const result = {
    origem: null,
    motorista: '',
    placa: '',
    empresa: '',
    destino: '',
    itens: [],
    observacoes_gerais: ''
  };

  // 1. Origem (UHE Estrela ou PCH Taboca)
  if (raw.includes('estrela') || raw.includes('uhe')) {
    result.origem = 'UHE Estrela';
  } else if (raw.includes('taboca') || raw.includes('pch')) {
    result.origem = 'PCH Taboca';
  }

  // 2. Placa do Veículo
  // Trata falas como "placa bra 2 e 19", "placa abc 1234", "bê érre á dois é dezenove", etc.
  let plateCandidate = '';
  const plateMatch = text.match(/placa\s*:?\s*([a-zA-Z0-9\s-]{7,10})/i);
  if (plateMatch) {
    plateCandidate = plateMatch[1].replace(/[^a-zA-Z0-9]/g, '').slice(0, 7);
  } else {
    // Busca padrão genérico de 3 letras e 4 números/letras (ex: BRA2E19 ou ABC1234)
    const genericPlateMatch = text.match(/\b([a-zA-Z]{3}\s*[-]?\s*[0-9]\s*[a-zA-Z0-9]\s*[0-9]{2})\b/);
    if (genericPlateMatch) {
      plateCandidate = genericPlateMatch[1].replace(/[^a-zA-Z0-9]/g, '').slice(0, 7);
    }
  }

  if (plateCandidate.length >= 7) {
    result.placa = formatPlate(plateCandidate);
  }

  // 3. Motorista
  const driverMatch = text.match(/(?:motorista|condutor)\s*(?:é|foi|será|chamado|de nome)?\s*([a-zA-ZÀ-ÿ\s]{3,35}?)(?=\s*(?:,|placa|levando|indo|destino|empresa|com carga|$))/i);
  if (driverMatch && driverMatch[1]) {
    result.motorista = driverMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase());
  }

  // 4. Empresa / Transportadora
  if (raw.includes('gel') || raw.includes('própria') || raw.includes('propria')) {
    result.empresa = 'GEL Engenharia';
  } else {
    const empMatch = text.match(/(?:empresa|transportadora)\s*(?:é|da)?\s*([a-zA-ZÀ-ÿ0-9\s]{3,25}?)(?=\s*(?:,|placa|motorista|levando|indo|destino|$))/i);
    if (empMatch && empMatch[1]) {
      result.empresa = empMatch[1].trim();
    }
  }

  // 5. Destino
  const destMatch = text.match(/(?:destino|indo para|para o|para a|com destino a)\s*([a-zA-ZÀ-ÿ0-9\s]{3,40}?)(?=\s*(?:,|levando|placa|motorista|com carga|$))/i);
  if (destMatch && destMatch[1]) {
    result.destino = destMatch[1].trim();
  }

  // 6. Itens / Materiais
  // Padrões como: "50 sacos de cimento", "10 barras de aço", "3 viagens de brita", "100 tubos"
  const itemRegex = /(\d+(?:[.,]\d+)?)\s*(sacos?|sc|barras?|metros?\s*cúbicos?|m³|unidades?|un|peças?|pç|tambores?|tb|fardos?|fd|toneladas?|ton|caixas?|cx)?\s*(?:de\s+)?([a-zA-ZÀ-ÿ0-9\s/.-]{3,40}?)(?=(?:,|\be\b|\bcom\b|\bmais\b|\bitem\b|$))/gi;

  let match;
  while ((match = itemRegex.exec(text)) !== null) {
    const rawQty = match[1].replace(',', '.');
    const rawUnit = (match[2] || '').toLowerCase().trim();
    const rawMat = match[3].trim();

    if (rawMat.length > 2) {
      let unit = 'un';
      if (rawUnit.includes('saco') || rawUnit === 'sc') unit = 'sc';
      else if (rawUnit.includes('barra')) unit = 'barra';
      else if (rawUnit.includes('metro') || rawUnit === 'm³') unit = 'm³';
      else if (rawUnit.includes('peça') || rawUnit === 'pç') unit = 'pç';
      else if (rawUnit.includes('tambor') || rawUnit === 'tb') unit = 'tb';
      else if (rawUnit.includes('fardo') || rawUnit === 'fd') unit = 'fd';
      else if (rawUnit.includes('tonelada') || rawUnit === 'ton') unit = 'ton';
      else if (rawUnit.includes('caixa') || rawUnit === 'cx') unit = 'cx';
      else if (rawUnit.includes('quilo') || rawUnit.includes('kg')) unit = 'kg';

      result.itens.push({
        id: Date.now() + Math.random(),
        material: rawMat.replace(/\b\w/g, c => c.toUpperCase()),
        quantidade: Number(rawQty) || 1,
        unidade: unit,
        observacao: ''
      });
    }
  }

  // Se não achou materiais formatados mas tem texto
  if (result.itens.length === 0 && raw.includes('levando')) {
    const afterLevando = text.split(/levando/i)[1];
    if (afterLevando) {
      result.itens.push({
        id: Date.now(),
        material: afterLevando.trim(),
        quantidade: 1,
        unidade: 'un',
        observacao: ''
      });
    }
  }

  return result;
}

/**
 * Processa a fala com a API do Google Gemini 1.5 Flash (A melhor precisão do mundo)
 * Se não houver chave ou der erro de rede, utiliza o Parser Local Inteligente como contingência.
 */
export async function parseSpokenRomaneioWithGemini(spokenText, currentOrigem = 'UHE Estrela') {
  if (!spokenText || !spokenText.trim()) {
    throw new Error('Nenhum texto de voz informado.');
  }

  const apiKey = getSavedGeminiKey();

  // Se o usuário não configurou a chave da API Gemini, executa o parser local inteligente
  if (!apiKey) {
    console.log('ℹ️ Usando Parser Local Inteligente (Configure a chave do Gemini para IA avançada)');
    const localParsed = parseSpokenTextLocally(spokenText);
    return {
      ...localParsed,
      usedEngine: 'local_nlp'
    };
  }

  const systemInstruction = `Você é o assistente inteligente de portaria e almoxarifado da empresa de engenharia GEL (Goetze Lobato Engenharia S.A.) nos canteiros UHE Estrela e PCH Taboca.
Sua função é receber uma frase falada por um conferente da portaria e extrair os dados organizados em JSON para preencher o Romaneio de Saída de Materiais.

Regras Estritas de Extração:
1. "origem": deve ser exatamente "UHE Estrela" ou "PCH Taboca". Se o usuário não citar, mantenha "${currentOrigem}".
2. "motorista": Nome completo do motorista (capitalizado).
3. "placa": Placa do veículo. Converta falas soletradas (ex: "bê érre á dois é dezenove", "bra 2 e 19") no formato padrão Mercosul (ex: "BRA2E19") ou antigo (ex: "ABC-1234"). Retorne sempre em letras maiúsculas e sem espaços.
4. "empresa": Nome da transportadora ou empresa. Se falar "gel" ou "própria", coloque "GEL Engenharia".
5. "destino": Local para onde a carga está sendo enviada (ex: "Frente de Barragem", "Almoxarifado Central", "Oficina Mecânica").
6. "itens": Lista de materiais. Para cada item:
   - "material": Nome padronizado do material (ex: "Cimento CP-II", "Barra de Aço CA-50 12mm", "Tubo PVC 100mm").
   - "quantidade": Número (ex: 50, 10.5).
   - "unidade": Unidade de medida correspondente: "un", "kg", "m³", "sc", "barra", "pç", "tb", "fd", "ton", "cx".
   - "observacao": Nota fiscal, lote ou detalhe citado para o item, ou vazio "".
7. "observacoes_gerais": Qualquer detalhe adicional da liberação.

Formato de Resposta Obrigatório:
Retorne APENAS um objeto JSON válido, sem crases de código e sem texto antes ou depois, seguindo esta estrutura:
{
  "origem": "UHE Estrela",
  "motorista": "Carlos Eduardo Silva",
  "placa": "BRA2E19",
  "empresa": "GEL Engenharia",
  "destino": "Frente de Barragem",
  "itens": [
    { "material": "Cimento CP-II 50kg", "quantidade": 50, "unidade": "sc", "observacao": "" }
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
    const fallbackParsed = parseSpokenTextLocally(spokenText);
    return {
      ...fallbackParsed,
      usedEngine: 'local_nlp_fallback',
      warning: `Gemini indisponível (${err.message}). Processado pelo motor local.`
    };
  }
}
