import { ArrowRight, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      navigate(user.role === 'teacher' ? '/teacher' : '/student', { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    }
  };

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1fr_32rem]">
      <section className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-slate-950">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-extrabold">AptitudePro</span>
        </div>
        <div className="max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-300">Clean assessment operations</p>
          <h1 className="mt-4 text-5xl font-extrabold leading-tight">Run aptitude exams with one clear control surface.</h1>
          <p className="mt-5 text-lg text-slate-300">Create tests, monitor attempts, review results, and help students understand every answer.</p>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <form onSubmit={handleSubmit} className="panel w-full max-w-md p-8">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Welcome back</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">Sign in</h2>
            <p className="mt-2 text-sm text-slate-500">Use your student or teacher account.</p>
          </div>

          {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div>}

          <label className="label" htmlFor="email">Email</label>
          <input id="email" className="input mb-4" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

          <label className="label" htmlFor="password">Password</label>
          <input id="password" className="input mb-6" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />

          <button type="submit" className="btn-primary w-full py-2.5" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
            <ArrowRight className="h-4 w-4" />
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            New here? <Link to="/register" className="font-bold text-slate-950 hover:underline">Create an account</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
