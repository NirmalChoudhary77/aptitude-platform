import { ArrowRight, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [error, setError] = useState('');

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const user = await register(form.full_name, form.email, form.password, form.role);
      navigate(user.role === 'teacher' ? '/teacher' : '/student', { replace: true });
    } catch (registerError) {
      setError(registerError.message);
    }
  };

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1fr_34rem]">
      <section className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-slate-950">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-extrabold">Aptitude Platform</span>
        </div>
        <div className="max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-300">MERN assessment platform</p>
          <h1 className="mt-4 text-5xl font-extrabold leading-tight">Start with the right workspace.</h1>
          <p className="mt-5 text-lg text-slate-300">Teachers build and monitor exams. Students attempt, review, and improve.</p>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <form onSubmit={handleSubmit} className="panel w-full max-w-md p-8">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Create account</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">Join Aptitude Platform</h2>
          </div>

          {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div>}

          <label className="label" htmlFor="full_name">Full name</label>
          <input id="full_name" className="input mb-4" value={form.full_name} onChange={(event) => update('full_name', event.target.value)} required />

          <label className="label" htmlFor="email">Email</label>
          <input id="email" className="input mb-4" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required />

          <label className="label" htmlFor="password">Password</label>
          <input id="password" className="input mb-4" type="password" value={form.password} onChange={(event) => update('password', event.target.value)} required minLength={6} />

          <label className="label" htmlFor="role">Workspace</label>
          <select id="role" className="input mb-6" value={form.role} onChange={(event) => update('role', event.target.value)}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>

          <button type="submit" className="btn-primary w-full py-2.5" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
            <ArrowRight className="h-4 w-4" />
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already registered? <Link to="/login" className="font-bold text-slate-950 hover:underline">Sign in</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
