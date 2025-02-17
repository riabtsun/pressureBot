export const isValidDate = (dateString: string): boolean => {
  // Проверяем формат дд.мм.гггг
  const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  const match = dateString.match(dateRegex);

  if (!match) return false;

  const [, day, month, year] = match.map(Number);

  // Проверяем, существует ли такая дата
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};
