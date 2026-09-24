import React from 'react';
import { Building2, Zap, Check } from 'lucide-react';

export default function OrigemSelector({ origem, onChange }) {
  const options = [
    {
      id: 'UHE Estrela',
      nome: 'UHE Estrela',
      subtitulo: 'Usina Hidrelétrica Estrela',
      badge: 'UHE',
      color: 'amber'
    },
    {
      id: 'PCH Taboca',
      nome: 'PCH Taboca',
      subtitulo: 'Pequena Central Hidrelétrica Taboca',
      badge: 'PCH',
      color: 'blue'
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm sm:text-base font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-5 h-5 text-amber-600" />
          1. Origem da Saída (Unidade Emissora)
          <span className="text-rose-600 text-sm font-black">* Obrigatório</span>
        </label>
        <span className="text-xs text-slate-500 hidden sm:inline font-medium">
          Selecione o canteiro de obras emissor
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {options.map((opt) => {
          const isSelected = origem === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`relative flex items-center justify-between p-4 sm:p-5 rounded-xl border-3 transition-all duration-150 text-left select-none cursor-pointer active:scale-[0.98] ${
                isSelected
                  ? opt.color === 'amber'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md ring-4 ring-amber-200/80'
                    : 'bg-sky-600 text-white border-sky-700 shadow-md ring-4 ring-sky-200/80'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition ${
                    isSelected
                      ? opt.color === 'amber'
                        ? 'bg-slate-950 text-amber-400'
                        : 'bg-white text-sky-700'
                      : 'bg-white border-2 border-slate-300 text-slate-600'
                  }`}
                >
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black uppercase px-2 py-0.5 rounded ${
                        isSelected
                          ? opt.color === 'amber'
                            ? 'bg-slate-950/20 text-slate-950'
                            : 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {opt.badge}
                    </span>
                    <span className="text-lg sm:text-xl font-black tracking-tight">
                      {opt.nome}
                    </span>
                  </div>
                  <p
                    className={`text-xs sm:text-sm font-medium mt-0.5 ${
                      isSelected
                        ? opt.color === 'amber'
                          ? 'text-slate-900'
                          : 'text-sky-100'
                        : 'text-slate-500'
                    }`}
                  >
                    {opt.subtitulo}
                  </p>
                </div>
              </div>

              {/* Indicador de Seleção Ativa */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition ${
                  isSelected
                    ? opt.color === 'amber'
                      ? 'bg-slate-950 text-white border-slate-950'
                      : 'bg-white text-sky-700 border-white'
                    : 'border-slate-300 bg-white text-transparent'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
