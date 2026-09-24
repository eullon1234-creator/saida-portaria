import React, { useState } from 'react';
import { Users, X, Plus, Search, Truck, Check, Trash2 } from 'lucide-react';
import { formatPlate, cleanPlate } from '../utils/plateUtils';
import { saveOrUpdateDriverVehicle } from '../firebase';

export default function VeiculosModal({ isOpen, onClose, vehiclesList, onRefreshVehicles }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [novaPlaca, setNovaPlaca] = useState('');
  const [novoMotorista, setNovoMotorista] = useState('');
  const [novaEmpresa, setNovaEmpresa] = useState('GEL Engenharia');

  if (!isOpen) return null;

  const filtered = vehiclesList.filter(v => {
    const term = searchTerm.toLowerCase();
    return (
      (v.placa || '').toLowerCase().includes(term) ||
      (v.nome_motorista || '').toLowerCase().includes(term) ||
      (v.empresa_padrao || '').toLowerCase().includes(term)
    );
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    const cleanP = cleanPlate(novaPlaca);
    if (!cleanP || cleanP.length < 7 || !novoMotorista.trim()) {
      alert('Preencha placa válida e nome do motorista!');
      return;
    }

    await saveOrUpdateDriverVehicle(cleanP, novoMotorista, novaEmpresa);
    setNovaPlaca('');
    setNovoMotorista('');
    setIsAdding(false);
    onRefreshVehicles();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Topo */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b-4 border-amber-600">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500 text-slate-950 rounded-xl font-black">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Vínculos de Motoristas & Placas</h3>
              <p className="text-xs text-slate-400">
                Coleção veiculos_motoristas sincronizada automaticamente com o Firebase.
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

        {/* Barra de Busca e Adição */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por placa ou motorista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="outdoor-contrast-input w-full pl-10 pr-4 py-2 text-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{isAdding ? 'Cancelar' : 'Novo Vínculo Manual'}</span>
          </button>
        </div>

        {/* Formulário de Adição Rápida */}
        {isAdding && (
          <form onSubmit={handleCreate} className="p-4 bg-amber-50/80 border-b border-amber-200 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">Placa *</label>
              <input
                type="text"
                maxLength={8}
                placeholder="ABC1D23"
                value={novaPlaca}
                onChange={(e) => setNovaPlaca(formatPlate(e.target.value))}
                required
                className="outdoor-contrast-input placa-badge w-full px-3 py-2 text-sm font-black uppercase"
              />
            </div>

            <div className="flex-2 min-w-[200px]">
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">Nome do Motorista *</label>
              <input
                type="text"
                placeholder="Nome completo..."
                value={novoMotorista}
                onChange={(e) => setNovoMotorista(e.target.value)}
                required
                className="outdoor-contrast-input w-full px-3 py-2 text-sm font-bold"
              />
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">Empresa Padrão</label>
              <input
                type="text"
                placeholder="Ex: GEL Engenharia"
                value={novaEmpresa}
                onChange={(e) => setNovaEmpresa(e.target.value)}
                className="outdoor-contrast-input w-full px-3 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs shadow transition active:scale-95"
            >
              Salvar Vínculo
            </button>
          </form>
        )}

        {/* Lista de Registros */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-100">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Nenhum motorista ou placa encontrado.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id || item.placa}
                className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-sm px-2.5 py-1 bg-slate-100 text-slate-900 border border-slate-300 rounded-lg">
                    {formatPlate(item.placa)}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.nome_motorista}</h4>
                    <p className="text-xs text-slate-500">{item.empresa_padrao || 'GEL Engenharia'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Vinculado
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé */}
        <div className="bg-slate-50 p-3 sm:px-6 flex items-center justify-between border-t border-slate-200 text-xs text-slate-500">
          <span>Total cadastrados: <strong>{filtered.length}</strong></span>
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
