
import React, { useContext, useState, useEffect, useRef } from 'react';
import { Solicitacao, StatusSolicitacao, TipoUsuario } from '../types';
import { AppContext } from '../AppContext';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const DetailItem: React.FC<{ label: string; value?: string | number | null | boolean }> = ({ label, value }) => (
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-sm text-gray-900 break-words">{typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : (value ?? 'N/A')}</p>
    </div>
);

const JustificativaModal: React.FC<{ title: string, onConfirm: (justificativa: string) => void, onCancel: () => void, loading: boolean }> = ({ title, onConfirm, onCancel, loading }) => {
    const [justificativa, setJustificativa] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = () => {
        if (!justificativa.trim()) {
            setError('A justificativa é obrigatória.');
            return;
        }
        onConfirm(justificativa);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-5 border-b">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                </div>
                <div className="p-5 space-y-4">
                    <textarea
                        value={justificativa}
                        onChange={(e) => { setJustificativa(e.target.value); setError(''); }}
                        rows={4}
                        className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Descreva o motivo..."
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <div className="p-4 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button onClick={handleConfirm} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
                        {loading ? 'Confirmando...' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const PrestacaoContasForm: React.FC<{ solicitacao: Solicitacao, onSubmit: (atividades: string, files: File[], obs: string) => void, loading: boolean }> = ({solicitacao, onSubmit, loading}) => {
    const [atividades, setAtividades] = useState(solicitacao.prestacao_contas_atividades || '');
    const [files, setFiles] = useState<File[]>([]); // Don't pre-fill files for security reasons
    const [observacoes, setObservacoes] = useState(solicitacao.prestacao_contas_observacoes || '');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!atividades.trim()){
            alert("Por favor, descreva as atividades realizadas.");
            return;
        }
        onSubmit(atividades, files, observacoes);
    }

    return (
        <form onSubmit={handleSubmit} className="mt-6 border-t pt-6 space-y-4">
            <h4 className="text-md font-semibold text-gray-800">Formulário de Prestação de Contas</h4>
            <div>
                 <label htmlFor="prestacao-atividades" className="block text-sm font-medium text-gray-700 mb-1">Atividades Realizadas</label>
                 <textarea
                    id="prestacao-atividades"
                    value={atividades}
                    onChange={(e) => setAtividades(e.target.value)}
                    rows={8}
                    className="mt-1 p-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descreva detalhadamente as atividades realizadas durante o evento..."
                    required
                 />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Arquivos Comprobatórios (PDF, JPG, PNG)</label>
                <input type="file" multiple onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                {files.length > 0 && <div className="mt-2 text-sm text-gray-600">Arquivos selecionados: {files.map(f => f.name).join(', ')}</div>}
            </div>
            <div>
                 <label className="block text-sm font-medium text-gray-700">Observações Adicionais</label>
                 <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} className="mt-1 p-2 w-full border rounded-md"></textarea>
            </div>
            <div className="text-right">
                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Enviando...' : 'Enviar para Análise'}
                </button>
            </div>
        </form>
    )
}

const FileViewerModal: React.FC<{ file: { url: string; name: string; type: string }, onClose: () => void }> = ({ file, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 truncate">{file.name}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
            </div>
            <div className="flex-grow p-2 bg-gray-200 overflow-auto">
                {file.type.startsWith('image/') ? (
                    <img src={file.url} alt={file.name} className="max-w-full max-h-full mx-auto" />
                ) : file.type === 'application/pdf' ? (
                    <iframe src={file.url} className="w-full h-full border-0" title={file.name} />
                ) : (
                    <div className="text-center p-10">
                        <p>Visualização não disponível para este tipo de arquivo.</p>
                        <a href={file.url} download={file.name} className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Baixar Arquivo
                        </a>
                    </div>
                )}
            </div>
        </div>
    </div>
);

const PaymentModal: React.FC<{ onConfirm: (paymentDate: string) => void; onClose: () => void, loading: boolean }> = ({ onConfirm, onClose, loading }) => {
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10)); // Default to today
    const [error, setError] = useState('');

    const handleConfirm = () => {
        if (!paymentDate) {
            setError('A data do pagamento é obrigatória.');
            return;
        }
        onConfirm(paymentDate);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-5 border-b">
                    <h3 className="text-lg font-bold text-gray-900">Registrar Pagamento</h3>
                </div>
                <div className="p-5 space-y-4">
                    <label htmlFor="payment-date" className="block text-sm font-medium text-gray-700">Data do Pagamento</label>
                    <input
                        id="payment-date"
                        type="date"
                        value={paymentDate}
                        onChange={(e) => { setPaymentDate(e.target.value); setError(''); }}
                        className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <div className="p-4 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button onClick={handleConfirm} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
                        {loading ? 'Confirmando...' : 'Confirmar Pagamento'}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface SolicitacaoDetalhesProps {
  solicitacao: Solicitacao;
  onClose: () => void;
  onEdit: (solicitacao: Solicitacao) => void;
}

const SolicitacaoDetalhes: React.FC<SolicitacaoDetalhesProps> = ({ solicitacao, onClose, onEdit }) => {
  const context = useContext(AppContext);
  const { profile: currentUser, updateSolicitacao, findUserById } = context!;
  
  const solicitante = findUserById(solicitacao.usuario_id);

  const [editableValues, setEditableValues] = useState({
      valor_deslocamento_aprovado: solicitacao.valor_deslocamento_aprovado,
      valor_diaria_aprovado: solicitacao.valor_diaria_aprovado,
      valor_ajuda_custo: solicitacao.valor_ajuda_custo
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [totalAprovado, setTotalAprovado] = useState(solicitacao.valor_total_aprovado);
  const [showJustificativaModal, setShowJustificativaModal] = useState<StatusSolicitacao | null>(null);
  const [isPrestacaoMode, setIsPrestacaoMode] = useState(false);
  const [viewingFile, setViewingFile] = useState<{ url: string; name: string; type: string } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const isAuthorizer = currentUser?.tipo_usuario === TipoUsuario.AUTORIZADOR || currentUser?.tipo_usuario === TipoUsuario.ADMINISTRADOR;
  const isOwner = currentUser?.id === solicitacao.usuario_id;
  const isPostApproval = [
    StatusSolicitacao.APROVADA,
    StatusSolicitacao.AGUARDANDO_PRESTACAO_DE_CONTAS,
    StatusSolicitacao.PRESTACAO_EM_ANALISE,
    StatusSolicitacao.PENDENCIA_NA_PRESTACAO_DE_CONTAS,
    StatusSolicitacao.FINALIZADA
  ].includes(solicitacao.status);


  useEffect(() => {
    const total = 
        Number(editableValues.valor_deslocamento_aprovado) + 
        Number(editableValues.valor_diaria_aprovado) + 
        Number(editableValues.valor_ajuda_custo);
    setTotalAprovado(total);
  }, [editableValues]);

  useEffect(() => {
    if (isOwner && [
        StatusSolicitacao.AGUARDANDO_PRESTACAO_DE_CONTAS,
        StatusSolicitacao.PENDENCIA_NA_PRESTACAO_DE_CONTAS
    ].includes(solicitacao.status)) {
        setIsPrestacaoMode(true);
    }
  }, [solicitacao.status, isOwner]);


  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setEditableValues(prev => ({...prev, [name]: Number(value)}));
  }

  const handleStatusChange = async (newStatus: StatusSolicitacao, justificativa?: string) => {
      setActionLoading(true);
      let updatedSolicitacao: Solicitacao = {
          ...solicitacao, 
          status: newStatus,
          justificativa_avaliador: justificativa || solicitacao.justificativa_avaliador,
      };

      if(isAuthorizer && newStatus === StatusSolicitacao.APROVADA) {
          updatedSolicitacao = {
              ...updatedSolicitacao,
              ...editableValues,
              valor_total_aprovado: totalAprovado,
              status: StatusSolicitacao.AGUARDANDO_PRESTACAO_DE_CONTAS,
          }
      }
      await updateSolicitacao(updatedSolicitacao);
      alert(`Solicitação ${newStatus}!`);
      setShowJustificativaModal(null);
      setActionLoading(false);
      if (newStatus !== StatusSolicitacao.PENDENCIA_NA_PRESTACAO_DE_CONTAS) {
        onClose();
      }
  }
  
   const handleConfirmJustificativa = async (justificativa: string) => {
        if (showJustificativaModal) {
            await handleStatusChange(showJustificativaModal, justificativa);
        }
    };

  const handlePrestacaoContasSubmit = async (atividades: string, files: File[], obs: string) => {
      setActionLoading(true);
      const updatedSolicitacao: Solicitacao = {
          ...solicitacao,
          prestacao_contas_atividades: atividades,
          // prestacao_contas_arquivos: files, // File upload needs a separate logic to Supabase Storage
          prestacao_contas_observacoes: obs,
          status: StatusSolicitacao.PRESTACAO_EM_ANALISE
      };
      await updateSolicitacao(updatedSolicitacao);
      alert(`Prestação de contas enviada! O aprovador será notificado.`);
      setActionLoading(false);
      onClose();
  }
  
  const handlePaymentConfirm = async (paymentDate: string) => {
    setActionLoading(true);
    const updatedSolicitacao = { ...solicitacao, data_pagamento: paymentDate };
    await updateSolicitacao(updatedSolicitacao);
    setShowPaymentModal(false);
    alert(`Pagamento registrado com sucesso na data ${new Date(paymentDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}.`);
    setActionLoading(false);
  };


  const getJustificativaModalTitle = () => {
    switch(showJustificativaModal) {
        case StatusSolicitacao.REPROVADA:
            return 'Motivo da Reprovação';
        case StatusSolicitacao.AGUARDANDO_CORRECAO:
            return 'Detalhes para Correção';
        case StatusSolicitacao.PENDENCIA_NA_PRESTACAO_DE_CONTAS:
            return 'Ajustes Necessários na Prestação de Contas';
        default:
            return '';
    }
  }


  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-full overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Detalhes da Solicitação - {solicitacao.protocolo}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        
        <div className="p-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
                <DetailItem label="Solicitante" value={solicitante?.nome} />
                <DetailItem label="E-mail do Solicitante" value={solicitante?.email} />
                <DetailItem label="Categoria do Solicitante" value={solicitante?.categoria} />
                <DetailItem label="Status" value={solicitacao.status} />
                <DetailItem label="Evento" value={solicitacao.nome_evento} />
                <DetailItem label="Período" value={solicitacao.periodo_evento} />
                <DetailItem label="Local" value={solicitacao.local_evento} />
                <DetailItem label="Origem/Destino" value={`${solicitacao.cidade_origem} -> ${solicitacao.cidade_destino}`} />
                <DetailItem label="Qtd. Diárias" value={solicitacao.qtd_diaria} />
                {solicitacao.data_pagamento && <DetailItem label="Data do Pagamento" value={new Date(solicitacao.data_pagamento).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} />}
            </dl>

            {solicitacao.justificativa_avaliador && [StatusSolicitacao.AGUARDANDO_CORRECAO, StatusSolicitacao.REPROVADA, StatusSolicitacao.PENDENCIA_NA_PRESTACAO_DE_CONTAS].includes(solicitacao.status) && (
                <div className="mt-6 border-t pt-6 bg-yellow-50 p-4 rounded-lg">
                    <h4 className="text-md font-semibold text-yellow-800 mb-2">Observações do Avaliador</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{solicitacao.justificativa_avaliador}</p>
                </div>
            )}

            <div className="mt-6 border-t pt-6">
                 <h4 className="text-md font-semibold text-gray-800 mb-4">Valores</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Deslocamento Calculado</p>
                        <p className="font-semibold text-lg">{formatCurrency(solicitacao.valor_deslocamento_calculado)}</p>
                     </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Diárias Calculadas</p>
                        <p className="font-semibold text-lg">{formatCurrency(solicitacao.valor_diaria_calculado)}</p>
                     </div>
                 </div>
            </div>

            {isAuthorizer && (solicitacao.status === StatusSolicitacao.PENDENTE_DE_APROVACAO || solicitacao.status === StatusSolicitacao.APROVADA) && (
                <div className="mt-6 border-t pt-6">
                    <h4 className="text-md font-semibold text-gray-800 mb-4">Aprovação de Valores</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="text-sm font-medium">Desloc. Aprovado</label>
                            <input type="number" name="valor_deslocamento_aprovado" value={editableValues.valor_deslocamento_aprovado} onChange={handleValueChange} className="mt-1 p-2 w-full border rounded"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Diárias Aprovadas</label>
                            <input type="number" name="valor_diaria_aprovado" value={editableValues.valor_diaria_aprovado} onChange={handleValueChange} className="mt-1 p-2 w-full border rounded"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Ajuda de Custo</label>
                            <input type="number" name="valor_ajuda_custo" value={editableValues.valor_ajuda_custo} onChange={handleValueChange} className="mt-1 p-2 w-full border rounded"/>
                        </div>
                         <div className="bg-blue-50 p-3 rounded text-center">
                            <p className="text-sm text-blue-800">Total Aprovado</p>
                            <p className="font-bold text-xl text-blue-900">{formatCurrency(totalAprovado)}</p>
                         </div>
                    </div>
                </div>
            )}
            
            {isOwner && solicitacao.status === StatusSolicitacao.APROVADA && !isPrestacaoMode && (
              <div className="mt-6 border-t pt-6 text-center">
                <button onClick={() => setIsPrestacaoMode(true)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Apresentar Prestação de Contas</button>
              </div>
            )}

            {isOwner && isPrestacaoMode && (
                <PrestacaoContasForm solicitacao={solicitacao} onSubmit={handlePrestacaoContasSubmit} loading={actionLoading} />
            )}
            
             {isOwner && solicitacao.status === StatusSolicitacao.AGUARDANDO_CORRECAO && (
                <div className="mt-6 border-t pt-6 text-center">
                   <p className="text-orange-600 font-semibold mb-4">Esta solicitação precisa de correções. Por favor, edite a solicitação e envie novamente.</p>
                   <button onClick={() => onEdit?.(solicitacao)} className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">Corrigir Solicitação</button>
                </div>
            )}

            {isAuthorizer && solicitacao.status === StatusSolicitacao.PRESTACAO_EM_ANALISE && (
                 <div className="mt-6 border-t pt-6">
                    <h4 className="text-md font-semibold text-gray-800 mb-4">Prestação de Contas Enviada</h4>
                     <div className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Atividades Realizadas</p>
                            <div className="mt-1 p-3 w-full border rounded-md bg-gray-50 text-sm text-gray-900 whitespace-pre-wrap">
                                {solicitacao.prestacao_contas_atividades || 'Nenhuma atividade descrita.'}
                            </div>
                        </div>
                        <DetailItem label="Observações do Solicitante" value={solicitacao.prestacao_contas_observacoes}/>
                    </div>
                </div>
            )}

        </div>
        <div className="p-6 bg-gray-50 rounded-b-lg flex flex-wrap justify-end gap-3">
             {isAuthorizer && isPostApproval && !solicitacao.data_pagamento && (
                <button onClick={() => setShowPaymentModal(true)} className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600">Registrar Pagamento</button>
             )}
             {isAuthorizer && solicitacao.status === StatusSolicitacao.PENDENTE_DE_APROVACAO && (
                <>
                    <button onClick={() => setShowJustificativaModal(StatusSolicitacao.AGUARDANDO_CORRECAO)} disabled={actionLoading} className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 disabled:opacity-50">Solicitar Correção</button>
                    <button onClick={() => setShowJustificativaModal(StatusSolicitacao.REPROVADA)} disabled={actionLoading} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50">Reprovar</button>
                    <button onClick={() => handleStatusChange(StatusSolicitacao.APROVADA)} disabled={actionLoading} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50">Aprovar</button>
                </>
             )}
              {isAuthorizer && solicitacao.status === StatusSolicitacao.PRESTACAO_EM_ANALISE && (
                <>
                    <button onClick={() => setShowJustificativaModal(StatusSolicitacao.PENDENCIA_NA_PRESTACAO_DE_CONTAS)} disabled={actionLoading} className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 disabled:opacity-50">Solicitar Ajustes</button>
                    <button onClick={() => handleStatusChange(StatusSolicitacao.FINALIZADA)} disabled={actionLoading} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50">Aprovar Prestação</button>
                </>
             )}
             <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Fechar</button>
        </div>
      </div>
    </div>
    {showJustificativaModal && (
        <JustificativaModal
            title={getJustificativaModalTitle()}
            onConfirm={handleConfirmJustificativa}
            onCancel={() => setShowJustificativaModal(null)}
            loading={actionLoading}
        />
    )}
    {viewingFile && (
        <FileViewerModal file={viewingFile} onClose={() => setViewingFile(null)} />
    )}
    {showPaymentModal && (
        <PaymentModal onConfirm={handlePaymentConfirm} onClose={() => setShowPaymentModal(false)} loading={actionLoading} />
    )}
    </>
  );
};

export default SolicitacaoDetalhes;
