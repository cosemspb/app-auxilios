
import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../AppContext';
import { TipoUsuario, StatusSolicitacao, Solicitacao, Usuario } from '../types';
import SolicitacaoForm from './SolicitacaoForm';
import SolicitacaoDetalhes from './SolicitacaoDetalhes';
import RelatorioFinanceiro from './RelatorioFinanceiro';

const StatusBadge: React.FC<{ status: StatusSolicitacao }> = ({ status }) => {
  const colorClasses = {
    [StatusSolicitacao.PENDENTE_DE_APROVACAO]: 'bg-yellow-100 text-yellow-800',
    [StatusSolicitacao.AGUARDANDO_CORRECAO]: 'bg-orange-100 text-orange-800',
    [StatusSolicitacao.APROVADA]: 'bg-green-100 text-green-800',
    [StatusSolicitacao.REPROVADA]: 'bg-red-100 text-red-800',
    [StatusSolicitacao.CANCELADA]: 'bg-gray-100 text-gray-800',
    [StatusSolicitacao.AGUARDANDO_PRESTACAO_DE_CONTAS]: 'bg-cyan-100 text-cyan-800',
    [StatusSolicitacao.PRESTACAO_EM_ANALISE]: 'bg-blue-100 text-blue-800',
    [StatusSolicitacao.PENDENCIA_NA_PRESTACAO_DE_CONTAS]: 'bg-amber-100 text-amber-800',
    [StatusSolicitacao.FINALIZADA]: 'bg-purple-100 text-purple-800',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const SolicitacoesTable: React.FC<{
  solicitacoes: Solicitacao[];
  onView: (solicitacao: Solicitacao) => void;
  onEdit: (solicitacao: Solicitacao) => void;
  isAuthorizerView?: boolean;
  isMyRequests?: boolean;
  onSort: (column: keyof Solicitacao | 'solicitante') => void;
  sortColumn: keyof Solicitacao | 'solicitante' | null;
  sortDirection: 'asc' | 'desc';
}> = ({ solicitacoes, onView, onEdit, isAuthorizerView, isMyRequests, onSort, sortColumn, sortDirection }) => {
  const context = useContext(AppContext);
  
  const SortableHeader: React.FC<{ column: keyof Solicitacao | 'solicitante', title: string }> = ({ column, title }) => (
     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <button onClick={() => onSort(column)} className="flex items-center gap-1.5 group">
            <span className="group-hover:text-gray-800">{title}</span>
            {sortColumn === column ? (
                <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
            ) : (
               <span className="text-gray-300 group-hover:text-gray-500">▲</span>
            )}
        </button>
     </th>
  );
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <SortableHeader column="protocolo" title="Protocolo" />
            {isAuthorizerView && <SortableHeader column="solicitante" title="Solicitante" />}
            <SortableHeader column="nome_evento" title="Evento" />
            <SortableHeader column="periodo_evento" title="Período" />
            <SortableHeader column="status" title="Status" />
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {solicitacoes.length > 0 ? solicitacoes.map((s) => {
            const solicitante = context?.findUserById(s.usuario_id);
            return (
              <tr key={s.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.protocolo}</td>
                {isAuthorizerView && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{solicitante?.nome || 'Desconhecido'}</td>}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.nome_evento}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.periodo_evento}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><StatusBadge status={s.status} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                   {isMyRequests && [StatusSolicitacao.AGUARDANDO_CORRECAO, StatusSolicitacao.PENDENCIA_NA_PRESTACAO_DE_CONTAS].includes(s.status) && (
                      <button onClick={() => onEdit(s)} className="text-orange-600 hover:text-orange-900 font-semibold">Corrigir</button>
                   )}
                   {isMyRequests && [StatusSolicitacao.APROVADA, StatusSolicitacao.AGUARDANDO_PRESTACAO_DE_CONTAS].includes(s.status) && (
                      <button onClick={() => onView(s)} className="text-green-600 hover:text-green-900 font-semibold">Prestar Contas</button>
                   )}
                  <button onClick={() => onView(s)} className="text-blue-600 hover:text-blue-900">
                    Detalhes
                  </button>
                </td>
              </tr>
            );
          }) : (
            <tr>
                <td colSpan={isAuthorizerView ? 6 : 5} className="text-center py-10 text-gray-500">
                    Nenhuma solicitação encontrada.
                </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const UserManagementTable: React.FC<{ 
    users: Usuario[],
    onSort: (column: keyof Usuario) => void,
    sortColumn: keyof Usuario | null,
    sortDirection: 'asc' | 'desc'
}> = ({ users, onSort, sortColumn, sortDirection }) => {
  const context = useContext(AppContext);
  const handleEditUser = (user: Usuario) => {
      context?.openModal({ view: 'profile', user });
  }

  const SortableHeader: React.FC<{ column: keyof Usuario, title: string }> = ({ column, title }) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
       <button onClick={() => onSort(column)} className="flex items-center gap-1.5 group">
           <span className="group-hover:text-gray-800">{title}</span>
           {sortColumn === column ? (
               <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
           ) : (
              <span className="text-gray-300 group-hover:text-gray-500">▲</span>
           )}
       </button>
    </th>
 );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <SortableHeader column="nome" title="Nome" />
            <SortableHeader column="email" title="Email" />
            <SortableHeader column="tipo_usuario" title="Tipo" />
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nome}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.tipo_usuario}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-900">
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => (
    <div className={`bg-white p-5 rounded-lg shadow-md border-l-4 ${color}`}>
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
);


const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<'list' | 'form'>('list');
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
  const [solicitacaoToEdit, setSolicitacaoToEdit] = useState<Solicitacao | null>(null);
  const [activeTab, setActiveTab] = useState<'my_requests' | 'manage_requests' | 'user_management' | 'financial_report'>('my_requests');
  const [statusFilter, setStatusFilter] = useState<StatusSolicitacao | 'todos'>('todos');
  
  const [sortColumn, setSortColumn] = useState<keyof Solicitacao | 'solicitante' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [userSortColumn, setUserSortColumn] = useState<keyof Usuario | null>(null);
  const [userSortDirection, setUserSortDirection] = useState<'asc' | 'desc'>('asc');


  const context = useContext(AppContext);
  const { profile, users, solicitacoes, findUserById } = context!;
  const isAuthorizerOrAdmin = profile?.tipo_usuario === TipoUsuario.AUTORIZADOR || profile?.tipo_usuario === TipoUsuario.ADMINISTRADOR;
  
  const handleSort = (column: keyof Solicitacao | 'solicitante') => {
      if (sortColumn === column) {
          setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
          setSortColumn(column);
          setSortDirection('asc');
      }
  };

  const handleUserSort = (column: keyof Usuario) => {
    if (userSortColumn === column) {
        setUserSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
        setUserSortColumn(column);
        setUserSortDirection('asc');
    }
  };
  
  const handleTabChange = (tab: 'my_requests' | 'manage_requests' | 'user_management' | 'financial_report') => {
      setActiveTab(tab);
      setStatusFilter('todos');
      setSortColumn(null);
      setUserSortColumn(null);
  };


  // Define which solicitations to analyze based on user role for stats
  const relevantSolicitacoes = useMemo(() => 
    isAuthorizerOrAdmin ? solicitacoes : solicitacoes.filter(s => s.usuario_id === profile!.id),
    [solicitacoes, profile, isAuthorizerOrAdmin]
  );
  
  const stats = useMemo(() => {
    const pendentesStatus = [StatusSolicitacao.PENDENTE_DE_APROVACAO, StatusSolicitacao.AGUARDANDO_CORRECAO];
    const aprovadasStatus = [
        StatusSolicitacao.APROVADA, 
        StatusSolicitacao.AGUARDANDO_PRESTACAO_DE_CONTAS, 
        StatusSolicitacao.PRESTACAO_EM_ANALISE, 
        StatusSolicitacao.PENDENCIA_NA_PRESTACAO_DE_CONTAS
    ];
    
    return {
        total: relevantSolicitacoes.length,
        pendentes: relevantSolicitacoes.filter(s => pendentesStatus.includes(s.status)).length,
        aprovadas: relevantSolicitacoes.filter(s => aprovadasStatus.includes(s.status)).length,
        finalizadas: relevantSolicitacoes.filter(s => s.status === StatusSolicitacao.FINALIZADA).length,
    }
  }, [relevantSolicitacoes]);


  const processedSolicitacoes = useMemo(() => {
      const sourceList = activeTab === 'my_requests' 
          ? solicitacoes.filter(s => s.usuario_id === profile!.id)
          : solicitacoes;

      const filtered = statusFilter === 'todos' ? sourceList : sourceList.filter(s => s.status === statusFilter);

      if ((activeTab === 'manage_requests' || activeTab === 'my_requests') && sortColumn) {
           return [...filtered].sort((a, b) => {
                let aValue: any;
                let bValue: any;

                if (sortColumn === 'solicitante') {
                    aValue = findUserById(a.usuario_id)?.nome || '';
                    bValue = findUserById(b.usuario_id)?.nome || '';
                } else if (sortColumn === 'periodo_evento') {
                     const parseDate = (periodo: string) => {
                         const datePart = periodo.split(' ')[0];
                         const [day, month, year] = datePart.split('/');
                         return new Date(`${year}-${month}-${day}`).getTime();
                     };
                     aValue = parseDate(a.periodo_evento);
                     bValue = parseDate(b.periodo_evento);
                } else {
                    aValue = a[sortColumn as keyof Solicitacao];
                    bValue = b[sortColumn as keyof Solicitacao];
                }
                
                if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
                return 0;
           });
      }

      return filtered;
    }, [solicitacoes, profile, statusFilter, activeTab, sortColumn, sortDirection, findUserById]
  );
  
  const sortedUsers = useMemo(() => {
    if (!userSortColumn) return users;

    return [...users].sort((a, b) => {
        const aValue = a[userSortColumn];
        const bValue = b[userSortColumn];

        if (aValue < bValue) return userSortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return userSortDirection === 'asc' ? 1 : -1;
        return 0;
    });
  }, [users, userSortColumn, userSortDirection]);

  const handleViewDetails = (solicitacao: Solicitacao) => {
    setSelectedSolicitacao(solicitacao);
  };
  
  const handleCloseDetails = () => {
    setSelectedSolicitacao(null);
  }

  const handleEdit = (solicitacao: Solicitacao) => {
    setSolicitacaoToEdit(solicitacao);
    setSelectedSolicitacao(null);
    setCurrentView('form');
  }

  const handleFormSubmit = () => {
    setCurrentView('list');
    setSolicitacaoToEdit(null);
  };
  
  const renderListContent = () => {
    const isMyRequestsTab = activeTab === 'my_requests';
    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                    {isMyRequestsTab ? "Minhas Solicitações" : "Gerenciar Solicitações"}
                </h2>
                <div className="flex items-center space-x-2">
                    <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">Filtrar por status:</label>
                    <select 
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="block w-80 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="todos">Todos</option>
                        {Object.values(StatusSolicitacao).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            </div>
            <SolicitacoesTable 
                solicitacoes={processedSolicitacoes} 
                onView={handleViewDetails} 
                onEdit={handleEdit} 
                isMyRequests={isMyRequestsTab}
                isAuthorizerView={!isMyRequestsTab}
                onSort={handleSort}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
            />
        </>
    )
  };

  if (currentView === 'form') {
    return <SolicitacaoForm 
        onCancel={handleFormSubmit} 
        onSubmit={handleFormSubmit} 
        solicitacaoToEdit={solicitacaoToEdit}
      />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Painel Informativo</h1>
        <button
          onClick={() => setCurrentView('form')}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition duration-300 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nova Solicitação
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total de Solicitações" value={stats.total} color="border-blue-500" />
        <StatCard title="Aprovadas" value={stats.aprovadas} color="border-green-500" />
        <StatCard title="Pendentes" value={stats.pendentes} color="border-yellow-500" />
        <StatCard title="Finalizadas" value={stats.finalizadas} color="border-purple-500" />
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
            onClick={() => handleTabChange('my_requests')}
            className={`${activeTab === 'my_requests' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
            Minhas Solicitações
            </button>
            {isAuthorizerOrAdmin && (
              <>
                <button
                onClick={() => handleTabChange('manage_requests')}
                className={`${activeTab === 'manage_requests' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                Gerenciar Solicitações
                </button>
                 <button
                onClick={() => handleTabChange('financial_report')}
                className={`${activeTab === 'financial_report' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                Relatório Financeiro
                </button>
              </>
            )}
            {profile?.tipo_usuario === TipoUsuario.ADMINISTRADOR && (
            <button
                onClick={() => handleTabChange('user_management')}
                className={`${activeTab === 'user_management' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
                Gerenciar Usuários
            </button>
            )}
        </nav>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        {activeTab === 'my_requests' && renderListContent()}
        {activeTab === 'manage_requests' && isAuthorizerOrAdmin && renderListContent()}
        {activeTab === 'financial_report' && isAuthorizerOrAdmin && <RelatorioFinanceiro />}

        {profile?.tipo_usuario === TipoUsuario.ADMINISTRADOR && activeTab === 'user_management' && (
             <>
                <h2 className="text-xl font-semibold mb-4">Gerenciamento de Usuários</h2>
                <UserManagementTable 
                    users={sortedUsers} 
                    onSort={handleUserSort}
                    sortColumn={userSortColumn}
                    sortDirection={userSortDirection}
                />
             </>
        )}
      </div>

      {selectedSolicitacao && (
        <SolicitacaoDetalhes
          solicitacao={selectedSolicitacao}
          onClose={handleCloseDetails}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default Dashboard;
