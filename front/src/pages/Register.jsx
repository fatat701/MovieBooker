import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/auth/register', form);
      alert('Inscription réussie');
      navigate('/login');
    } catch {
      alert("Erreur d'inscription");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-20 p-4 border shadow space-y-3">
      <h2 className="text-xl font-bold">Inscription</h2>
      <input name="email" className="w-full border p-2" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input name="password" type="password" className="w-full border p-2" placeholder="Mot de passe" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button className="w-full bg-blue-600 text-white py-2">S’inscrire</button>
    </form>
  );
}
