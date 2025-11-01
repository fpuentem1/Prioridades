// Utilidades para fechas y semanas

export const getWeekDates = (date: Date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);

  return { monday, friday };
};

export const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getWeekLabel = (monday: Date | string) => {
  const mondayDate = new Date(monday);
  const friday = new Date(mondayDate);
  friday.setDate(mondayDate.getDate() + 4);
  return `${formatDate(mondayDate)} - ${formatDate(friday)}`;
};
