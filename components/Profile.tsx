
import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Usuario, TipoUsuario } from '../types';

interface ProfileProps {
  user: Usuario;
  onClose: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onClose }) => {
  const context = useContext(AppContext);
  const { profile: currentUser, updateUser } = context!;

  const [formData, setFormData] = useState<Usuario>(user);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canEditRole = currentUser?.tipo_usuario === TipoUsuario.ADMINISTRADOR && currentUser.id !== user.id;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onloadend = () => {
              setFormData(prev => ({ ...prev, foto_url: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Email is not editable and not in the 'profiles' table, so we don't validate it here.
    if (!formData.nome || !formData.cpf || !formData.categoria || !formData.dados_bancarios) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    setError('');
    await updateUser(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Perfil do Usuário</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex flex-col items-center space-y-2 mb-4">
                <img 
                    src={formData.foto_url || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGNsYXNzPSJ3LTEyIGgtMTIgcm91bmRlZC1mdWxsIHRleHQtZ3JheS0zMDAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0iY3VycmVudENvbG9yIj4KICAgIDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTE4IDEwYTggOCAwIDExLTE2IDAgOCggOCAwIDAxMTYgMHptLTYtM2EyIDIgMCAxMS00IDAgMiAyIDAgMDE0IDB6bS0yIDRhNSA1IDAgMDAtNC41NDYgMi45MTZBNS45ODYgNS45ODYgMCAwMDEwIDE2YTUuOTg2IDUuOTg2IDAgMDA0LjU0Ni0yLjA4NEE1IDUgMCAwMDEwIDExeiIgY2xpcC1ydWxlPSJldmVub2RkIj48L3BhdGg+Cjwvc3ZnPg=='} 
                    alt="Foto do Perfil" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 bg-gray-100"
                />
                <label htmlFor="profile-foto-upload" className="cursor-pointer bg-white px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Alterar Foto
                </label>
                <input id="profile-foto-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" value={formData.email || ''} disabled className="mt-1 p-2 w-full border rounded-md bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CPF</label>
            <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" required />
          </div>
           <div>
                <label className="block text-sm font-medium text-gray-700">Cargo/Categoria</label>
                <select name="categoria" value={formData.categoria} onChange={handleChange} required className="mt-1 p-2 w-full border rounded-md bg-white">
                    <option value="">Selecione um Cargo/Categoria</option>
                    {context?.diariaValores.map(cargo => (
                        <option key={cargo.id} value={cargo.cargo}>{cargo.cargo}</option>
                    ))}
                </select>
            </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Dados Bancários</label>
            <input type="text" name="dados_bancarios" value={formData.dados_bancarios} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Necessidades Especiais</label>
            <input type="text" name="necessidades_especiais" value={formData.necessidades_especiais} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
          </div>

          {canEditRole && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Usuário</label>
              <select name="tipo_usuario" value={formData.tipo_usuario} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md bg-white">
                <option value={TipoUsuario.SOLICITANTE}>Solicitante</option>
                <option value={TipoUsuario.AUTORIZADOR}>Autorizador</option>
                 <option value={TipoUsuario.ADMINISTRADOR}>Administrador</option>
              </select>
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
