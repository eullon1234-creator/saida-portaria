import React, { useState } from 'react';
import { Database, X, CheckCircle2, CloudOff, Save, RefreshCw, Key, Code2 } from 'lucide-react';
import { getSavedFirebaseConfig, saveFirebaseConfig, isUsingFirebase } from '../firebase';

export default function FirebaseModal({ isOpen, onClose }) {
  const currentConfig = getSavedFirebaseConfig() || {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  };

  const [config, setConfig] = useState(currentConfig);
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonMode, setShowJsonMode] = useState(false);
  const isOnline = isUsingFirebase();

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!config.projectId || !config.apiKey) {
      if (window.confirm('Campos essenciais vazios. Deseja remover a configuração e voltar ao Modo Local (offline)?')) {
        saveFirebaseConfig(null);
      }
      return;
    }
    saveFirebaseConfig(config);
  };

  const handleParseJson = () => {
    try {
      // Extrai campos usando expressões regulares de forma segura
      const extractKey = (keyName) => {
        const match = jsonInput.match(new RegExp(`${keyName}\\s*:\\s*["']([^"']+)["']`));
        return match ? match[1] : '';
      };

      const extractedApiKey = extractKey('apiKey');
      const extractedProjectId = extractKey('projectId');

      let parsed = null;
      if (extractedApiKey && extractedProjectId) {
        parsed = {
          apiKey: extractedApiKey,
          authDomain: extractKey('authDomain'),
          projectId: extractedProjectId,
          storageBucket: extractKey('storageBucket'),
          messagingSenderId: extractKey('messagingSenderId'),
          appId: extractKey('appId')
        };
      } else {
        try {
          parsed = JSON.parse(jsonInput);
        } catch {
          parsed = null;
        }
      }

      if (parsed && parsed.projectId) {
        setConfig({
          apiKey: parsed.apiKey || '',
          authDomain: parsed.authDomain || '',
          projectId: parsed.projectId || '',
          storageBucket: parsed.storageBucket || '',
          messagingSenderId: parsed.messagingSenderId || '',
          appId: parsed.appId || ''
        });
        setShowJsonMode(false);
      } else {
        alert('Formato inválido. Certifique-se de que contenha projectId e apiKey.');
      }
    } catch (err) {
      alert('Não foi possível ler o JSON: ' + err.message);
    }
  };

  const handleClear = () => {
    if (window.confirm('Deseja desativar o Firebase e retornar ao armazenamento local?')) {
      saveFirebaseConfig(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Topo */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b-4 border-amber-600">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl font-black ${isOnline ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">Conexão Firebase / Firestore</h3>
                {isOnline ? (
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                    Conectado
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                    Modo Local (Offline)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Configure as chaves do seu projeto Firebase Firestore.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Informações da Estrutura Firestore */}
        <div className="bg-slate-50 p-4 border-b border-slate-200">
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-slate-800">
            <strong className="text-amber-900 font-black block mb-1">
              Coleções Firestore Estruturadas no Sistema:
            </strong>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>
                <code className="font-mono font-bold bg-amber-100 px-1 rounded">veiculos_motoristas</code>:
                (id, placa, nome_motorista, empresa_padrao, atualizado_em)
              </li>
              <li>
                <code className="font-mono font-bold bg-amber-100 px-1 rounded">romaneios_saida</code>:
                (numero_romaneio, origem, empresa, destino, motorista, placa, itens, data_hora)
              </li>
            </ul>
          </div>
        </div>

        {/* Alternar Colar JSON ou Formulário */}
        <div className="px-5 pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowJsonMode(!showJsonMode)}
            className="text-xs font-bold text-amber-700 hover:text-amber-900 underline flex items-center gap-1"
          >
            <Code2 className="w-4 h-4" />
            {showJsonMode ? 'Preencher campos individuais' : 'Colar objeto firebaseConfig do Console'}
          </button>

          {isOnline && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
            >
              <CloudOff className="w-3.5 h-3.5" />
              Desconectar Firebase
            </button>
          )}
        </div>

        {/* Formulário de Configuração */}
        <div className="flex-1 overflow-y-auto p-5">
          {showJsonMode ? (
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase text-slate-700">
                Cole o objeto javascript do console do Firebase:
              </label>
              <textarea
                rows={6}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={'const firebaseConfig = {\n  apiKey: "...",\n  authDomain: "...",\n  projectId: "...",\n  storageBucket: "...",\n  messagingSenderId: "...",\n  appId: "..."\n};'}
                className="w-full font-mono text-xs p-3 bg-slate-900 text-emerald-400 rounded-xl border border-slate-700 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleParseJson}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition"
              >
                Carregar Configuração
              </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Project ID *
                </label>
                <input
                  type="text"
                  placeholder="ex: gel-portaria-app"
                  value={config.projectId}
                  onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                  required
                  className="outdoor-contrast-input w-full px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  API Key *
                </label>
                <input
                  type="text"
                  placeholder="ex: AIzaSy..."
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  required
                  className="outdoor-contrast-input w-full px-3 py-2 text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Auth Domain
                  </label>
                  <input
                    type="text"
                    placeholder="ex: projeto.firebaseapp.com"
                    value={config.authDomain}
                    onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                    className="outdoor-contrast-input w-full px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Storage Bucket
                  </label>
                  <input
                    type="text"
                    placeholder="ex: projeto.appspot.com"
                    value={config.storageBucket}
                    onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
                    className="outdoor-contrast-input w-full px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    App ID
                  </label>
                  <input
                    type="text"
                    placeholder="ex: 1:123456789:web:abcdef"
                    value={config.appId}
                    onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                    className="outdoor-contrast-input w-full px-3 py-2 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Messaging Sender ID
                  </label>
                  <input
                    type="text"
                    placeholder="ex: 123456789012"
                    value={config.messagingSenderId}
                    onChange={(e) => setConfig({ ...config, messagingSenderId: e.target.value })}
                    className="outdoor-contrast-input w-full px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition shadow flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Configuração e Conectar</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Rodapé */}
        <div className="bg-slate-50 p-3 sm:px-6 flex items-center justify-between border-t border-slate-200 text-xs text-slate-500">
          <span>* A página será recarregada após salvar as credenciais.</span>
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
