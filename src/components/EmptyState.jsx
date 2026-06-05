export default function EmptyState({ title, description, action }) {
  return (
    <div className="surface flex flex-col items-center justify-center px-6 py-12 text-center">
      <h3 className="text-lg font-extrabold text-slate-950">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
