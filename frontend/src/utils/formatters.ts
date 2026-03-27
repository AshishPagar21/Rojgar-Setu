export const formatMobile = (value: string) =>
  value.replace(/\D/g, "").slice(0, 10);
