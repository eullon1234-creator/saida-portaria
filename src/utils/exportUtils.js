// Utilitário para Exportação de Relatórios para Excel (.csv com formatação brasileira)
import { formatPlate } from './plateUtils';

/**
 * Converte a lista de romaneios para arquivo CSV compatível diretamente com o Microsoft Excel (ponto e vírgula e UTF-8 BOM)
 */
export function exportRomaneiosToExcel(romaneios, filenamePrefix = 'relatorio_saida_materiais_gel') {
  if (!romaneios || romaneios.length === 0) {
    alert('Nenhum registro para exportar.');
    return;
  }

  // Cabeçalhos das colunas
  const headers = [
    'Nº Romaneio',
    'Data da Saída',
    'Hora da Saída',
    'Origem (Obra)',
    'Transportadora / Empresa',
    'Placa',
    'Motorista',
    'Local de Destino',
    'Item Nº',
    'Descrição do Material',
    'Quantidade',
    'Unidade de Medida',
    'Observações do Item / NF',
    'Observações Gerais da Liberação',
    'Conferente Portaria'
  ];

  // Linhas de dados
  const rows = [];

  romaneios.forEach((rom) => {
    let dataStr = '';
    let horaStr = '';

    if (rom.data_hora) {
      try {
        const d = new Date(rom.data_hora);
        dataStr = d.toLocaleDateString('pt-BR');
        horaStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      } catch {
        dataStr = rom.data_hora;
      }
    }

    const escapeCell = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""'); // Escapa aspas duplas
      return `"${str}"`;
    };

    const itens = rom.itens && rom.itens.length > 0 
      ? rom.itens 
      : [{ material: 'Material Geral', quantidade: 1, unidade: 'un', observacao: '' }];

    itens.forEach((it, index) => {
      rows.push([
        escapeCell(rom.numero_romaneio || ''),
        escapeCell(dataStr),
        escapeCell(horaStr),
        escapeCell(rom.origem || ''),
        escapeCell(rom.empresa || 'GEL Engenharia'),
        escapeCell(formatPlate(rom.placa) || ''),
        escapeCell(rom.motorista || ''),
        escapeCell(rom.destino || ''),
        escapeCell(index + 1),
        escapeCell(it.material || ''),
        escapeCell(String(it.quantidade).replace('.', ',')), // Vírgula para números no Excel Brasil
        escapeCell(it.unidade || ''),
        escapeCell(it.observacao || ''),
        escapeCell(rom.observacoes_gerais || ''),
        escapeCell(rom.conferente_portaria || 'Portaria')
      ].join(';'));
    });
  });

  // Monta o arquivo CSV com BOM UTF-8 (\uFEFF) para garantir acentuação correta no Excel
  const csvContent = '\uFEFF' + headers.map(h => `"${h}"`).join(';') + '\r\n' + rows.join('\r\n');

  // Cria o Blob e dispara o download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const today = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
