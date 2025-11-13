import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../AppContext';
import { Solicitacao } from '../types';

// Inform TypeScript about the global jsPDF variable from the CDN
declare global {
    interface Window {
        jspdf: any;
    }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

type SortableKeys = 'protocolo' | 'solicitante' | 'cpf' | 'periodo_evento' | 'data_pagamento' | 'valor_deslocamento_aprovado' | 'valor_diaria_aprovado' | 'valor_ajuda_custo' | 'valor_total_aprovado';


const RelatorioFinanceiro: React.FC = () => {
    const context = useContext(AppContext);
    const { solicitacoes, findUserById } = context!;
    
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);

    const [startDate, setStartDate] = useState<string>(firstDayOfMonth);
    const [endDate, setEndDate] = useState<string>(lastDayOfMonth);
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'asc' | 'desc' } | null>({ key: 'data_pagamento', direction: 'desc' });


    const reportData = useMemo(() => {
        if (!startDate || !endDate) {
            return [];
        }

        const start = new Date(`${startDate}T00:00:00.000Z`);
        const end = new Date(`${endDate}T23:59:59.999Z`);
        
        return solicitacoes.filter(s => {
            if (!s.data_pagamento) return false;
            const paymentDate = new Date(s.data_pagamento);
            return paymentDate >= start && paymentDate <= end;
        });
    }, [solicitacoes, startDate, endDate]);

    const sortedReportData = useMemo(() => {
        let sortableItems = [...reportData];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue: any;
                let bValue: any;
    
                if (sortConfig.key === 'solicitante') {
                    aValue = findUserById(a.usuario_id)?.nome || '';
                    bValue = findUserById(b.usuario_id)?.nome || '';
                } else if (sortConfig.key === 'cpf') {
                    aValue = findUserById(a.usuario_id)?.cpf || '';
                    bValue = findUserById(b.usuario_id)?.cpf || '';
                } else {
                    aValue = a[sortConfig.key as keyof Solicitacao];
                    bValue = b[sortConfig.key as keyof Solicitacao];
                }

                if (aValue === null || aValue === undefined) aValue = sortConfig.direction === 'asc' ? Infinity : -Infinity;
                if (bValue === null || bValue === undefined) bValue = sortConfig.direction === 'asc' ? Infinity : -Infinity;

                if (sortConfig.key === 'data_pagamento') {
                    const dateA = aValue ? new Date(aValue).getTime() : 0;
                    const dateB = bValue ? new Date(bValue).getTime() : 0;
                     if (dateA < dateB) return sortConfig.direction === 'asc' ? -1 : 1;
                     if (dateA > dateB) return sortConfig.direction === 'asc' ? 1 : -1;
                     return 0;
                }
                
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                } else {
                     const strA = String(aValue).toLowerCase();
                     const strB = String(bValue).toLowerCase();
                     if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
                     if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [reportData, sortConfig, findUserById]);

    const requestSort = (key: SortableKeys) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const totals = useMemo(() => {
        return reportData.reduce((acc, s) => {
            acc.deslocamento += s.valor_deslocamento_aprovado;
            acc.diarias += s.valor_diaria_aprovado;
            acc.ajudaCusto += s.valor_ajuda_custo;
            acc.total += s.valor_total_aprovado;
            return acc;
        }, { deslocamento: 0, diarias: 0, ajudaCusto: 0, total: 0 });
    }, [reportData]);
    
    const exportToCSV = () => {
        const headers = ['Protocolo', 'Solicitante', 'CPF', 'Evento', 'Período Evento', 'Data Pagamento', 'Deslocamento (R$)', 'Diárias (R$)', 'Ajuda de Custo (R$)', 'Total (R$)'];
        const rows = sortedReportData.map(s => {
            const solicitante = findUserById(s.usuario_id);
            return [
                s.protocolo,
                `"${solicitante?.nome || 'N/A'}"`,
                `"${solicitante?.cpf || 'N/A'}"`,
                `"${s.nome_evento}"`,
                `"${s.periodo_evento}"`,
                formatDate(s.data_pagamento!),
                s.valor_deslocamento_aprovado.toFixed(2),
                s.valor_diaria_aprovado.toFixed(2),
                s.valor_ajuda_custo.toFixed(2),
                s.valor_total_aprovado.toFixed(2)
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `relatorio_financeiro_${startDate}_a_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const exportToPDF = () => {
        const jspdfModule = (window as any).jspdf;
        if (!jspdfModule) {
            alert('Erro: A biblioteca para exportação de PDF (jspdf) não pôde ser carregada.');
            console.error("jspdf library not found on window object.");
            return;
        }

        const jsPDF = jspdfModule.jsPDF || jspdfModule.default || jspdfModule;
        
        if (typeof jsPDF !== 'function') {
            alert('Erro: O construtor jsPDF não foi encontrado na biblioteca.');
            console.error("jsPDF constructor not found in jspdf library object:", jspdfModule);
            return;
        }

        const doc = new jsPDF({ orientation: 'landscape' });

        if (typeof (doc as any).autoTable !== 'function') {
            alert('Erro: O plugin para gerar tabelas (autoTable) no PDF não pôde ser carregado.');
            console.error("jsPDF autoTable plugin not found on the document instance.");
            return;
        }

        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);
        doc.text(`Relatório Financeiro: ${formattedStartDate} a ${formattedEndDate}`, 14, 16);

        const tableColumn = ["Protocolo", "Solicitante", "CPF", "Evento", "Período", "Data Pag.", "Desloc.", "Diárias", "Ajuda Custo", "Total"];
        const tableRows: any[] = [];

        sortedReportData.forEach(s => {
            const solicitante = findUserById(s.usuario_id);
            const rowData = [
                s.protocolo,
                solicitante?.nome || 'N/A',
                solicitante?.cpf || 'N/A',
                s.nome_evento,
                s.periodo_evento,
                formatDate(s.data_pagamento!),
                formatCurrency(s.valor_deslocamento_aprovado),
                formatCurrency(s.valor_diaria_aprovado),
                formatCurrency(s.valor_ajuda_custo),
                formatCurrency(s.valor_total_aprovado)
            ];
            tableRows.push(rowData);
        });

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            theme: 'striped',
            headStyles: { fillColor: [22, 160, 133] },
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 35 },
                1: { cellWidth: 40 }, 
                2: { cellWidth: 25 },
                3: { cellWidth: 40 },
            }
        });
        
        const finalY = (doc as any).lastAutoTable.finalY;
        if(finalY) {
            doc.setFontSize(10);
            doc.text('Totais:', 14, finalY + 10);
            doc.text(`Total Deslocamento: ${formatCurrency(totals.deslocamento)}`, 14, finalY + 15);
            doc.text(`Total Diárias: ${formatCurrency(totals.diarias)}`, 14, finalY + 20);
            doc.text(`Total Ajuda de Custo: ${formatCurrency(totals.ajudaCusto)}`, 14, finalY + 25);
            doc.setFont('helvetica', 'bold');
            doc.text(`Total Geral: ${formatCurrency(totals.total)}`, 14, finalY + 30);
        }

        doc.save(`relatorio_financeiro_${startDate}_a_${endDate}.pdf`);
    };

    const SortableHeader: React.FC<{ columnKey: SortableKeys, title: string, align?: 'left' | 'right' }> = ({ columnKey, title, align = 'left' }) => (
        <th className={`px-6 py-3 text-${align} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
            <button onClick={() => requestSort(columnKey)} className={`flex items-center gap-1.5 group w-full ${align === 'right' ? 'justify-end' : ''}`}>
                <span className="group-hover:text-gray-800">{title}</span>
                {sortConfig?.key === columnKey ? (
                    <span>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                ) : (
                    <span className="text-gray-300 group-hover:text-gray-500">▲</span>
                )}
            </button>
        </th>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                 <h2 className="text-xl font-semibold">Relatório Financeiro</h2>
                 <div className="flex items-center gap-4 flex-wrap">
                     <div className="flex items-center gap-2">
                        <label htmlFor="start-date" className="text-sm font-medium text-gray-700">De:</label>
                        <input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="p-2 border rounded-md"
                        />
                     </div>
                     <div className="flex items-center gap-2">
                        <label htmlFor="end-date" className="text-sm font-medium text-gray-700">Até:</label>
                        <input
                            id="end-date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="p-2 border rounded-md"
                        />
                     </div>
                     <button onClick={exportToCSV} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        Exportar CSV
                     </button>
                     <button onClick={exportToPDF} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        Exportar PDF
                     </button>
                 </div>
            </div>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <SortableHeader columnKey="protocolo" title="Protocolo" />
                            <SortableHeader columnKey="solicitante" title="Solicitante" />
                            <SortableHeader columnKey="cpf" title="CPF" />
                            <SortableHeader columnKey="periodo_evento" title="Período Evento" />
                            <SortableHeader columnKey="data_pagamento" title="Data Pag." />
                            <SortableHeader columnKey="valor_deslocamento_aprovado" title="Deslocamento" align="right" />
                            <SortableHeader columnKey="valor_diaria_aprovado" title="Diárias" align="right" />
                            <SortableHeader columnKey="valor_ajuda_custo" title="Ajuda Custo" align="right" />
                            <SortableHeader columnKey="valor_total_aprovado" title="Total" align="right" />
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedReportData.length > 0 ? sortedReportData.map(s => {
                            const solicitante = findUserById(s.usuario_id);
                            return (
                                <tr key={s.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{s.protocolo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{solicitante?.nome}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{solicitante?.cpf}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{s.periodo_evento}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(s.data_pagamento!)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{formatCurrency(s.valor_deslocamento_aprovado)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{formatCurrency(s.valor_diaria_aprovado)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{formatCurrency(s.valor_ajuda_custo)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">{formatCurrency(s.valor_total_aprovado)}</td>
                                </tr>
                            )
                        }) : (
                             <tr>
                                <td colSpan={9} className="text-center py-10 text-gray-500">
                                    Nenhum pagamento encontrado para o período selecionado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    {reportData.length > 0 && (
                        <tfoot className="bg-gray-100 font-bold">
                            <tr>
                                <td colSpan={5} className="px-6 py-3 text-right text-sm text-gray-800">TOTAIS</td>
                                <td className="px-6 py-3 text-right text-sm text-gray-800">{formatCurrency(totals.deslocamento)}</td>
                                <td className="px-6 py-3 text-right text-sm text-gray-800">{formatCurrency(totals.diarias)}</td>
                                <td className="px-6 py-3 text-right text-sm text-gray-800">{formatCurrency(totals.ajudaCusto)}</td>
                                <td className="px-6 py-3 text-right text-sm text-gray-800">{formatCurrency(totals.total)}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
};

export default RelatorioFinanceiro;