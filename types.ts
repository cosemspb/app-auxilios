import { Session, User } from '@supabase/supabase-js';

export enum TipoUsuario {
  SOLICITANTE = 'solicitante',
  AUTORIZADOR = 'autorizador',
  ADMINISTRADOR = 'administrador',
}

export enum StatusSolicitacao {
  PENDENTE_DE_APROVACAO = 'Pendente de Aprovação',
  AGUARDANDO_CORRECAO = 'Aguardando Correção',
  APROVADA = 'Aprovada',
  REPROVADA = 'Reprovada',
  CANCELADA = 'Cancelada',
  AGUARDANDO_PRESTACAO_DE_CONTAS = 'Aguardando Prestação de Contas',
  PRESTACAO_EM_ANALISE = 'Prestação de Contas em Análise',
  PENDENCIA_NA_PRESTACAO_DE_CONTAS = 'Pendência na Prestação de Contas',
  FINALIZADA = 'Finalizada',
}


export interface Usuario {
  id: string; // Changed to string for Supabase UUID
  email: string;
  nome: string;
  cpf: string;
  categoria: string; // Cargo/Posição
  dados_bancarios: string;
  necessidades_especiais: string;
  tipo_usuario: TipoUsuario;
  foto_url?: string;
}

export interface Solicitacao {
  id: number;
  protocolo: string;
  usuario_id: string; // Changed to string for Supabase UUID
  status: StatusSolicitacao;
  mes_ano_ref: string;
  periodo_evento: string;
  tipo_evento: string;
  nome_evento: string;
  local_evento: string;
  instituicao_executora: string;
  cidade_origem: string;
  cidade_destino: string;
  data_partida: string;
  data_retorno: string;
  data_pagamento?: string; // Data em que o pagamento foi efetuado
  hospedagem_cosems: boolean;
  deslocamento_terrestre: boolean;
  deslocamento_aereo: boolean;
  voo_ida?: string;
  voo_volta?: string;
  categoria_deslocamento: string;
  qtd_diaria: number;
  valor_deslocamento_calculado: number;
  valor_diaria_calculado: number;
  valor_deslocamento_aprovado: number;
  valor_diaria_aprovado: number;
  valor_ajuda_custo: number;
  valor_total_aprovado: number;
  observacoes?: string;
  prestacao_contas_arquivos?: any; // Using any for JSONB flexibility
  prestacao_contas_atividades?: string;
  prestacao_contas_observacoes?: string;
  justificativa_avaliador?: string;
  created_at?: string;

  // Auxílios de outras instituições
  custeio_transfer_aeroporto_hotel?: boolean;
  custeio_transfer_aeroporto_hotel_qtd?: number;
  custeio_transfer_hotel_local_evento?: boolean;
  custeio_transfer_hotel_local_evento_qtd?: number;
  custeio_adicional_deslocamento?: boolean;
  custeio_adicional_deslocamento_qtd?: number;
  custeio_passagem_aerea?: boolean;
  custeio_passagem_aerea_qtd?: number;
  custeio_passagem_rodoviaria?: boolean;
  custeio_passagem_rodoviaria_qtd?: number;
  custeio_hospedagem?: boolean;
  custeio_hospedagem_qtd?: number;
  custeio_diarias?: boolean;
  custeio_diarias_qtd?: number;
  custeio_cafe_manha?: boolean;
  custeio_cafe_manha_qtd?: number;
  custeio_almoco?: boolean;
  custeio_almoco_qtd?: number;
  custeio_jantar?: boolean;
  custeio_jantar_qtd?: number;
}

export interface DeslocamentoValor {
  id: number;
  valor: number;
  faixa: string;
}

export interface DiariaValor {
  id: number;
  valor: number;
  cargo: string;
}


export interface AppContextType {
  session: Session | null;
  profile: Usuario | null;
  originalUser: Usuario | null; // Profile from DB
  users: Usuario[];
  logout: () => Promise<void>;
  login: (email: string, password?: string) => Promise<string | null>;
  register: (userData: any, secretCode?: string) => Promise<string | null>;
  updateUser: (user: Usuario) => Promise<void>;
  updatePassword: (password: string) => Promise<string | null>;
  solicitacoes: Solicitacao[];
  addSolicitacao: (solicitacao: Omit<Solicitacao, 'id' | 'protocolo' | 'status'>) => Promise<void>;
  updateSolicitacao: (solicitacao: Solicitacao) => Promise<void>;
  deslocamentoValores: DeslocamentoValor[];
  diariaValores: DiariaValor[];
  findUserById: (id: string) => Usuario | undefined;
  openModal: (modal: any) => void;
  switchRole: (newRole: TipoUsuario) => void;
  tiposDeEvento: {id: number, nome: string}[];
  instituicoesExecutoras: {id: number, nome: string}[];
  addTipoEvento: (tipo: string) => Promise<void>;
  addInstituicaoExecutora: (instituicao: string) => Promise<void>;
  loading: boolean;
}