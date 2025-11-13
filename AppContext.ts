
import React from 'react';
import { Session } from '@supabase/supabase-js';
import { Usuario, Solicitacao, TipoUsuario, DeslocamentoValor, DiariaValor } from './types.ts';

export type ModalState =
  | { view: 'none' }
  | { view: 'profile'; user: Usuario }
  | { view: 'forgotPassword' }
  | { view: 'resetPassword' };

export interface AppContextType {
  session: Session | null;
  profile: Usuario | null;
  originalUser: Usuario | null;
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
  openModal: (modal: ModalState) => void;
  switchRole: (newRole: TipoUsuario) => void;
  tiposDeEvento: {id: number, nome: string}[];
  instituicoesExecutoras: {id: number, nome: string}[];
  addTipoEvento: (tipo: string) => Promise<void>;
  addInstituicaoExecutora: (instituicao: string) => Promise<void>;
  loading: boolean;
}

export const AppContext = React.createContext<AppContextType | null>(null);