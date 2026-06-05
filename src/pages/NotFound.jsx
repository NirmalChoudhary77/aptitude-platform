import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="panel max-w-md text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-slate-500">404</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-950">Page not found</h1>
        <p className="mt-3 text-sm text-slate-500">The page you opened does not exist in this workspace.</p>
        <Link className="btn-primary mt-6" to="/">Go home</Link>
      </div>
    </main>
  );
}
