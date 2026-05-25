export const formatMobile = (value: string): string =>
  value.replace(/\D/g, "").slice(0, 10);

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
