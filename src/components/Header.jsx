import { Truck, History, Database, Users, PlusCircle, CheckCircle2, CloudOff, Download, Smartphone } from 'lucide-react';
import { isUsingFirebase } from '../firebase';
import logoGel from '../assets/logo-gel.png';

export default function Header({ 
  onOpenHistory, 
  onOpenVehicles, 
  onOpenFirebase, 
  onOpenInstall,
  onNewRomaneio,
  romaneiosCount = 0 
}) {
  const firebaseActive = isUsingFirebase();

  return (
    <header className="no-print bg-slate-900 text-white shadow-md border-b-4 border-amber-600 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo da GEL + Título do Sistema */}
        <div className="flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-lg shadow-sm flex items-center justify-center h-12 w-auto">
            <img 
              src={logoGel} 
              alt="GEL - Goetze Lobato Engenharia S.A." 
              className="h-9 w-auto object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Portaria & Expedição
              </span>
              {firebaseActive ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Firebase Online
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700" title="Dados salvos no navegador. Clique em Configurar Firebase para sincronizar na nuvem.">
                  <CloudOff className="w-3 h-3 text-slate-400" />
                  Modo Local
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              Romaneio de Saída de Materiais
            </h1>
          </div>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Botão Baixar / Instalar App */}
          <button
            onClick={onOpenInstall}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 transition active:scale-95 shadow-md border border-amber-300 animate-pulse hover:animate-none cursor-pointer"
            title="Baixar e Instalar Aplicativo no Celular ou Tablet"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Baixar App</span>
            <span className="sm:hidden">App</span>
          </button>

          <button
            onClick={onNewRomaneio}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95 shadow-sm"
            title="Limpar formulário e iniciar nova saída"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Nova Saída</span>
          </button>

          <button
            onClick={onOpenHistory}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95"
            title="Ver histórico de romaneios emitidos"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Histórico</span>
            {romaneiosCount > 0 && (
              <span className="bg-amber-500 text-slate-950 text-xs px-1.5 py-0.2 font-black rounded-full">
                {romaneiosCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenVehicles}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95"
            title="Cadastro e vínculo de Motoristas e Veículos"
          >
            <Users className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline">Vínculos Placas</span>
          </button>

          <button
            onClick={onOpenFirebase}
            type="button"
            className="p-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95"
            title="Configurar Conexão do Firebase Firestore"
          >
            <Database className={`w-4 h-4 ${firebaseActive ? 'text-emerald-400' : 'text-slate-400'}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
