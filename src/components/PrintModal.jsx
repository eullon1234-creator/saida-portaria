import React from 'react';
import { Printer, X, Download, FileText, CheckCircle2, Scissors, ArrowRight, Share2 } from 'lucide-react';
import { formatPlate } from '../utils/plateUtils';
import logoGel from '../assets/logo-gel.png';

export default function PrintModal({ romaneio, onClose, onNewRomaneio }) {
  if (!romaneio) return null;

  const handlePrint = () => {
    window.print();
  };

  // Formata data e hora legível
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

  // Renderiza uma via única do Romaneio
  const renderSingleVia = (viaLabel, viaSubtitle, isFirstVia = true) => {
    return (
      <div className="romaneio-via bg-white border-2 border-slate-900 rounded-lg p-3 sm:p-4 flex flex-col justify-between text-slate-900 relative">
        {/* CABEÇALHO DA VIA */}
        <div className="border-b-2 border-slate-900 pb-2 mb-2">
          <div className="flex items-center justify-between gap-3">
            {/* Logo da GEL */}
            <div className="flex items-center gap-2">
              <img 
                src={logoGel} 
                alt="Logo GEL" 
                className="h-10 sm:h-12 w-auto object-contain" 
              />
            </div>

            {/* Título Central */}
            <div className="text-center flex-1">
              <h2 className="text-sm sm:text-base font-black tracking-tight uppercase leading-tight text-slate-950">
                ROMANEIO DE SAÍDA DE MATERIAIS
              </h2>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                CONTROLE DE PORTARIA & EXPEDIÇÃO
              </div>
            </div>

            {/* Número e Via */}
            <div className="text-right">
              <div className="inline-block bg-slate-900 text-white font-mono font-black text-xs sm:text-sm px-2.5 py-1 rounded">
                Nº {romaneio.numero_romaneio}
              </div>
              <div className="text-[10px] font-black uppercase text-amber-700 tracking-wider mt-0.5">
                {viaLabel}
              </div>
            </div>
          </div>

          {/* FAIXA DESTACADA DE IDENTIFICAÇÃO DA ORIGEM (OBRA) */}
          <div className="mt-2 flex items-center justify-between bg-slate-100 border border-slate-400 px-2.5 py-1 rounded text-xs">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-700 uppercase">UNIDADE EMISSORA / ORIGEM:</span>
              <span className={`font-black text-sm uppercase px-2 py-0.2 rounded text-white ${
                romaneio.origem?.includes('Estrela') ? 'bg-amber-600' : 'bg-sky-700'
              }`}>
                {romaneio.origem || 'UHE ESTRELA'}
              </span>
            </div>
            <div className="font-bold text-slate-800 text-[11px]">
              DATA/HORA: <span className="font-black">{formatDate(romaneio.data_hora)}</span>
            </div>
          </div>
        </div>

        {/* DADOS DO TRANSPORTE, MOTORISTA E DESTINO */}
        <div className="grid grid-cols-4 gap-2 text-xs border border-slate-300 rounded p-2 mb-2 bg-slate-50/50">
          <div className="col-span-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Motorista:</span>
            <span className="font-black text-slate-900 uppercase text-xs sm:text-sm block truncate">
              {romaneio.motorista || '---'}
            </span>
          </div>

          <div className="col-span-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Placa:</span>
            <span className="font-mono font-black text-xs sm:text-sm text-slate-950 uppercase bg-amber-200/80 px-1.5 py-0.5 rounded border border-amber-400 inline-block">
              {formatPlate(romaneio.placa) || '---'}
            </span>
          </div>

          <div className="col-span-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Transportadora:</span>
            <span className="font-bold text-slate-800 uppercase text-xs block truncate">
              {romaneio.empresa || 'PRÓPRIA / GEL'}
            </span>
          </div>

          <div className="col-span-4 border-t border-slate-200 pt-1 mt-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase inline mr-1">Destino:</span>
            <span className="font-black text-slate-900 uppercase text-xs">
              {romaneio.destino || '---'}
            </span>
          </div>
        </div>

        {/* TABELA DE MATERIAIS */}
        <div className="flex-1 mb-2">
          <table className="w-full text-left border-collapse border border-slate-400 text-xs">
            <thead>
              <tr className="bg-slate-200 text-slate-900 font-black text-[10px] uppercase">
                <th className="border border-slate-400 px-1.5 py-1 text-center w-8">#</th>
                <th className="border border-slate-400 px-2 py-1">Descrição do Material</th>
                <th className="border border-slate-400 px-2 py-1 text-center w-16">Qtd</th>
                <th className="border border-slate-400 px-2 py-1 text-center w-14">Unid</th>
                <th className="border border-slate-400 px-2 py-1">Observações / NF</th>
              </tr>
            </thead>
            <tbody>
              {romaneio.itens?.map((it, idx) => (
                <tr key={idx} className="border-b border-slate-300">
                  <td className="border border-slate-300 px-1.5 py-0.5 text-center font-bold text-[11px] text-slate-600">
                    {idx + 1}
                  </td>
                  <td className="border border-slate-300 px-2 py-0.5 font-bold uppercase text-[11px] text-slate-900">
                    {it.material}
                  </td>
                  <td className="border border-slate-300 px-2 py-0.5 text-center font-black text-[11px] text-slate-950">
                    {it.quantidade}
                  </td>
                  <td className="border border-slate-300 px-2 py-0.5 text-center font-bold uppercase text-[10px] text-slate-700">
                    {it.unidade}
                  </td>
                  <td className="border border-slate-300 px-2 py-0.5 text-[10px] text-slate-600">
                    {it.observacao || '-'}
                  </td>
                </tr>
              ))}
              {/* Linhas vazias para preenchimento se forem poucos itens */}
              {romaneio.itens?.length < 3 && Array.from({ length: 3 - romaneio.itens.length }).map((_, i) => (
                <tr key={`empty-${i}`} className="border-b border-slate-200 h-5">
                  <td className="border border-slate-200 px-1 text-center text-slate-300 text-[10px]">{romaneio.itens.length + i + 1}</td>
                  <td className="border border-slate-200"></td>
                  <td className="border border-slate-200"></td>
                  <td className="border border-slate-200"></td>
                  <td className="border border-slate-200"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* OBSERVAÇÕES GERAIS DA LIBERAÇÃO */}
        {romaneio.observacoes_gerais ? (
          <div className="text-[10px] text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-300 mb-2">
            <span className="font-bold uppercase text-slate-900">Obs Geral:</span> {romaneio.observacoes_gerais}
          </div>
        ) : null}

        {/* CAMPOS DE ASSINATURA FÍSICA / DIGITAL */}
        <div className="pt-2 border-t border-slate-400">
          <div className="grid grid-cols-2 gap-6 text-center">
            {/* Assinatura Conferente */}
            <div>
              <div className="border-b-2 border-slate-900 h-7 mx-4"></div>
              <div className="text-[10px] font-black uppercase text-slate-900 mt-1">
                Assinatura do Conferente / Portaria
              </div>
              <div className="text-[9px] text-slate-500 font-semibold">
                GEL Engenharia - {romaneio.origem}
              </div>
            </div>

            {/* Assinatura Motorista */}
            <div>
              <div className="border-b-2 border-slate-900 h-7 mx-4"></div>
              <div className="text-[10px] font-black uppercase text-slate-900 mt-1">
                Assinatura do Motorista
              </div>
              <div className="text-[9px] text-slate-500 font-semibold truncate px-2">
                {romaneio.motorista} ({formatPlate(romaneio.placa)})
              </div>
            </div>
          </div>

          <div className="mt-1 flex items-center justify-between text-[8px] text-slate-400 font-mono">
            <span>GEL S.A. | Controle Portaria</span>
            <span className="uppercase font-bold text-slate-600">{viaSubtitle}</span>
            <span>Emitido em: {formatDate(romaneio.criado_em || romaneio.data_hora)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      {/* Container Principal do Modal */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden">
        {/* Barra Superior do Modal (Não sai na impressão) */}
        <div className="no-print bg-slate-900 text-white p-3.5 sm:p-4 flex items-center justify-between border-b-4 border-amber-600">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-black">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Romaneio Emitido com Sucesso!
                </h3>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  Salvo no Banco
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Visualização do documento pronto para impressão (2 vias em 1 folha A4 com logotipo GEL).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Fechar visualização"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Barra de Ações Rápidas de Impressão (Não sai na impressão) */}
        <div className="no-print bg-amber-50 border-b border-amber-200 p-3 sm:px-6 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-amber-900 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Documento formatado para caber exatamente em <strong>1 Folha A4 (2 Vias Repetidas)</strong> com linha de corte.</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handlePrint}
              type="button"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-sm shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onNewRomaneio();
              }}
              type="button"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Nova Saída</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ÁREA DE VISUALIZAÇÃO E IMPRESSÃO (ESTRUTURA DE 2 VIAS REPETIDAS) */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-slate-200 flex justify-center">
          {/* Este bloco é o que vai para a impressora (@media print) */}
          <div className="print-only-container w-full max-w-[210mm] bg-white shadow-xl p-4 sm:p-5 flex flex-col justify-between" style={{ minHeight: '280mm' }}>
            
            {/* 1ª VIA - PORTARIA / OBRA */}
            <div className="flex-1 flex flex-col">
              {renderSingleVia('1ª VIA - PORTARIA / CONTROLE INTERNO', 'Via 1: Arquivo da Portaria / Obra', true)}
            </div>

            {/* LINHA DE CORTE SERRILHADA ENTRE AS DUAS VIAS */}
            <div className="my-2.5 sm:my-3.5 relative flex items-center justify-center">
              <div className="w-full border-t-2 border-dashed border-slate-500"></div>
              <div className="absolute bg-white px-3 py-0.5 text-[10px] font-black uppercase text-slate-600 flex items-center gap-1.5 border border-slate-400 rounded-full shadow-sm">
                <Scissors className="w-3.5 h-3.5 rotate-90 text-slate-700" />
                <span>CORTE AQUI (DIVISÃO DAS 2 VIAS)</span>
                <Scissors className="w-3.5 h-3.5 -rotate-90 text-slate-700" />
              </div>
            </div>

            {/* 2ª VIA - MOTORISTA / DESTINO */}
            <div className="flex-1 flex flex-col">
              {renderSingleVia('2ª VIA - MOTORISTA / DESTINO', 'Via 2: Acompanha a Carga / Motorista', false)}
            </div>

          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="no-print bg-slate-100 p-3 sm:px-6 flex items-center justify-between border-t border-slate-200">
          <span className="text-xs text-slate-500 font-medium">
            Romaneio Nº <strong className="text-slate-900">{romaneio.numero_romaneio}</strong> • {romaneio.origem}
          </span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-200 cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
}
