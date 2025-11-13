
import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../AppContext';
import { TipoUsuario } from '../types';

const Header: React.FC = () => {
  const context = useContext(AppContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Garante que o dropdown esteja fechado ao trocar de usuário (login/logout)
    setDropdownOpen(false);
  }, [context?.profile]);
  
  const renderHeaderTitle = () => (
    <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="ml-3 text-2xl font-bold text-gray-800">Auxílios</span>
    </div>
  );

  if (!context || !context.profile) {
      return (
         <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {renderHeaderTitle()}
                </div>
            </div>
        </header>
      );
  }
  
  const { profile, originalUser, logout, openModal, switchRole } = context;

  const handleProfileClick = () => {
    if (profile) {
      openModal({ view: 'profile', user: profile });
      setDropdownOpen(false);
    }
  };
  
  const canSwitchToAdmin = originalUser?.tipo_usuario === TipoUsuario.ADMINISTRADOR;
  const canSwitchToAuthorizer = originalUser?.tipo_usuario === TipoUsuario.ADMINISTRADOR || originalUser?.tipo_usuario === TipoUsuario.AUTORIZADOR;
  
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {renderHeaderTitle()}

          {profile && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="hidden sm:inline text-gray-700 font-medium">
                  Olá, {profile.nome.split(' ')[0]}
                </span>
                 {profile.foto_url ? (
                    <img src={profile.foto_url} alt="Foto do perfil" className="w-8 h-8 rounded-full object-cover" />
                 ) : (
                    <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"></path></svg>
                 )}
              </button>
              {dropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-semibold text-gray-900">{profile.nome}</p>
                      <p className="text-sm text-gray-500">{profile.email}</p>
                      <p className="text-sm text-blue-600 font-medium mt-1 capitalize">{profile.tipo_usuario}</p>
                    </div>
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Meu Perfil
                    </button>
                    {(canSwitchToAuthorizer || canSwitchToAdmin) && (
                      <div className="border-t pt-1">
                          <p className="px-4 py-2 text-xs text-gray-500 uppercase">Mudar Visualização</p>
                          {profile.tipo_usuario !== TipoUsuario.SOLICITANTE && (
                               <button
                                onClick={() => { switchRole(TipoUsuario.SOLICITANTE); setDropdownOpen(false); }}
                                className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Como Solicitante
                              </button>
                          )}
                           {canSwitchToAuthorizer && profile.tipo_usuario !== TipoUsuario.AUTORIZADOR && (
                               <button
                                onClick={() => { switchRole(TipoUsuario.AUTORIZADOR); setDropdownOpen(false); }}
                                className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Como Autorizador
                              </button>
                          )}
                          {canSwitchToAdmin && profile.tipo_usuario !== TipoUsuario.ADMINISTRADOR && (
                              <button
                                onClick={() => { switchRole(TipoUsuario.ADMINISTRADOR); setDropdownOpen(false); }}
                                className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Como Administrador
                              </button>
                          )}
                      </div>
                    )}
                    <div className="border-t">
                      <button
                        onClick={logout}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 font-medium"
                      >
                        Sair
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;