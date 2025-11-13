
import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';

interface LoginProps {
    onShowRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onShowRegister }) => {
  const context = useContext(AppContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const loginError = await context?.login(email, password);
    if (loginError) {
      setError(loginError);
    }
    setLoading(false);
  };
  
  const handleForgotPassword = () => {
      context?.openModal({ view: 'forgotPassword' });
  };


  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Acesse sua conta
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email</label>
              <input id="email-address" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Email" />
            </div>
            <div>
              <label htmlFor="password-login" className="sr-only">Password</label>
              <input id="password-login" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Senha" />
            </div>
          </div>
           <div className="flex items-center justify-end">
                <div className="text-sm">
                    <button type="button" onClick={handleForgotPassword} className="font-medium text-blue-600 hover:text-blue-500">
                        Esqueci a minha senha
                    </button>
                </div>
            </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
        <p className="mt-2 text-center text-sm text-gray-600">
          Não tem uma conta?{' '}
          <button onClick={onShowRegister} className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none">
            Registre-se
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
