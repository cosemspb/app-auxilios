
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface ForgotPasswordProps {
  onClose: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
    });

    if (error) {
      setError("Ocorreu um erro ao tentar enviar o e-mail. Por favor, tente novamente mais tarde.");
    } else {
      setSuccess('Se um usuário com este e-mail existir, um link para redefinição de senha será enviado.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Redefinir Senha</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {!success && (
                <p className="text-gray-600">
                    Digite seu e-mail e enviaremos um link para você voltar a acessar sua conta.
                </p>
            )}
          
          <div>
            <label htmlFor="email-forgot" className="sr-only">Email</label>
            <input
              id="email-forgot"
              name="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Endereço de e-mail"
              disabled={!!success}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm font-semibold">{success}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
              {success ? 'Fechar' : 'Cancelar'}
            </button>
            {!success && (
                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Enviando...' : 'Enviar Link'}
                </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
