import { ArrowRight, Eye, EyeOff, GraduationCap, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authHero from '../../assets/auth-hero.png';
import useAuthStore from '../../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="grid min-h-screen bg-[radial-gradient(circle_at_top_left,#ccfbf1,transparent_32%),linear-gradient(135deg,#f8fafc_0%,#eef7f5_52%,#f8fafc_100%)] lg:grid-cols-[minmax(0,1fr)_32rem]">
      <section className="relative hidden overflow-hidden p-8 text-slate-950 lg:flex lg:flex-col lg:justify-between xl:p-12">
        <div className="absolute inset-x-12 top-10 h-64 rounded-full bg-teal-200/25 blur-3xl" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-white shadow-lg shadow-slate-950/10">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-extrabold">Aptitude Platform</span>
        </div>
        <div className="relative z-10 my-8">
          <div className="relative mx-auto max-w-4xl">
            <img
              src={authHero}
              alt="Assessment dashboard workspace"
              className="aspect-[16/9] w-full rounded-lg border border-white/80 object-cover shadow-2xl shadow-slate-900/15"
            />
            <div className="absolute bottom-6 right-6 rounded-lg border border-white/80 bg-white/90 p-4 shadow-xl shadow-slate-900/10 backdrop-blur animate-[float_7s_ease-in-out_1s_infinite]">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Avg score</p>
              <div className="mt-2 flex items-end gap-1">
                {[42, 58, 35, 74, 68].map((height) => (
                  <span key={height} className="w-3 rounded-t bg-teal-600" style={{ height }} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">Clean assessment operations</p>
          <h1 className="mt-4 text-5xl font-extrabold leading-tight text-slate-950">Run aptitude exams with one clear control surface.</h1>
          <p className="mt-5 text-lg text-slate-600">Create tests, monitor attempts, review results, and help students understand every answer.</p>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 lg:bg-white/60 lg:backdrop-blur">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-white/70 bg-white/90 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-white">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl font-extrabold text-slate-950">Aptitude Platform</span>
            </div>
          </div>
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Welcome back</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">Sign in</h2>
            <p className="mt-2 text-sm text-slate-500">Use your student or teacher account.</p>
          </div>

          {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div>}

          <label className="label" htmlFor="email">Email</label>
          <input id="email" className="input mb-4" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

          <label className="label" htmlFor="password">Password</label>
          <div className="relative mb-6">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              className="input pr-12 pl-9"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              onClick={() => setShowPassword((value) => !value)}
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button type="submit" className="btn-primary w-full py-2.5 shadow-lg shadow-slate-950/10" disabled={isLoading}>
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
