export const formatDateTime = (value) => {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export const percent = (value) => `${Number(value || 0).toFixed(1)}%`;

export const examQuestionCount = (exam) => exam?.questions?.length || 0;
