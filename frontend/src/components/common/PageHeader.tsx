export const PageHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => {
  return (
    <div className="mb-6 border-b border-slate-100 pb-4">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      {subtitle ? (
        <p className="mt-1 text-sm leading-6 text-slate-600">{subtitle}</p>
      ) : null}
    </div>
  );
};
