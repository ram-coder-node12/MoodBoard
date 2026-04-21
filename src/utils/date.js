export function formatDateKey(date = new Date()) {
  return new Date(date).toLocaleDateString('en-CA');
}

export function getStartOfWeek(date = new Date()) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

export function getEndOfWeek(date = new Date()) {
  const next = getStartOfWeek(date);
  next.setDate(next.getDate() + 6);
  return next;
}

export function formatTimeLabel(timeValue) {
  if (!timeValue) return '8:00 PM';

  const [hours = '20', minutes = '00'] = timeValue.split(':');
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
