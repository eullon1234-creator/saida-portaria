import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, 
  User, 
  MapPin, 
  Building, 
  Calendar, 
  Clock, 
  Package, 
  Plus, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RotateCcw,
  Search,
  Check
} from 'lucide-react';
import { formatPlate, cleanPlate, isValidPlate } from '../utils/plateUtils';

const UNIDADES_COMUNS = ['un', 'kg', 'm³', 'sc', 'barra', 'pç', 'tb', 'fd', 'ton', 'cx', 'l', 'm'];

export default function RomaneioForm({
  formData,
  setFormData,
  vehiclesList,
  onSaveAndPrint,
  onResetForm
}) {
  const [plateSuggestions, setPlateSuggestions] = useState([]);
  const [driverSuggestions, setDriverSuggestions] = useState([]);
  const [showPlateDropdown, setShowPlateDropdown] = useState(false);
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const [matchedVehicle, setMatchedVehicle] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const plateInputRef = useRef(null);
  const driverInputRef = useRef(null);

  // Monitora alterações na placa para buscar motorista correspondente
  const handlePlateChange = (e) => {
    const rawValue = e.target.value;
    const formatted = formatPlate(rawValue);
    const cleaned = cleanPlate(formatted);

    setFormData(prev => ({ ...prev, placa: formatted }));

    if (errors.placa) {
      setErrors(prev => ({ ...prev, placa: null }));
    }

    if (cleaned.length >= 2) {
      const filtered = vehiclesList.filter(v => cleanPlate(v.placa).includes(cleaned));
      setPlateSuggestions(filtered);
      setShowPlateDropdown(filtered.length > 0);

      // Busca correspondência exata
      const exactMatch = vehiclesList.find(v => cleanPlate(v.placa) === cleaned);
      if (exactMatch) {
        setMatchedVehicle(exactMatch);
        setFormData(prev => ({
          ...prev,
          placa: formatPlate(exactMatch.placa),
          motorista: exactMatch.nome_motorista || prev.motorista,
          empresa: prev.empresa || exactMatch.empresa_padrao || ''
        }));
      } else {
        setMatchedVehicle(null);
      }
    } else {
      setPlateSuggestions([]);
      setShowPlateDropdown(false);
      setMatchedVehicle(null);
    }
  };

  // Monitora alterações no nome do motorista para buscar placa correspondente
  const handleDriverChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, motorista: value }));

    if (errors.motorista) {
      setErrors(prev => ({ ...prev, motorista: null }));
    }

    if (value.trim().length >= 2) {
      const term = value.toLowerCase().trim();
      const filtered = vehiclesList.filter(v => 
        (v.nome_motorista || '').toLowerCase().includes(term)
      );
      setDriverSuggestions(filtered);
      setShowDriverDropdown(filtered.length > 0);
    } else {
      setDriverSuggestions([]);
      setShowDriverDropdown(false);
    }
  };

  // Seleciona um veículo pelo dropdown de placas
  const selectPlateSuggestion = (item) => {
    setFormData(prev => ({
      ...prev,
      placa: formatPlate(item.placa),
      motorista: item.nome_motorista,
      empresa: prev.empresa || item.empresa_padrao || ''
    }));
    setMatchedVehicle(item);
    setShowPlateDropdown(false);
  };

  // Seleciona um motorista pelo dropdown de motoristas
  const selectDriverSuggestion = (item) => {
    setFormData(prev => ({
      ...prev,
      motorista: item.nome_motorista,
      placa: formatPlate(item.placa),
      empresa: prev.empresa || item.empresa_padrao || ''
    }));
    setMatchedVehicle(item);
    setShowDriverDropdown(false);
  };

  // Funções para manipulação dos Itens de Carga
  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      itens: [
        ...prev.itens,
        { id: Date.now(), material: '', quantidade: '', unidade: 'un', observacao: '' }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.itens.length <= 1) {
      // Deixa um item em branco em vez de remover tudo
      setFormData(prev => ({
        ...prev,
        itens: [{ id: Date.now(), material: '', quantidade: '', unidade: 'un', observacao: '' }]
      }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItens = [...prev.itens];
      newItens[index] = { ...newItens[index], [field]: value };
      return { ...prev, itens: newItens };
    });

    if (errors.itens) {
      setErrors(prev => ({ ...prev, itens: null }));
    }
  };

  // Atualiza data/hora para o momento atual
  const setNowDateTime = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16);
    setFormData(prev => ({ ...prev, data_hora: localISOTime }));
  };

  // Validação e Envio
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.origem) {
      newErrors.origem = 'Selecione a Unidade de Origem (UHE Estrela ou PCH Taboca)';
    }

    if (!formData.motorista || formData.motorista.trim().length < 2) {
      newErrors.motorista = 'Informe o nome completo do motorista';
    }

    const cleanP = cleanPlate(formData.placa);
    if (!formData.placa || cleanP.length < 7) {
      newErrors.placa = 'Informe uma placa válida (ex: ABC1D23 ou ABC-1234)';
    }

    if (!formData.destino || formData.destino.trim().length < 2) {
      newErrors.destino = 'Informe o local de destino do material';
    }

    // Valida itens: ao menos um item preenchido com material e quantidade
    const validItens = formData.itens.filter(
      item => item.material && item.material.trim().length > 0 && Number(item.quantidade) > 0
    );

    if (validItens.length === 0) {
      newErrors.itens = 'Adicione ao menos 1 item com descrição e quantidade válida';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Rola a tela até o erro
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await onSaveAndPrint({
        ...formData,
        itens: validItens
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 2. DADOS DO TRANSPORTE E MOTORISTA */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
          <h2 className="text-base sm:text-lg font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-600" />
            2. Dados de Saída, Transporte e Destino
          </h2>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Campos com (*) são obrigatórios
          </span>
        </div>

        {/* Notificação de Erro se houver */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Por favor, preencha os campos obrigatórios:</p>
              <ul className="list-disc list-inside text-xs mt-1 space-y-0.5">
                {Object.values(errors).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Data e Hora */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Data e Hora da Saída *
              </span>
              <button
                type="button"
                onClick={setNowDateTime}
                className="text-[11px] text-amber-700 hover:text-amber-800 font-bold underline cursor-pointer"
              >
                Agora
              </button>
            </label>
            <input
              type="datetime-local"
              value={formData.data_hora}
              onChange={(e) => setFormData(prev => ({ ...prev, data_hora: e.target.value }))}
              required
              className="outdoor-contrast-input w-full px-3.5 py-3 text-slate-900 font-bold"
            />
          </div>

          {/* Empresa / Transportadora */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              Empresa / Transportadora
            </label>
            <input
              type="text"
              placeholder="Ex: GEL Engenharia, TransOeste, Própria..."
              value={formData.empresa}
              onChange={(e) => setFormData(prev => ({ ...prev, empresa: e.target.value }))}
              className="outdoor-contrast-input w-full px-3.5 py-3"
            />
          </div>

          {/* Local de Destino */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              Local de Destino *
            </label>
            <input
              type="text"
              placeholder="Ex: Canteiro Central, Almoxarifado II, Fornecedor..."
              value={formData.destino}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, destino: e.target.value }));
                if (errors.destino) setErrors(prev => ({ ...prev, destino: null }));
              }}
              required
              className={`outdoor-contrast-input w-full px-3.5 py-3 font-semibold ${
                errors.destino ? 'border-rose-500 ring-2 ring-rose-200' : ''
              }`}
            />
          </div>
        </div>

        {/* Vínculo Dinâmico: Placa do Veículo e Nome do Motorista */}
        <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Vínculo Automático: Placa & Motorista
            </span>
            {matchedVehicle ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                <Check className="w-3 h-3" /> Vínculo Reconhecido
              </span>
            ) : formData.placa && cleanPlate(formData.placa).length >= 7 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                ℹ️ Novo vínculo: será salvo automaticamente
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            {/* Campo Placa do Veículo */}
            <div className="relative">
              <label className="block text-xs font-black uppercase text-slate-800 tracking-wider mb-1 flex items-center gap-1">
                Placa do Veículo *
                <span className="text-[11px] text-slate-500 font-normal">(Mercosul ou Padrão Antigo)</span>
              </label>

              <div className="relative">
                <input
                  ref={plateInputRef}
                  type="text"
                  placeholder="Ex: ABC1D23 ou ABC-1234"
                  maxLength={8}
                  value={formData.placa}
                  onChange={handlePlateChange}
                  onFocus={() => {
                    if (plateSuggestions.length > 0) setShowPlateDropdown(true);
                  }}
                  className={`outdoor-contrast-input placa-badge w-full px-4 py-3 text-lg font-black uppercase tracking-widest text-slate-900 ${
                    errors.placa ? 'border-rose-500 ring-2 ring-rose-200' : ''
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  <span className="text-[10px] font-black px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded border border-slate-300">
                    BR
                  </span>
                </div>
              </div>

              {/* Dropdown de sugestão de placas */}
              {showPlateDropdown && plateSuggestions.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border-2 border-slate-300 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                  <div className="p-1.5 bg-slate-100 text-[11px] font-bold text-slate-500 uppercase px-3">
                    Veículos Cadastrados no Banco:
                  </div>
                  {plateSuggestions.map(item => (
                    <button
                      key={item.id || item.placa}
                      type="button"
                      onClick={() => selectPlateSuggestion(item)}
                      className="w-full text-left px-3.5 py-2 hover:bg-amber-50 flex items-center justify-between border-b border-slate-100 last:border-b-0 cursor-pointer"
                    >
                      <div>
                        <span className="font-mono font-black text-slate-900 text-sm">{formatPlate(item.placa)}</span>
                        <span className="text-xs text-slate-600 ml-2 font-medium">{item.nome_motorista}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{item.empresa_padrao || 'GEL'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Campo Nome do Motorista */}
            <div className="relative">
              <label className="block text-xs font-black uppercase text-slate-800 tracking-wider mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                Nome Completo do Motorista *
              </label>

              <input
                ref={driverInputRef}
                type="text"
                placeholder="Ex: Carlos Eduardo dos Santos"
                value={formData.motorista}
                onChange={handleDriverChange}
                onFocus={() => {
                  if (driverSuggestions.length > 0) setShowDriverDropdown(true);
                }}
                className={`outdoor-contrast-input w-full px-4 py-3 text-base font-bold text-slate-900 ${
                  errors.motorista ? 'border-rose-500 ring-2 ring-rose-200' : ''
                }`}
              />

              {/* Dropdown de sugestão de motoristas */}
              {showDriverDropdown && driverSuggestions.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border-2 border-slate-300 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                  <div className="p-1.5 bg-slate-100 text-[11px] font-bold text-slate-500 uppercase px-3">
                    Motoristas Encontrados:
                  </div>
                  {driverSuggestions.map(item => (
                    <button
                      key={item.id || item.placa}
                      type="button"
                      onClick={() => selectDriverSuggestion(item)}
                      className="w-full text-left px-3.5 py-2 hover:bg-amber-50 flex items-center justify-between border-b border-slate-100 last:border-b-0 cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{item.nome_motorista}</span>
                        <span className="font-mono text-xs text-amber-700 ml-2 font-black">
                          ({formatPlate(item.placa)})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{item.empresa_padrao || 'GEL'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. LISTA DE MATERIAIS (ITENS DA CARGA) */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-600" />
            <h2 className="text-base sm:text-lg font-black text-slate-800 uppercase tracking-wider">
              3. Lista de Materiais (Itens da Carga)
            </h2>
            <span className="bg-amber-100 text-amber-900 font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-amber-300">
              {formData.itens.length} {formData.itens.length === 1 ? 'item' : 'itens'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-black shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Adicionar Mais Material</span>
          </button>
        </div>

        {/* Tabela Responsiva / Cards para celular */}
        <div className="space-y-3">
          {formData.itens.map((item, index) => (
            <div
              key={item.id || index}
              className="p-3 sm:p-4 rounded-xl border-2 border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-700 uppercase bg-slate-200 px-2 py-0.5 rounded">
                  Item #{index + 1}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  title="Remover este item"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Remover</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                {/* Descrição do Material */}
                <div className="sm:col-span-6">
                  <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                    Descrição do Material *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Cimento CP-II 50kg, Barra de Aço CA-50 12mm..."
                    value={item.material}
                    onChange={(e) => handleItemChange(index, 'material', e.target.value)}
                    required
                    className="outdoor-contrast-input w-full px-3.5 py-2.5 font-bold text-slate-900"
                  />
                </div>

                {/* Quantidade */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="Ex: 50"
                    value={item.quantidade}
                    onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)}
                    required
                    className="outdoor-contrast-input w-full px-3.5 py-2.5 font-bold text-slate-900 text-center text-lg"
                  />
                </div>

                {/* Unidade de Medida */}
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                    Unidade de Medida *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      list={`unidades-list-${index}`}
                      value={item.unidade}
                      onChange={(e) => handleItemChange(index, 'unidade', e.target.value)}
                      placeholder="un, kg..."
                      className="outdoor-contrast-input w-24 px-3 py-2.5 font-bold uppercase text-center"
                    />
                    {/* Botões de atalho rápido de unidades */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {['un', 'kg', 'sc', 'm³', 'barra'].map(u => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => handleItemChange(index, 'unidade', u)}
                          className={`text-xs px-2 py-1 rounded font-bold transition cursor-pointer ${
                            item.unidade?.toLowerCase() === u
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Observações do Item */}
                <div className="sm:col-span-12">
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-0.5">
                    Observações / Lote / Nota Fiscal do Item (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Material transferido para frente de barragem, NF 1234..."
                    value={item.observacao}
                    onChange={(e) => handleItemChange(index, 'observacao', e.target.value)}
                    className="outdoor-contrast-input w-full px-3 py-1.5 text-xs text-slate-700 bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Observações Gerais do Romaneio */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
            Observações Gerais da Saída (Aparecerá no Comprovante Impresso)
          </label>
          <textarea
            rows={2}
            placeholder="Informações adicionais da liberação, número de lacre, autorização de saída pelo encarregado..."
            value={formData.observacoes_gerais || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, observacoes_gerais: e.target.value }))}
            className="outdoor-contrast-input w-full p-3 text-sm text-slate-800"
          />
        </div>
      </div>

      {/* 4. BOTÕES PRINCIPAIS DE AÇÃO (GRANDES PARA DISPOSITIVOS MÓVEIS) */}
      <div className="sticky bottom-3 z-20 bg-slate-900/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-2xl border-2 border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-white text-xs sm:text-sm font-semibold flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
          Pronto para conferência e emissão do romaneio
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onResetForm}
            className="flex-1 sm:flex-none px-4 py-3.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Limpar</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-2 sm:flex-none px-8 py-3.5 rounded-xl font-black text-base sm:text-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30 transition-all active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-5 h-5 stroke-[2.5]" />
            <span>{isSubmitting ? 'Gravando...' : 'Salvar e Emitir Romaneio'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
