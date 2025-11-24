import { formatThousand } from "@/utils/table";

const InsightCard = ({
  icon,
  label,
  value,
  realValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  realValue: number;
}) => (
  <div
    className="flex items-center gap-2 p-2 rounded-md border border-gray-200 bg-white shadow-md"
    title={formatThousand(realValue)}
  >
    <div>{icon}</div>
    <div className="flex flex-col leading-tight">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  </div>
);
export default InsightCard;
