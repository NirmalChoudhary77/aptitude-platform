// src/utils/mockApi.js
// Phase-1 mock data & helpers. Replace with real API calls later.

const now = new Date();

// helper to add minutes
const addMinutes = (d, m) => new Date(d.getTime() + m * 60000);

// sample exams: one upcoming, one active, one past
export const mockExams = [
  {
    id: "exam-upcoming-1",
    title: "Aptitude Test — Set A (Upcoming)",
    description: "Mock aptitude exam (upcoming).",
    start_at: addMinutes(now, 60 * 24 * 2).toISOString(), // 2 days from now
    duration_minutes: 90,
    total_questions: 20,
  },
  {
    id: "exam-active-1",
    title: "Aptitude Test — Set B (Active Now)",
    description: "Active mock exam (started 10 minutes ago).",
    start_at: addMinutes(now, -10).toISOString(), // started 10 minutes ago
    duration_minutes: 60,
    total_questions: 15,
  },
  {
    id: "exam-past-1",
    title: "Aptitude Test — Set C (Past)",
    description: "Past mock exam (completed).",
    start_at: addMinutes(now, -60 * 24 * 4).toISOString(), // 4 days ago
    duration_minutes: 90,
    total_questions: 25,
  },
];

// helper to derive status
export function deriveExamStatus(exam) {
  const start = new Date(exam.start_at);
  const end = addMinutes(start, exam.duration_minutes);
  const nowLocal = new Date();
  if (nowLocal < start) return "upcoming";
  if (nowLocal >= start && nowLocal <= end) return "active";
  return "past";
}

export function getExamsForStudent() {
  // in real backend this would be filtered per student or enrolled exams
  return mockExams.map((exam) => ({ ...exam, status: deriveExamStatus(exam) }));
}

export function getExamById(id) {
  return mockExams.find((e) => e.id === id) || null;
}
