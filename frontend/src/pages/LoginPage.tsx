import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/conferences';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiClient.post('/api/auth/login', { email, password });
      login(res.data.token, { email: res.data.email, name: res.data.name, role: res.data.role });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-2xl font-bold text-brand-primary text-center mb-6">Sign In</h1>
      <form onSubmit={handleSubmit} className="bg-brand-surface rounded-2xl border border-brand-border p-6 space-y-4">
        {error && (
          <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-2">{error}</p>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-brand-primary mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-brand-border text-brand-primary placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-accent"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-brand-primary mb-1">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-brand-border text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-accent"
            placeholder="••••••••"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-brand-accent text-white font-semibold hover:bg-brand-accent/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
        <p className="text-center text-sm text-brand-muted">
          No account?{' '}
          <Link to="/register" className="text-brand-accent hover:underline">Register</Link>
        </p>
      </form>
    </div>
  );
}
