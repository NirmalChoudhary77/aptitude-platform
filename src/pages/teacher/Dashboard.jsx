import { BarChart3, CalendarClock, FilePlus2, Play, Square, Trash2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api/client';
import { examQuestionCount, formatDateTime } from '../../utils/formatters';

function ScheduleModal({ exam, onClose, onSave }) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const save = () => {
    if (!startTime || !endTime) return;
    onSave(exam._id, startTime, endTime);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4">
      <div className="panel w-full max-w-md p-6">
        <h2 className="text-xl font-extrabold text-slate-950">Schedule exam</h2>
        <p className="mt-1 text-sm text-slate-500">{exam.title}</p>
        <div className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="start_time">Start time</label>
            <input id="start_time" className="input" type="datetime-local" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="end_time">End time</label>
            <input id="end_time" className="input" type="datetime-local" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary" onClick={save} disabled={!startTime || !endTime}>Save schedule</button>
        </div>
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/exams/teacher');
      setExams(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const stats = useMemo(() => ({
    total: exams.length,
    live: exams.filter((exam) => exam.effective_status === 'live').length,
    scheduled: exams.filter((exam) => exam.effective_status === 'scheduled').length,
    completed: exams.filter((exam) => exam.effective_status === 'completed').length,
  }), [exams]);

  const updateStatus = async (examId, payload) => {
    await api.put(`/exams/teacher/${examId}/status`, payload);
    await fetchExams();
  };

  const deleteExam = async (examId) => {
    if (!window.confirm('Delete this exam and its submissions?')) return;
    await api.delete(`/exams/teacher/${examId}`);
    setExams((current) => current.filter((exam) => exam._id !== examId));
  };

  const saveSchedule = async (examId, start_time, end_time) => {
    await updateStatus(examId, { status: 'scheduled', start_time, end_time });
    setSelectedExam(null);
  };

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Teacher dashboard"
        title="Exam operations"
        description="Create, schedule, monitor, and close aptitude assessments from one workspace."
        actions={(
          <Link to="/teacher/exams/create" className="btn-primary">
            <FilePlus2 className="h-4 w-4" />
            Create exam
          </Link>
        )}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <div className="metric"><p className="text-sm font-semibold text-slate-500">Total exams</p><p className="mt-2 text-3xl font-extrabold">{stats.total}</p></div>
        <div className="metric"><p className="text-sm font-semibold text-slate-500">Live</p><p className="mt-2 text-3xl font-extrabold text-emerald-700">{stats.live}</p></div>
        <div className="metric"><p className="text-sm font-semibold text-slate-500">Scheduled</p><p className="mt-2 text-3xl font-extrabold text-amber-700">{stats.scheduled}</p></div>
        <div className="metric"><p className="text-sm font-semibold text-slate-500">Completed</p><p className="mt-2 text-3xl font-extrabold text-sky-700">{stats.completed}</p></div>
      </section>

      {loading ? (
        <div className="panel text-sm font-semibold text-slate-500">Loading exams...</div>
      ) : exams.length === 0 ? (
        <EmptyState
          title="No exams yet"
          description="Start by creating an exam from bank questions, custom questions, or Gemini-assisted generation."
          action={<Link to="/teacher/exams/create" className="btn-primary">Create first exam</Link>}
        />
      ) : (
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">Exam</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Questions</th>
                  <th className="px-4 py-3">Schedule</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {exams.map((exam) => {
                  const status = exam.effective_status || exam.status;
                  return (
                    <tr key={exam._id} className="align-top">
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-950">{exam.title}</p>
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">{exam.description || 'No description'}</p>
                      </td>
                      <td className="px-4 py-4"><StatusBadge status={status} /></td>
                      <td className="px-4 py-4 font-semibold text-slate-700">{examQuestionCount(exam)}</td>
                      <td className="px-4 py-4 text-xs text-slate-500">
                        <p>Start: {formatDateTime(exam.start_time)}</p>
                        <p>End: {formatDateTime(exam.end_time)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          {(status === 'draft' || status === 'scheduled') && (
                            <>
                              <button type="button" className="btn-secondary px-3" onClick={() => updateStatus(exam._id, { status: 'live', start_time: new Date().toISOString() })}>
                                <Play className="h-4 w-4" /> Live
                              </button>
                              <button type="button" className="btn-secondary px-3" onClick={() => setSelectedExam(exam)}>
                                <CalendarClock className="h-4 w-4" /> Schedule
                              </button>
                            </>
                          )}
                          {status === 'live' && (
                            <>
                              <Link className="btn-secondary px-3" to={`/teacher/exams/${exam._id}/monitor`}><Users className="h-4 w-4" /> Monitor</Link>
                              <button type="button" className="btn-secondary px-3" onClick={() => updateStatus(exam._id, { status: 'completed', end_time: new Date().toISOString() })}>
                                <Square className="h-4 w-4" /> End
                              </button>
                            </>
                          )}
                          {status === 'completed' && <Link className="btn-secondary px-3" to={`/teacher/exams/${exam._id}/results`}><BarChart3 className="h-4 w-4" /> Results</Link>}
                          <Link className="btn-secondary px-3" to={`/teacher/exams/${exam._id}/edit`}>Edit</Link>
                          <button type="button" className="btn-danger px-3" onClick={() => deleteExam(exam._id)}><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedExam && <ScheduleModal exam={selectedExam} onClose={() => setSelectedExam(null)} onSave={saveSchedule} />}
    </div>
  );
}
