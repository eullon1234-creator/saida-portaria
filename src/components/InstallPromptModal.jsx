import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Tablet, X, Share2, PlusSquare, CheckCircle2, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import logoGel from '../assets/logo-gel.png';

export default function InstallPromptModal({ isOpen, onClose, deferredPrompt, onInstallSuccess }) {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detecta se é dispositivo iOS / iPadOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIosDevice);

    // Detecta se já está rodando como app instalado (PWA Standalone)
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(isAppInstalled);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          console.log('✅ Usuário aceitou a instalação do aplicativo');
          if (onInstallSuccess) onInstallSuccess();
          onClose();
        }
      } catch (err) {
        console.error('Erro ao chamar prompt de instalação:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-amber-500/40 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Topo do Modal com Identidade Visual */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 text-center relative border-b-4 border-amber-600">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-20 h-20 bg-white rounded-2xl mx-auto p-2.5 shadow-xl flex items-center justify-center mb-3">
            <img src={logoGel} alt="Logo Portaria GEL" className="h-14 w-auto object-contain" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider mb-2 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Aplicativo Oficial de Portaria
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Baixar e Instalar Aplicativo
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xs mx-auto">
            Instale no celular ou tablet para usar em tela cheia na guarita, com acesso rápido e modo offline.
          </p>
        </div>

        {/* Corpo com Instruções Dinâmicas */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Se já estiver instalado */}
          {isStandalone ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-900 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-black text-sm">O aplicativo já está instalado!</p>
                <p className="text-xs text-emerald-700">Você já está utilizando a versão de aplicativo na sua tela inicial.</p>
              </div>
            </div>
          ) : deferredPrompt ? (
            /* Dispositivos Android / Chrome / Edge com botão direto de 1 clique */
            <div className="space-y-4">
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-black shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 block">Acesso Direto da Tela Inicial</span>
                    <span>Ícone rápido sem precisar abrir o navegador toda vez.</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-black shrink-0">
                    <Tablet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 block">Tela Cheia para Portaria</span>
                    <span>Remove a barra de endereços do navegador para maior espaço e foco.</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-5 h-5 stroke-[2.5]" />
                <span>Instalar Agora no Meu Dispositivo</span>
              </button>
            </div>
          ) : isIOS ? (
            /* Dispositivos Apple (iPhone e iPad Safari) */
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider text-center">
                Como instalar no seu iPhone ou iPad:
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">1</span>
                  <div className="flex-1 flex items-center justify-between">
                    <span>Toque no botão <strong>Compartilhar</strong> na barra inferior do Safari</span>
                    <Share2 className="w-4 h-4 text-sky-600 ml-2" />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">2</span>
                  <div className="flex-1 flex items-center justify-between">
                    <span>Role para baixo e selecione <strong>Adicionar à Tela de Início</strong></span>
                    <PlusSquare className="w-4 h-4 text-amber-600 ml-2" />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">3</span>
                  <div>
                    <span>Toque em <strong>Adicionar</strong> no canto superior direito para concluir.</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Instrução geral para navegadores no Desktop ou outros */
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="font-bold text-slate-900">Para instalar no seu navegador:</p>
                <p>1. Clique no ícone de <strong>Instalar</strong> <Download className="inline w-3.5 h-3.5 text-amber-600" /> no canto direito da barra de endereços (ao lado dos favoritos).</p>
                <p>2. Confirme clicando em <strong>Instalar</strong> para criar o aplicativo na sua área de trabalho.</p>
                <p>3. Ou no celular, acesse pelo Google Chrome e toque nos 3 pontinhos ➔ <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</p>
              </div>
            </div>
          )}

          {/* Vantagens */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-around text-[11px] text-slate-500 font-semibold">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Seguro
            </span>
            <span>•</span>
            <span>Otimizado para Sol</span>
            <span>•</span>
            <span>Leve e Rápido</span>
          </div>

        </div>

        {/* Rodapé do Modal */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-black text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
