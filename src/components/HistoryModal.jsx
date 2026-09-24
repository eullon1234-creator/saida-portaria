import React, { useState } from 'react';
import { History, X, Search, Printer, Trash2, Calendar, Truck, User, Building2, Eye, Filter } from 'lucide-react';
import { formatPlate } from '../utils/plateUtils';

export default function HistoryModal({
  isOpen,
  onClose,
  romaneiosList,
  onSelectRomaneioToPrint,
  onDeleteRomaneio
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrigem, setFilterOrigem] = useState('TODAS');

  if (!isOpen) return null;

  // Filtragem dos romaneios
  const filteredList = romaneiosList.filter(item => {
    const matchesOrigem = filterOrigem === 'TODAS' || item.origem === filterOrigem;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesOrigem;

    const matchesSearch = 
      (item.numero_romaneio || '').toLowerCase().includes(term) ||
      (item.motorista || '').toLowerCase().includes(term) ||
      (item.placa || '').toLowerCase().includes(term) ||
      (item.destino || '').toLowerCase().includes(term) ||
      (item.empresa || '').toLowerCase().includes(term) ||
      (item.itens || []).some(it => (it.material || '').toLowerCase().includes(term));

    return matchesOrigem && matchesSearch;
  });

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Topo */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b-4 border-amber-600">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-black">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Histórico de Romaneios de Saída</h3>
              <p className="text-xs text-slate-400">
                Consulta e reemissão de romaneios gerados na portaria.
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

        {/* Barra de Filtros e Busca */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por número, placa, motorista, destino ou material..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="outdoor-contrast-input w-full pl-10 pr-4 py-2.5 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <div className="flex rounded-xl bg-slate-200 p-1 text-xs font-bold">
              {['TODAS', 'UHE Estrela', 'PCH Taboca'].map(orig => (
                <button
                  key={orig}
                  type="button"
                  onClick={() => setFilterOrigem(orig)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filterOrigem === orig
                      ? 'bg-white text-slate-900 shadow-sm font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {orig}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Registros */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-100">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-300">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-700 font-bold">Nenhum romaneio encontrado</p>
              <p className="text-xs text-slate-400 mt-1">
                Tente ajustar os termos de pesquisa ou o filtro de unidade emissora.
              </p>
            </div>
          ) : (
            filteredList.map((rom) => (
              <div
                key={rom.id || rom.numero_romaneio}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-amber-400 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-sm bg-slate-900 text-white px-2.5 py-0.5 rounded">
                      Nº {rom.numero_romaneio}
                    </span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded text-white ${
                      rom.origem?.includes('Estrela') ? 'bg-amber-600' : 'bg-sky-700'
                    }`}>
                      {rom.origem}
                    </span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatDate(rom.data_hora)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-slate-500">Motorista: </span>
                      <strong className="text-slate-800 uppercase">{rom.motorista}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Placa: </span>
                      <strong className="font-mono font-black text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
                        {formatPlate(rom.placa)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Destino: </span>
                      <strong className="text-slate-800 uppercase">{rom.destino}</strong>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center gap-2 pt-1 border-t border-slate-100">
                    <span className="font-semibold text-slate-700">Itens ({rom.itens?.length || 0}):</span>
                    <span className="truncate max-w-lg text-slate-500">
                      {rom.itens?.map(it => `${it.material} (${it.quantidade} ${it.unidade})`).join(' • ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectRomaneioToPrint(rom);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition active:scale-95 shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Reimprimir (2 Vias)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Deseja excluir o romaneio Nº ${rom.numero_romaneio}?`)) {
                        onDeleteRomaneio(rom.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Excluir Romaneio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé */}
        <div className="bg-slate-50 p-3 sm:px-6 flex items-center justify-between border-t border-slate-200 text-xs text-slate-500">
          <span>Total de Romaneios: <strong>{filteredList.length}</strong></span>
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
