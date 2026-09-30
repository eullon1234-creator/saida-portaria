import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  X, 
  Check, 
  AlertCircle, 
  Key, 
  Settings2, 
  ArrowRight, 
  Truck, 
  Package, 
  Volume2, 
  RotateCcw,
  Zap
} from 'lucide-react';
import { 
  parseSpokenRomaneioWithGemini, 
  getSavedGeminiKey, 
  saveGeminiKey 
} from '../utils/aiVoiceParser';
import { formatPlate } from '../utils/plateUtils';

export default function VoiceAssistantModal({ 
  isOpen, 
  onClose, 
  currentOrigem = 'UHE Estrela',
  vehiclesList = [],
  onApplyVoiceData 
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedResult, setExtractedResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Configuração da chave do Gemini
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getSavedGeminiKey() || '');
  const [savedKey, setSavedKey] = useState(getSavedGeminiKey() || '');

  const recognitionRef = useRef(null);

  // Inicializa o Reconhecimento de Fala Nativo
  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      setExtractedResult(null);
      setTranscript('');
      setInterimTranscript('');
      setErrorMessage('');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('Seu navegador não suporta reconhecimento de voz direto. Digite ou use o Google Chrome / Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalStr += transcriptPart + ' ';
        } else {
          interimStr += transcriptPart;
        }
      }

      if (finalStr) {
        setTranscript(prev => (prev + ' ' + finalStr).trim());
      }
      setInterimTranscript(interimStr);
    };

    recognition.onerror = (event) => {
      console.warn('Erro de reconhecimento de voz:', event.error);
      if (event.error === 'not-allowed') {
        setErrorMessage('Permissão de microfone negada. Permita o microfone no navegador.');
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    // Inicia a gravação automaticamente ao abrir o modal
    startRecording();

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, [isOpen]);

  const startRecording = () => {
    setErrorMessage('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        // Já iniciado
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Processa o texto com a Inteligência Artificial (Gemini)
  const handleProcessAI = async () => {
    const textToProcess = (transcript + ' ' + interimTranscript).trim();
    if (!textToProcess) {
      setErrorMessage('Por favor, fale ou digite as informações do caminhão e dos materiais antes de processar.');
      return;
    }

    stopRecording();
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const data = await parseSpokenRomaneioWithGemini(textToProcess, currentOrigem, vehiclesList);
      setExtractedResult(data);
    } catch (err) {
      setErrorMessage('Erro ao analisar com IA: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Aplica os dados extraídos no formulário principal
  const handleConfirmAndApply = () => {
    if (extractedResult) {
      onApplyVoiceData(extractedResult);
      onClose();
    }
  };

  // Salva a chave do Gemini
  const handleSaveKey = (e) => {
    e.preventDefault();
    saveGeminiKey(apiKeyInput);
    setSavedKey(apiKeyInput);
    setShowKeyConfig(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-amber-500/50 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Topo do Modal */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b-4 border-amber-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Preenchimento Inteligente por Voz (IA)
                </h3>
                {savedKey ? (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                    Gemini Flash
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/40">
                    Motor Local
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Fale os dados da carga e a IA preencherá o formulário automaticamente.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className="p-2 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition"
              title="Configurar Chave da API do Google Gemini"
            >
              <Settings2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Configuração da Chave da API do Gemini (Opcional) */}
        {showKeyConfig && (
          <div className="bg-amber-50/90 border-b border-amber-200 p-4 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-black uppercase text-amber-900 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-700" />
                Configurar Chave de Inteligência Artificial (Google AI Studio)
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-amber-800 font-bold underline text-[11px]"
              >
                Gerar Chave Gratuita ↗
              </a>
            </div>
            <p className="text-slate-600 text-[11px]">
              Com a chave do <strong>Google Gemini 1.5 Flash</strong>, a IA compreende qualquer sotaque, nomes próprios complexos e unidades de engenharia com 100% de precisão. Sem chave, o sistema usa o motor local gratuito.
            </p>
            <form onSubmit={handleSaveKey} className="flex gap-2">
              <input
                type="text"
                placeholder="Cole sua API Key do Google (ex: AIzaSy...)"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="outdoor-contrast-input flex-1 px-3 py-1.5 text-xs font-mono"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs transition"
              >
                Salvar Chave
              </button>
            </form>
          </div>
        )}

        {/* Corpo do Modal */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Mensagem de Erro se houver */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Área do Botão do Microfone e Feedback de Voz */}
          {!extractedResult && (
            <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 relative text-center">
              
              {/* Botão Pulsante do Microfone */}
              <button
                type="button"
                onClick={toggleRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer active:scale-95 ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-200'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-4 ring-amber-100'
                }`}
                title={isRecording ? 'Clique para pausar gravação' : 'Clique para começar a falar'}
              >
                {isRecording ? <Mic className="w-9 h-9" /> : <MicOff className="w-9 h-9" />}
              </button>

              <div className="mt-3">
                <span className={`text-xs font-black uppercase tracking-wider ${isRecording ? 'text-rose-600' : 'text-slate-600'}`}>
                  {isRecording ? '● Gravando sua voz... Fale normalmente' : 'Microfone Pausado (Toque para falar)'}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm">
                  Ex: <em>"Caminhão da GEL, motorista Carlos Eduardo, placa BRA2E19, destino Barragem, levando 50 sacos de cimento e 10 barras de ferro."</em>
                </p>
              </div>

              {/* Caixa de Texto da Transcrição em Tempo Real / Editável */}
              <div className="w-full mt-4 text-left">
                <label className="block text-[11px] font-black uppercase text-slate-600 mb-1 flex items-center justify-between">
                  <span>{isRecording ? 'Ouvindo e Transcrevendo:' : 'Texto Transcrito (Editável):'}</span>
                  {(transcript || interimTranscript) && (
                    <button
                      type="button"
                      onClick={() => { setTranscript(''); setInterimTranscript(''); }}
                      className="text-slate-400 hover:text-rose-600 text-[10px] font-bold cursor-pointer"
                    >
                      Limpar Texto
                    </button>
                  )}
                </label>
                
                {isRecording ? (
                  <div className="p-3 bg-white border-2 border-amber-400 rounded-xl min-h-[75px] text-sm text-slate-900 font-medium shadow-inner">
                    {transcript || interimTranscript ? (
                      <span>
                        {transcript} <span className="text-amber-600 italic font-semibold">{interimTranscript}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">
                        Fale agora... Sua fala aparecerá aqui em tempo real...
                      </span>
                    )}
                  </div>
                ) : (
                  <textarea
                    rows={3}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Digite ou fale: Ex: Eduardo Francisco placa ABC1D31 levando 3 sacos de cimento..."
                    className="w-full p-3 bg-white border-2 border-slate-300 focus:border-amber-500 rounded-xl text-sm text-slate-900 font-medium focus:ring-2 focus:ring-amber-200 outline-none transition"
                  />
                )}
              </div>

              {/* Botão de Processar */}
              <div className="w-full mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleProcessAI}
                  disabled={isProcessing || (!transcript && !interimTranscript)}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-slate-950 font-black text-sm sm:text-base rounded-xl shadow-lg shadow-amber-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 fill-slate-950" />
                  <span>{isProcessing ? 'Inteligência Artificial Analisando...' : '⚡ Processar com IA e Preencher Formulário'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Resultado Extraído pela IA para Conferência */}
          {extractedResult && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
              <div className="p-3 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">Dados Identificados com Sucesso!</h4>
                    <p className="text-[11px] text-emerald-800">
                      Confira as informações extraídas pela IA antes de aplicar no romaneio.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setExtractedResult(null)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-emerald-100 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Falar de novo</span>
                </button>
              </div>

              {/* Grid com Dados do Transporte Extraídos */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Origem da Obra:</span>
                  <strong className="text-amber-800 text-sm font-black">{extractedResult.origem || currentOrigem}</strong>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Motorista:</span>
                  <strong className="text-slate-900 text-sm font-black">{extractedResult.motorista || 'Não identificado'}</strong>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Placa:</span>
                  <strong className="font-mono font-black text-slate-950 bg-amber-200 px-2 py-0.5 rounded border border-amber-300 inline-block text-sm">
                    {formatPlate(extractedResult.placa) || '---'}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Destino:</span>
                  <strong className="text-slate-900 text-sm font-black">{extractedResult.destino || 'Não identificado'}</strong>
                </div>

                {extractedResult.empresa && (
                  <div className="sm:col-span-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Empresa / Transportadora:</span>
                    <strong className="text-slate-900 text-xs font-bold">{extractedResult.empresa}</strong>
                  </div>
                )}
              </div>

              {/* Tabela de Materiais Extraídos */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-600" />
                  Materiais Extraídos ({extractedResult.itens?.length || 0}):
                </label>
                <div className="border border-slate-300 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-200 text-slate-900 font-black text-[10px] uppercase">
                      <tr>
                        <th className="p-2 w-8 text-center">#</th>
                        <th className="p-2">Material</th>
                        <th className="p-2 text-center w-20">Quantidade</th>
                        <th className="p-2 text-center w-16">Unidade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {extractedResult.itens?.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2 text-center text-slate-500 font-bold">{idx + 1}</td>
                          <td className="p-2 font-bold text-slate-900">{it.material}</td>
                          <td className="p-2 text-center font-black text-amber-800">{it.quantidade}</td>
                          <td className="p-2 text-center uppercase font-bold text-slate-600">{it.unidade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Botão de Aplicação Final */}
              <button
                type="button"
                onClick={handleConfirmAndApply}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base rounded-2xl shadow-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Confirmar e Preencher Formulário</span>
              </button>
            </div>
          )}

        </div>

        {/* Rodapé */}
        <div className="bg-slate-50 p-3 sm:px-6 flex items-center justify-between border-t border-slate-200 text-xs text-slate-500">
          <span>GEL Engenharia • Entrada Inteligente de Romaneio</span>
          <button
            onClick={onClose}
            className="font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-200"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
