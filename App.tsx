
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { Usuario, Solicitacao, TipoUsuario, StatusSolicitacao, DeslocamentoValor, DiariaValor } from './types';
import { AppContext, AppContextType, ModalState } from './AppContext';

import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Profile from './components/Profile';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  
  // profile of the currently displayed user (respects role switching)
  const [profile, setProfile] = useState<Usuario | null>(null);
  // profile of the actual logged-in user (from DB)
  const [originalUser, setOriginalUser] = useState<Usuario | null>(null);
  
  const [users, setUsers] = useState<Usuario[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [deslocamentoValores, setDeslocamentoValores] = useState<DeslocamentoValor[]>([]);
  const [diariaValores, setDiariaValores] = useState<DiariaValor[]>([]);
  const [tiposDeEvento, setTiposDeEvento] = useState<{id: number, nome: string}[]>([]);
  const [instituicoesExecutoras, setInstituicoesExecutoras] = useState<{id: number, nome: string}[]>([]);

  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [modal, setModal] = useState<ModalState>({ view: 'none' });

  const fetchRoleSpecificData = useCallback(async (userProfile: Usuario) => {
    if (userProfile.tipo_usuario === TipoUsuario.ADMINISTRADOR) {
      // Use RPC to call the secure function that includes emails
      const { data: allUsers, error: rpcError } = await supabase.rpc('get_all_users_with_email');
      if (rpcError) {
        console.error("Error fetching users via RPC:", rpcError);
        alert("Erro ao carregar la lista de usuários. Verifique as permissões da função no Supabase.");
        setUsers([]);
      } else if (allUsers) {
        setUsers(allUsers as Usuario[]);
      }

      const { data: allSolicitacoes } = await supabase.from('solicitacoes').select('*');
      if (allSolicitacoes) setSolicitacoes(allSolicitacoes as Solicitacao[]);

    } else if (userProfile.tipo_usuario === TipoUsuario.AUTORIZADOR) {
        // Authorizers only need profiles to see names, no emails needed for editing others
      const { data: allUsers } = await supabase.from('profiles').select('*');
      if(allUsers) setUsers(allUsers as Usuario[]);

      const { data: allSolicitacoes } = await supabase.from('solicitacoes').select('*');
      if (allSolicitacoes) setSolicitacoes(allSolicitacoes as Solicitacao[]);

    } else { // Solicitante
      const { data: mySolicitacoes } = await supabase.from('solicitacoes').select('*').eq('usuario_id', userProfile.id);
      if (mySolicitacoes) setSolicitacoes(mySolicitacoes as Solicitacao[]);
      setUsers([]); // Solicitante does not need the full user list
    }
  }, []);


  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Fetch all non-user-specific data.
        const [deslocamentoRes, diariaRes, tiposRes, instituicoesRes] = await Promise.all([
            supabase.from('deslocamento_valores').select('*'),
            supabase.from('diaria_valores').select('*'),
            supabase.from('tipos_evento').select('*'),
            supabase.from('instituicoes_executoras').select('*'),
        ]);

        if (deslocamentoRes.error || diariaRes.error || tiposRes.error || instituicoesRes.error) {
            console.error({
                deslocamento: deslocamentoRes.error,
                diaria: diariaRes.error,
                tipos: tiposRes.error,
                instituicoes: instituicoesRes.error
            });
            throw new Error("Falha ao buscar dados essenciais para a aplicação.");
        }

        setDeslocamentoValores(deslocamentoRes.data || []);
        setDiariaValores(diariaRes.data || []);
        setTiposDeEvento(tiposRes.data || []);
        setInstituicoesExecutoras(instituicoesRes.data || []);

        // 2. Check for an active session.
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        setSession(session);

        // 3. If a session exists, fetch profile and role-specific data.
        if (session?.user) {
            const { data: profileData, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (error && error.code !== 'PGRST116') { // Ignore 'exact one row not found' error
                throw error;
            }

            if (profileData) {
                const userProfile: Usuario = { ...profileData, email: session.user.email! };
                setProfile(userProfile);
                setOriginalUser(userProfile);
                await fetchRoleSpecificData(userProfile);
            }
        }
      } catch (error) {
        console.error("Erro durante a inicialização do aplicativo:", error);
        alert("Não foi possível carregar os dados da aplicação. Verifique sua conexão e tente recarregar a página.");
      } finally {
        // 4. Initial load is always complete.
        setLoading(false);
      }
    };

    initializeApp();

    // 5. Set up a listener for auth state changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      
      if (_event === 'SIGNED_OUT') {
        setProfile(null);
        setOriginalUser(null);
        setUsers([]);
        setSolicitacoes([]);
        return;
      }

      if (session?.user && (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED' || _event === 'USER_UPDATED')) {
        setLoading(true);
        try {
            const { data: profileData, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (error && error.code !== 'PGRST116') throw error;
            
            if (profileData) {
              const userProfile: Usuario = { ...profileData, email: session.user.email! };
              setProfile(prev => prev?.id === userProfile.id ? { ...userProfile, tipo_usuario: prev.tipo_usuario } : userProfile);
              setOriginalUser(userProfile);
              await fetchRoleSpecificData(userProfile);
            }
        } catch (error) {
            console.error("Erro ao atualizar sessão do usuário:", error);
            alert("Ocorreu um erro ao carregar os dados da sua sessão.");
        } finally {
            setLoading(false);
        }
      }
      
      if (_event === 'PASSWORD_RECOVERY') {
        setModal({ view: 'resetPassword' });
      }
    });
    
    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchRoleSpecificData]);
  
  const login = async (email: string, password?: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: password! });
    return error ? error.message : null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setOriginalUser(null);
    setAuthView('login');
    setModal({ view: 'none' });
  };
  
  const register = async (userData: any, secretCode?: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          nome: userData.nome,
          cpf: userData.cpf,
          categoria: userData.categoria,
          dados_bancarios: userData.dados_bancarios,
          necessidades_especiais: userData.necessidades_especiais,
          foto_url: userData.foto_url,
          tipo_usuario: secretCode === 'Agor@Va1%' ? TipoUsuario.ADMINISTRADOR : TipoUsuario.SOLICITANTE,
        }
      }
    });

    if (error) {
        if (error.message.includes('User already registered')) {
            return 'Este e-mail já está cadastrado. Tente fazer login ou recuperar sua senha.';
        }
        return `Erro no cadastro: ${error.message}`;
    }
    
    return null;
  };

  const updateUser = async (updatedUser: Usuario) => {
    // We don't want to try and update the email, which isn't in the 'profiles' table
    const { email, ...profileData } = updatedUser;

    const { data, error } = await supabase.from('profiles').update(profileData).eq('id', updatedUser.id).select().single();
    if(error) {
        alert("Erro ao atualizar perfil: " + error.message);
    } else if (data) {
        // Re-add the email here for local state consistency
        const updatedUserWithEmail = { ...data, email };
        
        // If the logged-in user is updating their own profile
        if(originalUser?.id === updatedUser.id){
            setOriginalUser(updatedUserWithEmail);
            setProfile(prev => ({
                ...updatedUserWithEmail,
                tipo_usuario: prev!.tipo_usuario // Keep current view role
            }));
        }
         // Update the general user list if an admin is editing
        if (originalUser?.tipo_usuario === TipoUsuario.ADMINISTRADOR) {
            setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUserWithEmail : u));
        }
        alert("Perfil atualizado com sucesso!");
        setModal({ view: 'none' });
    }
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if(error) return error.message;

    setModal({ view: 'none' });
    alert("Senha redefinida com sucesso! Você já pode fazer login com a nova senha.");
    return null;
  };

  const switchRole = useCallback((newRole: TipoUsuario) => {
    if (!originalUser) return;

    const canSwitch = 
      originalUser.tipo_usuario === TipoUsuario.ADMINISTRADOR ||
      (originalUser.tipo_usuario === TipoUsuario.AUTORIZADOR && newRole !== TipoUsuario.ADMINISTRADOR);

    if (canSwitch) {
      setLoading(true);
      const newProfile = { ...originalUser, tipo_usuario: newRole };
      setProfile(newProfile);
      fetchRoleSpecificData(newProfile).finally(() => setLoading(false));
    }
  }, [originalUser, fetchRoleSpecificData]);


  const addSolicitacao = async (solicitacaoData: Omit<Solicitacao, 'id' | 'protocolo' | 'status'>) => {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const hashStr = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newSolicitacao = {
      ...solicitacaoData,
      protocolo: `${timestamp.substring(0, 14)}-${hashStr}`,
      status: StatusSolicitacao.PENDENTE_DE_APROVACAO,
    };
    
    const { data, error } = await supabase.from('solicitacoes').insert([newSolicitacao]).select();
    
    if(error) {
        alert("Erro ao criar solicitação: " + error.message);
    } else if(data) {
        setSolicitacoes(prev => [data[0] as Solicitacao, ...prev].sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()));
    }
  };

  const updateSolicitacao = async (updatedSolicitacao: Solicitacao) => {
     const { data, error } = await supabase.from('solicitacoes').update(updatedSolicitacao).eq('id', updatedSolicitacao.id).select();
     if(error) {
         alert("Erro ao atualizar solicitação: " + error.message);
     } else if(data) {
         setSolicitacoes(prev => prev.map(s => s.id === updatedSolicitacao.id ? (data[0] as Solicitacao) : s));
     }
  };

  const findUserById = useCallback((id: string): Usuario | undefined => {
    if (originalUser?.id === id) return originalUser;
    // For admins, the `users` list is comprehensive.
    if (originalUser?.tipo_usuario === TipoUsuario.ADMINISTRADOR) {
      return users.find(u => u.id === id);
    }
    // For other roles, `users` might be incomplete or empty.
    // Check the current profile, then the list.
    if (profile?.id === id) return profile;
    return users.find(u => u.id === id);
  }, [users, profile, originalUser]);
  
  const addTipoEvento = async (tipo: string) => {
    const exists = tiposDeEvento.find(t => t.nome.toLowerCase() === tipo.toLowerCase());
    if(!exists){
        const { data, error } = await supabase.from('tipos_evento').insert({ nome: tipo }).select();
        if(data) setTiposDeEvento(prev => [...prev, data[0]]);
    }
  };

  const addInstituicaoExecutora = async (instituicao: string) => {
    const exists = instituicoesExecutoras.find(i => i.nome.toLowerCase() === instituicao.toLowerCase());
    if(!exists){
        const { data, error } = await supabase.from('instituicoes_executoras').insert({ nome: instituicao }).select();
        if(data) setInstituicoesExecutoras(prev => [...prev, data[0]]);
    }
  };

  const contextValue: AppContextType = useMemo(() => ({
    session,
    profile,
    originalUser,
    users,
    logout,
    login,
    register,
    updateUser,
    updatePassword,
    solicitacoes,
    addSolicitacao,
    updateSolicitacao,
    deslocamentoValores,
    diariaValores,
    findUserById,
    openModal: setModal,
    switchRole,
    tiposDeEvento,
    instituicoesExecutoras,
    addTipoEvento,
    addInstituicaoExecutora,
    loading,
  }), [session, profile, originalUser, users, solicitacoes, deslocamentoValores, diariaValores, tiposDeEvento, instituicoesExecutoras, loading, findUserById, switchRole, logout, login, register, updateUser, updatePassword, addSolicitacao, updateSolicitacao, addTipoEvento, addInstituicaoExecutora]);

  const renderAuth = () => {
    if (authView === 'register') {
      return <Register onShowLogin={() => setAuthView('login')} />;
    }
    return <Login onShowRegister={() => setAuthView('register')} />;
  };

  const renderModal = () => {
      switch(modal.view){
          case 'profile':
              // Ensure the user object passed to the modal is the most complete version available
              const userForModal = users.find(u => u.id === modal.user.id) || modal.user;
              return <Profile user={userForModal} onClose={() => setModal({view: 'none'})} />;
          case 'forgotPassword':
              return <ForgotPassword onClose={() => setModal({view: 'none'})} />;
          case 'resetPassword':
               return <ResetPassword onClose={() => setModal({view: 'none'})} />;
          default:
              return null;
      }
  }
  
  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          {profile ? <Dashboard /> : renderAuth()}
        </main>
        {renderModal()}
      </div>
    </AppContext.Provider>
  );
};

export default App;
