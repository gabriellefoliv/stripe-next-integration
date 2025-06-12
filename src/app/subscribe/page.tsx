'use client';
import { useState } from 'react';

const SubscribePage = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // redireciona para Stripe Checkout
      } else {
        throw new Error(data.error || 'Erro ao redirecionar para pagamento.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubscribe} className="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Assinar plano mensal</h2>

      <label className="block mb-2">Nome</label>
      <input
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />

      <label className="block mb-2">E-mail</label>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white py-2 px-4 rounded w-full"
      >
        {loading ? 'Processando...' : 'Assinar'}
      </button>
    </form>
  );
};

export default SubscribePage;
