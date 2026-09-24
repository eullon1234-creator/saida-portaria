// Integração com Firebase / Firestore + Modo de Armazenamento Resiliente Local
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp, 
  deleteDoc 
} from 'firebase/firestore';
import { cleanPlate } from './utils/plateUtils';

// Chave para armazenar configurações do Firebase no navegador
const FB_CONFIG_KEY = 'gel_portaria_firebase_config';
const LOCAL_VEHICLES_KEY = 'gel_portaria_veiculos_motoristas';
const LOCAL_ROMANEIOS_KEY = 'gel_portaria_romaneios_saida';

// Dados iniciais de demonstração para funcionamento imediato
const INITIAL_VEHICLES = [
  {
    id: 'vm-01',
    placa: 'BRA2E19',
    nome_motorista: 'Carlos Eduardo Santos',
    empresa_padrao: 'GEL Engenharia',
    atualizado_em: new Date().toISOString()
  },
  {
    id: 'vm-02',
    placa: 'OXH8421',
    nome_motorista: 'João Batista da Silva',
    empresa_padrao: 'TransOeste Cargas',
    atualizado_em: new Date().toISOString()
  },
  {
    id: 'vm-03',
    placa: 'RCO3F45',
    nome_motorista: 'Marcos Vinícius de Souza',
    empresa_padrao: 'Transportadora Estrela',
    atualizado_em: new Date().toISOString()
  },
  {
    id: 'vm-04',
    placa: 'NXZ4580',
    nome_motorista: 'Antônio Ferreira Lima',
    empresa_padrao: 'Logística Taboca',
    atualizado_em: new Date().toISOString()
  }
];

// Configuração Padrão do Firebase do Projeto "saida-portaria"
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCR8Doak8n9L8iVvqPzp8BerojBK4mHMJU",
  authDomain: "saida-portaria.firebaseapp.com",
  projectId: "saida-portaria",
  storageBucket: "saida-portaria.firebasestorage.app",
  messagingSenderId: "148114562479",
  appId: "1:148114562479:web:a314d1828a1a90d7abe35a",
  measurementId: "G-4LTHEDZN5G"
};

// Obtém configuração atual do Firebase (do localStorage, .env ou padrão do projeto)
export function getSavedFirebaseConfig() {
  try {
    const saved = localStorage.getItem(FB_CONFIG_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Erro ao ler config do Firebase do localStorage:', e);
  }

  // Verifica se há variáveis de ambiente Vite
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
    };
  }

  return DEFAULT_FIREBASE_CONFIG;
}

// Salva nova configuração do Firebase
export function saveFirebaseConfig(config) {
  if (!config || !config.projectId) {
    localStorage.removeItem(FB_CONFIG_KEY);
  } else {
    localStorage.setItem(FB_CONFIG_KEY, JSON.stringify(config));
  }
  // Recarrega a página para reiniciar a instância limpa
  window.location.reload();
}

// Inicializa Firebase se configurado
let db = null;
let firebaseApp = null;
let isFirebaseActive = false;

try {
  const config = getSavedFirebaseConfig();
  if (config && config.projectId && config.apiKey) {
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(config);
    db = getFirestore(firebaseApp);
    isFirebaseActive = true;
    console.log('✅ Firebase Firestore conectado com sucesso:', config.projectId);
  } else {
    console.log('ℹ️ Firebase não configurado. Utilizando armazenamento local ultrarrápido (Offline First).');
  }
} catch (error) {
  console.warn('⚠️ Falha ao inicializar Firebase. Modo Local ativado:', error);
  isFirebaseActive = false;
  db = null;
}

export function isUsingFirebase() {
  return isFirebaseActive && db !== null;
}

// ==========================================
// FUNÇÕES PARA LOCALSTORAGE (CACHE / FALLBACK)
// ==========================================
function getLocalVehicles() {
  try {
    const data = localStorage.getItem(LOCAL_VEHICLES_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_VEHICLES_KEY, JSON.stringify(INITIAL_VEHICLES));
      return INITIAL_VEHICLES;
    }
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_VEHICLES;
  }
}

function saveLocalVehicles(vehicles) {
  try {
    localStorage.setItem(LOCAL_VEHICLES_KEY, JSON.stringify(vehicles));
  } catch (e) {
    console.error('Erro ao salvar veículos no localStorage:', e);
  }
}

function getLocalRomaneios() {
  try {
    const data = localStorage.getItem(LOCAL_ROMANEIOS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalRomaneios(romaneios) {
  try {
    localStorage.setItem(LOCAL_ROMANEIOS_KEY, JSON.stringify(romaneios));
  } catch (e) {
    console.error('Erro ao salvar romaneios no localStorage:', e);
  }
}

// ==========================================
// COLEÇÃO: veiculos_motoristas
// ==========================================
/**
 * Busca todos os registros de veículos e motoristas
 */
export async function getAllVehiclesDrivers() {
  if (isUsingFirebase()) {
    try {
      const q = query(collection(db, 'veiculos_motoristas'));
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Atualiza cache local
      if (list.length > 0) {
        saveLocalVehicles(list);
        return list;
      }
    } catch (err) {
      console.warn('Erro ao buscar veiculos_motoristas do Firestore, usando local:', err);
    }
  }
  return getLocalVehicles();
}

/**
 * Salva ou atualiza vínculo entre Placa e Motorista
 */
export async function saveOrUpdateDriverVehicle(placa, nomeMotorista, empresaPadrao = '') {
  if (!placa || !nomeMotorista) return null;
  const cleanP = cleanPlate(placa);
  const now = new Date().toISOString();

  const record = {
    placa: cleanP,
    nome_motorista: nomeMotorista.trim(),
    empresa_padrao: (empresaPadrao || '').trim(),
    atualizado_em: now
  };

  // Sempre atualiza o cache local
  const currentList = getLocalVehicles();
  const existingIndex = currentList.findIndex(v => cleanPlate(v.placa) === cleanP);
  let savedId = `vm_${cleanP}`;

  if (existingIndex >= 0) {
    savedId = currentList[existingIndex].id || savedId;
    currentList[existingIndex] = { ...currentList[existingIndex], ...record, id: savedId };
  } else {
    currentList.unshift({ id: savedId, ...record });
  }
  saveLocalVehicles(currentList);

  // Se o Firebase estiver ativo, salva no Firestore
  if (isUsingFirebase()) {
    try {
      const docRef = doc(db, 'veiculos_motoristas', cleanP);
      await setDoc(docRef, {
        ...record,
        id: cleanP,
        atualizado_em: serverTimestamp()
      }, { merge: true });
      console.log('✅ Veículo/Motorista sincronizado no Firestore:', cleanP);
    } catch (err) {
      console.error('Erro ao salvar veiculo no Firestore:', err);
    }
  }

  return record;
}

// ==========================================
// COLEÇÃO: romaneios_saida
// ==========================================
/**
 * Salva um novo romaneio de saída
 */
export async function saveRomaneio(romaneioData) {
  const cleanP = cleanPlate(romaneioData.placa);
  const dataHoraISO = romaneioData.data_hora 
    ? new Date(romaneioData.data_hora).toISOString() 
    : new Date().toISOString();

  const romaneioPayload = {
    numero_romaneio: romaneioData.numero_romaneio,
    origem: romaneioData.origem, // "UHE Estrela" ou "PCH Taboca"
    empresa: romaneioData.empresa?.trim() || '',
    destino: romaneioData.destino?.trim() || '',
    motorista: romaneioData.motorista?.trim() || '',
    placa: cleanP,
    itens: romaneioData.itens || [],
    data_hora: dataHoraISO,
    observacoes_gerais: romaneioData.observacoes_gerais || '',
    conferente_portaria: romaneioData.conferente_portaria || 'Portaria Principal'
  };

  // 1. Atualiza/cria o vínculo na tabela de veiculos_motoristas
  await saveOrUpdateDriverVehicle(cleanP, romaneioPayload.motorista, romaneioPayload.empresa);

  // 2. Salva localmente
  const localList = getLocalRomaneios();
  const idGerado = 'rom_' + Date.now();
  const fullRecord = {
    id: idGerado,
    ...romaneioPayload,
    criado_em: new Date().toISOString()
  };
  localList.unshift(fullRecord);
  saveLocalRomaneios(localList);

  // 3. Salva no Firestore se ativo
  if (isUsingFirebase()) {
    try {
      const docRef = await addDoc(collection(db, 'romaneios_saida'), {
        ...romaneioPayload,
        criado_em: serverTimestamp()
      });
      fullRecord.id = docRef.id;
      console.log('✅ Romaneio salvo no Firestore:', docRef.id);
    } catch (err) {
      console.error('Erro ao salvar romaneio no Firestore:', err);
    }
  }

  return fullRecord;
}

/**
 * Busca histórico de romaneios de saída
 */
export async function getAllRomaneios() {
  if (isUsingFirebase()) {
    try {
      const q = query(collection(db, 'romaneios_saida'), orderBy('criado_em', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        list.push({ 
          id: docSnap.id, 
          ...data,
          data_hora: data.data_hora || (data.criado_em ? new Date(data.criado_em.seconds * 1000).toISOString() : new Date().toISOString())
        });
      });
      if (list.length > 0) {
        saveLocalRomaneios(list);
        return list;
      }
    } catch (err) {
      console.warn('Erro ao buscar romaneios do Firestore, usando local:', err);
    }
  }
  return getLocalRomaneios();
}

/**
 * Exclui um romaneio
 */
export async function deleteRomaneioById(id) {
  // Remove do local
  const currentList = getLocalRomaneios().filter(r => r.id !== id);
  saveLocalRomaneios(currentList);

  // Remove do Firebase
  if (isUsingFirebase() && id && !id.startsWith('rom_')) {
    try {
      await deleteDoc(doc(db, 'romaneios_saida', id));
    } catch (err) {
      console.error('Erro ao remover do Firestore:', err);
    }
  }
  return true;
}
