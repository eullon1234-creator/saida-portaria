// Utilitários para Formatação e Validação de Placas (Mercosul e Tradicional)

/**
 * Remove caracteres especiais e espaços, mantendo apenas letras e números em maiúsculas
 */
export function cleanPlate(value) {
  if (!value) return '';
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
}

/**
 * Formata a placa dinamicamente enquanto o usuário digita:
 * - Se padrão antigo (3 letras + 4 números): AAA-1234
 * - Se padrão Mercosul (3 letras + 1 número + 1 letra + 2 números): AAA1B23
 */
export function formatPlate(value) {
  const clean = cleanPlate(value);
  if (!clean) return '';

  // Se tem até 3 caracteres, retorna eles
  if (clean.length <= 3) {
    return clean;
  }

  // Verifica o 5º caractere (índice 4) se já foi digitado:
  // Se for letra -> Mercosul (ex: BRA2E19)
  // Se for número -> Padrão Antigo (ex: ABC-1234)
  if (clean.length >= 5) {
    const fifthChar = clean[4];
    const isLetter = /[A-Z]/.test(fifthChar);

    if (!isLetter) {
      // Padrão antigo: AAA-1234
      return `${clean.slice(0, 3)}-${clean.slice(3, 7)}`;
    }
  }

  // Se tem mais de 3 caracteres mas ainda não temos certeza ou é Mercosul
  // No padrão antigo com 4 caracteres: ABC1 -> ABC-1
  if (clean.length > 3 && clean.length <= 4) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }

  return clean;
}

/**
 * Valida se a placa é válida no padrão Mercosul ou Antigo
 */
export function isValidPlate(plate) {
  const clean = cleanPlate(plate);
  if (clean.length !== 7) return false;

  const regexMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  const regexAntiga = /^[A-Z]{3}[0-9]{4}$/;

  return regexMercosul.test(clean) || regexAntiga.test(clean);
}

/**
 * Gera número de romaneio sequencial legível com prefixo da obra
 * Ex: EST-2026-0042 ou TAB-2026-0015
 */
export function generateRomaneioNumber(origem, currentCount = 1) {
  const prefix = origem.includes('Estrela') ? 'EST' : 'TAB';
  const year = new Date().getFullYear();
  const seq = String(currentCount).padStart(4, '0');
  const randomSuffix = Math.floor(100 + Math.random() * 900); // 3 dígitos aleatórios para unicidade
  return `${prefix}-${year}-${seq}`;
}
