import { useState } from 'react';
import { login as loginApi } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginApi(form.email, form.password);
      login(data.access_token);
      navigate('/movies');
    } catch {
      alert("Login invalide");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-20 p-4 border shadow space-y-3">
      <h2 className="text-xl font-bold">Connexion</h2>
      <input name="email" className="w-full border p-2" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input name="password" type="password" className="w-full border p-2" placeholder="Mot de passe" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button className="w-full bg-purple-600 text-white py-2">Se connecter</button>
      <p className="text-sm">
  Pas de compte ? <a href="/register" className="text-blue-500">Créer un compte</a>
</p>

    </form>
  );
}
