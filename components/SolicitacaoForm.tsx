
import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AppContext } from '../AppContext.ts';
import { Solicitacao, StatusSolicitacao } from '../types.ts';

interface SolicitacaoFormProps {
  onCancel: () => void;
  onSubmit: () => void;
  solicitacaoToEdit?: Solicitacao | null;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const auxilioExternoFields = [
  { label: 'Transfer aeroporto/hotel', name: 'custeio_transfer_aeroporto_hotel' },
  { label: 'Transfer hotel/local do evento', name: 'custeio_transfer_hotel_local_evento' },
  { label: 'Adicional de deslocamento', name: 'custeio_adicional_deslocamento' },
  { label: 'Passagens aéreas', name: 'custeio_passagem_aerea' },
  { label: 'Passagens rodoviárias', name: 'custeio_passagem_rodoviaria' },
  { label: 'Hospedagem', name: 'custeio_hospedagem' },
  { label: 'Diárias', name: 'custeio_diarias' },
  { label: 'Café da Manhã', name: 'custeio_cafe_manha' },
  { label: 'Almoço', name: 'custeio_almoco' },
  { label: 'Jantar', name: 'custeio_jantar' },
];

const SolicitacaoForm: React.FC<SolicitacaoFormProps> = ({ onCancel, onSubmit, solicitacaoToEdit }) => {
  const context = useContext(AppContext);
  const { 
      profile, addSolicitacao, updateSolicitacao, deslocamentoValores, diariaValores,
      tiposDeEvento, instituicoesExecutoras, addTipoEvento, addInstituicaoExecutora 
    } = context!;

  const isEditMode = !!solicitacaoToEdit;
  const [loading, setLoading] = useState(false);

  const getInitialFormData = () => {
    if (isEditMode && solicitacaoToEdit) {
      return solicitacaoToEdit;
    }
    return {
      usuario_id: profile?.id,
      hospedagem_cosems: false,
      deslocamento_terrestre: true,
      deslocamento_aereo: false,
      qtd_diaria: 0,
      tipo_evento: '',
      instituicao_executora: '',
    };
  }

  const [formData, setFormData] = useState<Partial<Solicitacao>>(getInitialFormData());

  const [outroTipoEvento, setOutroTipoEvento] = useState('');
  const [isOutroTipoEvento, setIsOutroTipoEvento] = useState(false);
  const [outraInstituicao, setOutraInstituicao] = useState('');
  const [isOutraInstituicao, setIsOutraInstituicao] = useState(false);

  useEffect(() => {
    if (isEditMode && solicitacaoToEdit) {
      setFormData(solicitacaoToEdit);
      const tipoExists = tiposDeEvento.some(t => t.nome === solicitacaoToEdit.tipo_evento);
      setIsOutroTipoEvento(!tipoExists);
      if(!tipoExists) setOutroTipoEvento(solicitacaoToEdit.tipo_evento);

      const instituicaoExists = instituicoesExecutoras.some(i => i.nome === solicitacaoToEdit.instituicao_executora);
      setIsOutraInstituicao(!instituicaoExists);
      if(!instituicaoExists) setOutraInstituicao(solicitacaoToEdit.instituicao_executora);

    }
  }, [solicitacaoToEdit, isEditMode, tiposDeEvento, instituicoesExecutoras]);


  useEffect(() => {
    if (formData.data_partida && formData.data_retorno) {
        const partida = new Date(formData.data_partida);
        const retorno = new Date(formData.data_retorno);

        if (isNaN(partida.getTime()) || isNaN(retorno.getTime()) || retorno < partida) {
            setFormData(prev => ({ ...prev, qtd_diaria: 0 }));
            return;
        }

        const partidaUTC = Date.UTC(partida.getUTCFullYear(), partida.getUTCMonth(), partida.getUTCDate());
        const retornoUTC = Date.UTC(retorno.getUTCFullYear(), retorno.getUTCMonth(), retorno.getUTCDate());
        
        const timeDiff = retornoUTC - partidaUTC;
        
        if (timeDiff === 0) {
             setFormData(prev => ({ ...prev, qtd_diaria: 0.5 }));
        } else {
            const dayDiff = timeDiff / (1000 * 3600 * 24);
            setFormData(prev => ({ ...prev, qtd_diaria: dayDiff + 1 }));
        }
    } else {
        setFormData(prev => ({ ...prev, qtd_diaria: 0 }));
    }
}, [formData.data_partida, formData.data_retorno]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAuxilioExternoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    
    if (type === 'checkbox') {
      const qtdName = `${name}_qtd`;
      if (checked) {
        setFormData(prev => ({ ...prev, [name]: true, [qtdName]: 1 }));
      } else {
        const newForm = {...formData};
        delete newForm[name as keyof Solicitacao];
        delete newForm[qtdName as keyof Solicitacao];
        setFormData(newForm);
      }
    } else if (type === 'number') {
      const intValue = parseInt(value, 10);
      if (value === '' || (intValue >= 1 && intValue <= 10)) {
        setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : intValue }));
      }
    }
  };
  
  const handleTipoEventoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = e.target;
      if (value === 'outro') {
          setIsOutroTipoEvento(true);
          setFormData(prev => ({ ...prev, tipo_evento: '' }));
      } else {
          setIsOutroTipoEvento(false);
          setOutroTipoEvento('');
          setFormData(prev => ({ ...prev, tipo_evento: value }));
      }
  };

  const handleInstituicaoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = e.target;
      if (value === 'outro') {
          setIsOutraInstituicao(true);
          setFormData(prev => ({ ...prev, instituicao_executora: '' }));
      } else {
          setIsOutraInstituicao(false);
          setOutraInstituicao('');
          setFormData(prev => ({ ...prev, instituicao_executora: value }));
      }
  };


  const valorDiariaCalculado = useMemo(() => {
      const valorBase = diariaValores.find(d => d.cargo === profile?.categoria)?.valor || 0;
      return valorBase * (Number(formData.qtd_diaria) || 0);
  }, [formData.qtd_diaria, profile?.categoria, diariaValores]);

  const valorDeslocamentoCalculado = useMemo(() => {
      if (!formData.deslocamento_terrestre) return 0;
      return deslocamentoValores.find(d => d.faixa === formData.categoria_deslocamento)?.valor || 0;
  }, [formData.categoria_deslocamento, formData.deslocamento_terrestre, deslocamentoValores]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const tipoEventoFinal = (isOutroTipoEvento ? outroTipoEvento.trim() : formData.tipo_evento) || '';
    const instituicaoFinal = (isOutraInstituicao ? outraInstituicao.trim() : formData.instituicao_executora) || '';

    if (isOutroTipoEvento && tipoEventoFinal) {
        await addTipoEvento(tipoEventoFinal);
    }
    if (isOutraInstituicao && instituicaoFinal) {
        await addInstituicaoExecutora(instituicaoFinal);
    }

    let periodoEventoStr = '';
    if (formData.data_partida && formData.data_retorno) {
        const [yP, mP, dP] = formData.data_partida.split('-');
        const partidaStr = `${dP}/${mP}/${yP}`;
        const [yR, mR, dR] = formData.data_retorno.split('-');
        const retornoStr = `${dR}/${mR}/${yR}`;
        periodoEventoStr = partidaStr === retornoStr ? partidaStr : `${partidaStr} a ${retornoStr}`;
    }
    
    const calculatedValues = {
        valor_deslocamento_calculado: valorDeslocamentoCalculado,
        valor_diaria_calculado: valorDiariaCalculado,
        valor_deslocamento_aprovado: valorDeslocamentoCalculado,
        valor_diaria_aprovado: valorDiariaCalculado,
        valor_ajuda_custo: 0,
        valor_total_aprovado: valorDeslocamentoCalculado + valorDiariaCalculado,
    };

    if (isEditMode) {
      const updatedData: Solicitacao = {
          ...solicitacaoToEdit,
          ...formData,
          ...calculatedValues,
          tipo_evento: tipoEventoFinal,
          instituicao_executora: instituicaoFinal,
          periodo_evento: periodoEventoStr,
          status: StatusSolicitacao.PENDENTE_DE_APROVACAO,
          justificativa_avaliador: '', // Clear previous justification
      };
      await updateSolicitacao(updatedData);
      alert('Solicitação atualizada e reenviada para análise!');
    } else {
      const finalData = {
          ...formData,
          ...calculatedValues,
          tipo_evento: tipoEventoFinal,
          instituicao_executora: instituicaoFinal,
          periodo_evento: periodoEventoStr,
      } as Omit<Solicitacao, 'id' | 'protocolo' | 'status'>;
      await addSolicitacao(finalData);
      alert('Solicitação enviada com sucesso!');
    }
    setLoading(false);
    onSubmit();
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{isEditMode ? 'Editar Solicitação' : 'Nova Solicitação de Auxílio'}</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Detalhes do Evento e Viagem */}
        <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">1. Detalhes do Evento e Viagem</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome do Evento</label>
                    <input type="text" name="nome_evento" value={formData.nome_evento || ''} onChange={handleChange} required className="mt-1 p-2 w-full border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo do Evento</label>
                    <select name="tipo_evento" value={isOutroTipoEvento ? 'outro' : formData.tipo_evento} onChange={handleTipoEventoChange} required className="mt-1 p-2 w-full border rounded bg-white">
                        <option value="">Selecione...</option>
                        {tiposDeEvento.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
                        <option value="outro">Outro...</option>
                    </select>
                    {isOutroTipoEvento && (
                        <input type="text" value={outroTipoEvento} onChange={e => setOutroTipoEvento(e.target.value)} placeholder="Especifique o tipo do evento" required className="mt-2 p-2 w-full border rounded" />
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Local do Evento</label>
                    <input type="text" name="local_evento" value={formData.local_evento || ''} onChange={handleChange} required className="mt-1 p-2 w-full border rounded"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Instituição Executora</label>
                    <select name="instituicao_executora" value={isOutraInstituicao ? 'outro' : formData.instituicao_executora} onChange={handleInstituicaoChange} required className="mt-1 p-2 w-full border rounded bg-white">
                        <option value="">Selecione...</option>
                        {instituicoesExecutoras.map(i => <option key={i.id} value={i.nome}>{i.nome}</option>)}
                        <option value="outro">Outra...</option>
                    </select>
                    {isOutraInstituicao && (
                        <input type="text" value={outraInstituicao} onChange={e => setOutraInstituicao(e.target.value)} placeholder="Especifique a instituição" required className="mt-2 p-2 w-full border rounded" />
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cidade de Origem</label>
                    <input type="text" name="cidade_origem" value={formData.cidade_origem || ''} onChange={handleChange} required className="mt-1 p-2 w-full border rounded"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cidade de Destino</label>
                    <input type="text" name="cidade_destino" value={formData.cidade_destino || ''} onChange={handleChange} required className="mt-1 p-2 w-full border rounded"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Mês/Ano de Referência</label>
                    <input type="month" name="mes_ano_ref" value={formData.mes_ano_ref || ''} onChange={handleChange} required className="mt-1 p-2 w-full border rounded"/>
                </div>
                <div/>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Partida</label>
                    <input type="date" name="data_partida" value={formData.data_partida || ''} onChange={handleChange} required className="mt-1 p-2 w-full border rounded"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Retorno</label>
                    <input type="date" name="data_retorno" value={formData.data_retorno || ''} onChange={handleChange} required className="mt-1 p-2 w-full border rounded"/>
                </div>
            </div>
        </div>

        {/* Auxílios de Outras Instituições */}
        <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">2. Auxílios recebidos de outras instituições</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {auxilioExternoFields.map(({ label, name }) => (
                    <div key={name} className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id={name}
                                name={name}
                                type="checkbox"
                                checked={!!formData[name as keyof Solicitacao]}
                                onChange={handleAuxilioExternoChange}
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label htmlFor={name} className="ml-3 text-sm font-medium text-gray-700">{label}</label>
                        </div>
                        {formData[name as keyof Solicitacao] && (
                            <div className="w-24">
                                <label htmlFor={`${name}_qtd`} className="sr-only">Quantidade para {label}</label>
                                <input
                                    id={`${name}_qtd`}
                                    name={`${name}_qtd`}
                                    type="number"
                                    min="1"
                                    max="10"
                                    step="1"
                                    value={(formData[`${name}_qtd` as keyof Solicitacao] as number | undefined) || ''}
                                    onChange={handleAuxilioExternoChange}
                                    className="p-1 w-full border rounded text-center"
                                    placeholder="Qtd."
                                    required
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>


        {/* Custeio e Valores */}
        <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">3. Custeio e Valores (COSEMS)</h3>
            <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5"><input id="deslocamento_terrestre" name="deslocamento_terrestre" type="checkbox" checked={formData.deslocamento_terrestre} onChange={handleChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"/></div>
                  <div className="ml-3 text-sm"><label htmlFor="deslocamento_terrestre" className="font-medium text-gray-700">Necessita de deslocamento terrestre?</label></div>
                </div>
                {formData.deslocamento_terrestre && (
                    <select name="categoria_deslocamento" value={formData.categoria_deslocamento || ''} onChange={handleChange} className="w-full p-2 border rounded">
                        <option value="">Selecione a faixa de distância</option>
                        {deslocamentoValores.map(d => <option key={d.id} value={d.faixa}>{d.faixa}</option>)}
                    </select>
                )}
                 <div className="flex items-start">
                  <div className="flex items-center h-5"><input id="deslocamento_aereo" name="deslocamento_aereo" type="checkbox" checked={formData.deslocamento_aereo} onChange={handleChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"/></div>
                  <div className="ml-3 text-sm"><label htmlFor="deslocamento_aereo" className="font-medium text-gray-700">Haverá deslocamento aéreo?</label></div>
                </div>

                {formData.deslocamento_aereo && (
                    <div className="pl-8 pt-2 space-y-4 border-l-2 border-gray-200 ml-2">
                        <div>
                            <label htmlFor="voo_ida" className="block text-sm font-medium text-gray-700">Voo de Ida</label>
                            <textarea id="voo_ida" name="voo_ida" rows={2} value={formData.voo_ida || ''} onChange={handleChange} placeholder="Informe o aeroporto de origem, número do voo, companhia e data de partida" className="mt-1 p-2 w-full border rounded"/>
                        </div>
                        <div>
                            <label htmlFor="voo_volta" className="block text-sm font-medium text-gray-700">Voo de Volta</label>
                            <textarea id="voo_volta" name="voo_volta" rows={2} value={formData.voo_volta || ''} onChange={handleChange} placeholder="Informe o aeroporto de origem, número do voo, companhia e data de retorno" className="mt-1 p-2 w-full border rounded"/>
                        </div>
                    </div>
                )}


                <div className="flex items-start">
                  <div className="flex items-center h-5"><input id="hospedagem_cosems" name="hospedagem_cosems" type="checkbox" checked={formData.hospedagem_cosems} onChange={handleChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"/></div>
                  <div className="ml-3 text-sm"><label htmlFor="hospedagem_cosems" className="font-medium text-gray-700">Hospedagem por conta do COSEMS?</label></div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Quantidade de Diárias (Calculado)</label>
                    <input type="number" name="qtd_diaria" value={formData.qtd_diaria} readOnly className="mt-1 p-2 w-full border rounded bg-gray-100"/>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p>Valor da Diária Calculado: <span className="font-bold">{formatCurrency(valorDiariaCalculado)}</span></p>
                    <p>Valor do Deslocamento Calculado: <span className="font-bold">{formatCurrency(valorDeslocamentoCalculado)}</span></p>
                </div>
            </div>
        </div>

        <textarea name="observacoes" placeholder="Observações adicionais" value={formData.observacoes || ''} rows={4} onChange={handleChange} className="w-full p-2 border rounded"/>

        <div className="flex justify-end space-x-4">
          <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Enviando...' : (isEditMode ? 'Salvar Alterações e Reenviar' : 'Enviar Solicitação')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SolicitacaoForm;