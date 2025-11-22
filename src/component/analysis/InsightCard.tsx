const InsightCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) => (
  <div className="flex items-center gap-2 p-2 rounded-md border bg-white shadow-sm">
    <div>{icon}</div>
    <div className="flex flex-col leading-tight">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  </div>
);
export default InsightCard;