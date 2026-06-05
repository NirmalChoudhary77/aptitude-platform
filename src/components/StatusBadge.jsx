const statusStyles = {
  draft: 'border-slate-200 bg-slate-100 text-slate-700',
  scheduled: 'border-amber-200 bg-amber-50 text-amber-800',
  live: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  completed: 'border-sky-200 bg-sky-50 text-sky-800',
};

export default function StatusBadge({ status }) {
  const value = status || 'draft';
  return (
    <span className={`status-pill ${statusStyles[value] || statusStyles.draft}`}>
      {value}
    </span>
  );
}
