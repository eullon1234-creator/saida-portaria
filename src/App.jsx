import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import OrigemSelector from './components/OrigemSelector';
import RomaneioForm from './components/RomaneioForm';
import PrintModal from './components/PrintModal';
import HistoryModal from './components/HistoryModal';
import VeiculosModal from './components/VeiculosModal';
import FirebaseModal from './components/FirebaseModal';
import InstallPromptModal from './components/InstallPromptModal';
import { 
  getAllVehiclesDrivers, 
  getAllRomaneios, 
  saveRomaneio, 
  deleteRomaneioById,
  isUsingFirebase 
} from './firebase';
import { generateRomaneioNumber } from './utils/plateUtils';
import { ShieldCheck, HardHat, FileSpreadsheet, Sparkles, Download, Smartphone, X } from 'lucide-react';

function getNowLocalDateTime() {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
}

export default function App() {
  const [origem, setOrigem] = useState('UHE Estrela');
  const [vehiclesList, setVehiclesList] = useState([]);
  const [romaneiosList, setRomaneiosList] = useState([]);
  
  // Modais
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isVehiclesModalOpen, setIsVehiclesModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [showMobileInstallBanner, setShowMobileInstallBanner] = useState(true);
  const [selectedRomaneioToPrint, setSelectedRomaneioToPrint] = useState(null);

  // PWA Prompt
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detecta se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
      setShowMobileInstallBanner(false);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('📱 PWA beforeinstallprompt capturado!');
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowMobileInstallBanner(false);
      console.log('🎉 Aplicativo Portaria GEL instalado com sucesso!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Estado do Formulário Principal
  const [formData, setFormData] = useState({
    numero_romaneio: '',
    origem: 'UHE Estrela',
    data_hora: getNowLocalDateTime(),
    empresa: 'GEL Engenharia',
    destino: '',
    motorista: '',
    placa: '',
    itens: [
      { id: 1, material: '', quantidade: '', unidade: 'un', observacao: '' }
    ],
    observacoes_gerais: '',
    conferente_portaria: 'Portaria Principal'
  });

  // Carrega dados iniciais
  const loadData = async () => {
    try {
      const [vehicles, romaneios] = await Promise.all([
        getAllVehiclesDrivers(),
        getAllRomaneios()
      ]);
      setVehiclesList(vehicles);
      setRomaneiosList(romaneios);

      // Gera o número inicial do romaneio
      const count = romaneios.length + 1;
      setFormData(prev => ({
        ...prev,
        numero_romaneio: prev.numero_romaneio || generateRomaneioNumber(origem, count)
      }));
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Ao alterar a Origem (UHE Estrela ou PCH Taboca)
  const handleOrigemChange = (newOrigem) => {
    setOrigem(newOrigem);
    const count = romaneiosList.length + 1;
    const newNumero = generateRomaneioNumber(newOrigem, count);
    setFormData(prev => ({
      ...prev,
      origem: newOrigem,
      numero_romaneio: newNumero
    }));
  };

  // Reseta o formulário para um novo atendimento
  const handleResetForm = () => {
    const count = romaneiosList.length + 1;
    const newNumero = generateRomaneioNumber(origem, count);
    setFormData({
      numero_romaneio: newNumero,
      origem: origem,
      data_hora: getNowLocalDateTime(),
      empresa: 'GEL Engenharia',
      destino: '',
      motorista: '',
      placa: '',
      itens: [
        { id: Date.now(), material: '', quantidade: '', unidade: 'un', observacao: '' }
      ],
      observacoes_gerais: '',
      conferente_portaria: 'Portaria Principal'
    });
  };

  // Salvar e Emitir Romaneio
  const handleSaveAndPrint = async (dataToSave) => {
    try {
      const saved = await saveRomaneio(dataToSave);
      
      // Atualiza listas em memória
      const [vehicles, romaneios] = await Promise.all([
        getAllVehiclesDrivers(),
        getAllRomaneios()
      ]);
      setVehiclesList(vehicles);
      setRomaneiosList(romaneios);

      // Abre o comprovante de 2 vias para impressão
      setSelectedRomaneioToPrint(saved);
      setIsPrintModalOpen(true);
    } catch (err) {
      console.error('Erro ao salvar romaneio:', err);
      alert('Erro ao gravar dados: ' + err.message);
    }
  };

  // Excluir romaneio
  const handleDeleteRomaneio = async (id) => {
    await deleteRomaneioById(id);
    const romaneios = await getAllRomaneios();
    setRomaneiosList(romaneios);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      {/* Barra de Navegação Superior */}
      <Header
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenVehicles={() => setIsVehiclesModalOpen(true)}
        onOpenFirebase={() => setIsFirebaseModalOpen(true)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
        onNewRomaneio={handleResetForm}
        romaneiosCount={romaneiosList.length}
      />

      {/* Banner de Instalação para Celular e Tablet */}
      {!isInstalled && showMobileInstallBanner && (
        <div className="no-print bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-3 sm:px-6 py-2.5 shadow-md flex items-center justify-between gap-3 border-b-2 border-amber-600">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black">
            <Smartphone className="w-5 h-5 shrink-0 text-slate-900 animate-bounce" />
            <span>Instale o aplicativo na tela do seu celular ou tablet para uso rápido na portaria!</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="px-3.5 py-1.5 bg-slate-950 text-white hover:bg-slate-900 rounded-xl text-xs font-black transition active:scale-95 shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Baixar App</span>
            </button>
            <button
              onClick={() => setShowMobileInstallBanner(false)}
              className="p-1 hover:bg-black/10 rounded-lg text-slate-950 cursor-pointer"
              title="Dispensar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="no-print flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
        
        {/* Banner de Identificação da Portaria & Legibilidade */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-2xl p-4 sm:p-5 shadow-md border-l-8 border-amber-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-400">
              <HardHat className="w-4 h-4" />
              <span>GEL • Goetze Lobato Engenharia S.A.</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
              Controle de Saída e Emissão de Romaneio
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-medium">
              Emissão de comprovante em <strong>2 vias na mesma folha A4</strong> com logotipo oficial, busca dinâmica de veículos/motoristas e registro de cargas em canteiro de obras.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/20 text-center sm:text-right shrink-0">
            <span className="text-[11px] uppercase font-bold text-amber-300 block">Número do Próximo Romaneio</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-white">
              {formData.numero_romaneio || 'EST-2026-0001'}
            </span>
          </div>
        </div>

        {/* 1. SELETOR DE ORIGEM (UHE ESTRELA OU PCH TABOCA) */}
        <OrigemSelector
          origem={origem}
          onChange={handleOrigemChange}
        />

        {/* 2 & 3. FORMULÁRIO COMPLETO DE DADOS E ITENS */}
        <RomaneioForm
          formData={formData}
          setFormData={setFormData}
          vehiclesList={vehiclesList}
          onSaveAndPrint={handleSaveAndPrint}
          onResetForm={handleResetForm}
        />
      </main>

      {/* MODAL DE IMPRESSÃO (2 VIAS EM 1 FOLHA A4 COM LOGO GEL) */}
      {isPrintModalOpen && (
        <PrintModal
          romaneio={selectedRomaneioToPrint}
          onClose={() => setIsPrintModalOpen(false)}
          onNewRomaneio={handleResetForm}
        />
      )}

      {/* MODAL DE HISTÓRICO DE ROMANEIOS */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        romaneiosList={romaneiosList}
        onSelectRomaneioToPrint={(rom) => {
          setSelectedRomaneioToPrint(rom);
          setIsPrintModalOpen(true);
        }}
        onDeleteRomaneio={handleDeleteRomaneio}
      />

      {/* MODAL DE CADASTRO DE VEÍCULOS E MOTORISTAS */}
      <VeiculosModal
        isOpen={isVehiclesModalOpen}
        onClose={() => setIsVehiclesModalOpen(false)}
        vehiclesList={vehiclesList}
        onRefreshVehicles={async () => {
          const list = await getAllVehiclesDrivers();
          setVehiclesList(list);
        }}
      />

      {/* MODAL DE CONFIGURAÇÃO DO FIREBASE */}
      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />

      {/* MODAL DE INSTALAÇÃO DO APLICATIVO */}
      <InstallPromptModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallSuccess={() => setIsInstalled(true)}
      />

      {/* Rodapé institucional */}
      <footer className="no-print mt-auto py-4 bg-slate-900 text-slate-400 text-xs border-t border-slate-800 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>GEL - Goetze Lobato Engenharia S.A. &copy; {new Date().getFullYear()}</span>
          <span>Sistema de Controle de Portaria • Canteiros UHE Estrela & PCH Taboca</span>
          <span className="text-[11px] text-amber-500 font-mono font-bold">Versão 1.0 (Mobile & Tablet Portaria)</span>
        </div>
      </footer>
    </div>
  );
}
