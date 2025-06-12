export const getChallengeDay = (startDateStr = '2025-06-01') => {
  const start = new Date(startDateStr);
  const today = new Date();

  // Normalize times to 00:00
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffInTime = today.getTime() - start.getTime();
  const diffInDays = Math.floor(diffInTime / (1000 * 60 * 60 * 24)) + 1;

  return diffInDays;
};
