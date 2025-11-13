import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';

interface RegisterProps {
    onShowLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onShowLogin }) => {
    const context = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [regNome, setRegNome] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regCpf, setRegCpf] = useState('');
    const [regCategoria, setRegCategoria] = useState('');
    const [regDadosBancarios, setRegDadosBancarios] = useState('');
    const [regNecessidades, setRegNecessidades] = useState('');
    const [secretCode, setSecretCode] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: 'bg-gray-200', width: 'w-0' });
    const [fotoUrl, setFotoUrl] = useState('');

    const { diariaValores = [] } = context || {};

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };


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
            case 2:
                label = 'Fraca';
                color = 'bg-red-500';
                width = 'w-2/5';
                break;
            case 3:
                label = 'Razoável';
                color = 'bg-yellow-500';
                width = 'w-3/5';
                break;
            case 4:
                label = 'Forte';
                color = 'bg-green-500';
                width = 'w-4/5';
                break;
            case 5:
                label = 'Muito Forte';
                color = 'bg-green-700';
                width = 'w-full';
                break;
        }
        setPasswordStrength({ score, label, color, width });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setRegPassword(newPassword);
        checkPasswordStrength(newPassword);
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        if (!regNome || !regEmail || !regCpf || !regCategoria || !regDadosBancarios) {
            setError('Por favor, preencha todos os campos obrigatórios.');
            setLoading(false);
            return;
        }

        if (!regPassword || regPassword !== regConfirmPassword) {
            setError('As senhas não conferem ou estão em branco.');
            setLoading(false);
            return;
        }
        if (passwordStrength.score < 3) {
            setError('A senha é muito fraca. Use uma combinação de letras maiúsculas, minúsculas, números e símbolos.');
            setLoading(false);
            return;
        }

        const userData = {
            nome: regNome,
            email: regEmail,
            password: regPassword,
            cpf: regCpf,
            categoria: regCategoria,
            dados_bancarios: regDadosBancarios,
            necessidades_especiais: regNecessidades || 'Nenhuma',
            foto_url: fotoUrl,
        };

        const registrationError = await context?.register(userData, secretCode);

        if (registrationError) {
            setError(registrationError);
        } else {
            setError('');
            // on successful registration, Supabase will send a confirmation email
            // and the onAuthStateChange listener will handle the session.
            // We can optionally show a success message here before redirecting or letting the listener take over.
             alert('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar sua conta.');
             onShowLogin();
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Criar Nova Conta
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                     <div className="flex flex-col items-center space-y-2">
                        <img 
                            src={fotoUrl || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGNsYXNzPSJ3LTEyIGgtMTIgcm91bmRlZC1mdWxsIHRleHQtZ3JheS0zMDAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0iY3VycmVudENvbG9yIj4KICAgIDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTE4IDEwYTggOCAwIDExLTE2IDAgOCggOCAwIDAxMTYgMHptLTYtM2EyIDIgMCAxMS00IDAgMiAyIDAgMDE0IDB6bS0yIDRhNSA1IDAgMDAtNC41NDYgMi45MTZBNS45ODYgNS45ODYgMCAwMDEwIDE2YTUuOTg2IDUuOTg2IDAgMDA0LjU0Ni0yLjA4NEE1IDUgMCAwMDEwIDExeiIgY2xpcC1ydWxlPSJldmVub2RkIj48L3BhdGg+Cjwvc3ZnPg=='} 
                            alt="Foto do Perfil" 
                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 bg-gray-100" 
                        />
                        <label htmlFor="foto-upload" className="cursor-pointer bg-white px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                            {fotoUrl ? 'Alterar Foto' : 'Adicionar Foto'}
                        </label>
                        <input id="foto-upload" name="foto-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                    </div>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <input type="text" placeholder="Nome Completo" value={regNome} onChange={e => setRegNome(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" />
                        <input type="email" placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" />
                        <input type="text" placeholder="CPF" value={regCpf} onChange={e => setRegCpf(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" />
                        
                        <input
                            type="password"
                            placeholder="Senha"
                            value={regPassword}
                            onChange={handlePasswordChange}
                            required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        />
                        {regPassword && (
                            <div className="p-2 bg-white relative -top-px z-20 border-x border-gray-300">
                                <div className="h-2 w-full bg-gray-200 rounded">
                                    <div className={`h-full rounded ${passwordStrength.color} ${passwordStrength.width} transition-all duration-300`}></div>
                                </div>
                                <p className={`text-xs mt-1 text-right font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>{passwordStrength.label}</p>
                            </div>
                        )}
                        <input
                            type="password"
                            placeholder="Confirmar Senha"
                            value={regConfirmPassword}
                            onChange={e => setRegConfirmPassword(e.target.value)}
                            required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        />

                        <select
                            name="categoria"
                            value={regCategoria}
                            onChange={(e) => setRegCategoria(e.target.value)}
                            required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        >
                            <option value="" disabled>Selecione um Cargo/Categoria</option>
                            {diariaValores.map(cargo => (
                                <option key={cargo.id} value={cargo.cargo}>{cargo.cargo}</option>
                            ))}
                        </select>

                        <input type="text" placeholder="Dados Bancários" value={regDadosBancarios} onChange={e => setRegDadosBancarios(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" />
                        <input type="text" placeholder="Necessidades Especiais (Opcional)" value={regNecessidades} onChange={e => setRegNecessidades(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" />
                        <input type="password" placeholder="Código de Autorizador (Opcional)" value={secretCode} onChange={e => setSecretCode(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center px-2 py-1">{error}</p>}
                    <div>
                        <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                            {loading ? 'Registrando...' : 'Registrar'}
                        </button>
                    </div>
                    <p className="mt-2 text-center text-sm text-gray-600">
                         <button type="button" onClick={onShowLogin} className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none">
                            Já tem uma conta? Faça login
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;