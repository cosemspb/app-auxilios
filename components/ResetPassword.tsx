
import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext.ts';

interface ResetPasswordProps {
  onClose: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onClose }) => {
  const context = useContext(AppContext);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: 'bg-gray-200', width: 'w-0' });

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length === 0) {
      setPasswordStrength({ score: 0, label: '', color: 'bg-gray-200', width: 'w-0' });
      return;
    }
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    let label = 'Muito Fraca';
    let color = 'bg-red-500';
    let width = 'w-1/5';
    
    switch (score) {
      case 1:
      case 2: label = 'Fraca'; color = 'bg-red-500'; width = 'w-2/5'; break;
      case 3: label = 'Razoável'; color = 'bg-yellow-500'; width = 'w-3/5'; break;
      case 4: label = 'Forte'; color = 'bg-green-500'; width = 'w-4/5'; break;
      case 5: label = 'Muito Forte'; color = 'bg-green-700'; width = 'w-full'; break;
    }
    setPasswordStrength({ score, label, color, width });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }
    if (passwordStrength.score < 3) {
      setError('A senha é muito fraca.');
      return;
    }
    setLoading(true);
    setError('');
    const updateError = await context?.updatePassword(password);
    if(updateError){
        setError(updateError);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Crie uma Nova Senha</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="new-password">Nova Senha</label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
               {password && (
                    <div className="mt-2">
                        <div className="h-2 w-full bg-gray-200 rounded">
                            <div className={`h-full rounded ${passwordStrength.color} ${passwordStrength.width} transition-all duration-300`}></div>
                        </div>
                        <p className={`text-xs mt-1 text-right font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>{passwordStrength.label}</p>
                    </div>
                )}
            </div>
            <div>
              <label htmlFor="confirm-password">Confirmar Nova Senha</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Salvando...' : 'Salvar Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;