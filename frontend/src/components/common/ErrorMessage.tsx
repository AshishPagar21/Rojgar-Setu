export const ErrorMessage = ({ message }: { message?: string }) => {
  if (!message) return null;

  return (
    <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
};
