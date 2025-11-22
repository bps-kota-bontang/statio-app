import { useMemo, useCallback } from "react";
import type { Fact } from "@/type/fact";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

import {
  AlertTriangle,
  MinusCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import InsightCard from "@/component/analysis/InsightCard";

// ========= Formatters ========= //
const formatNumber = (num: number | null) => {
  if (num === null || isNaN(num)) return "-";
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(0) + "K";
  return num.toString();
};

const formatThousand = (val: number | string | null) => {
  if (val === null || val === "-" || val === undefined) return "-";

  const num = Number(val);
  if (isNaN(num)) return "-";

  return num.toLocaleString("id-ID");
};

const FactChart = ({
  facts,
  rowName,
  columnName,
}: {
  facts: Fact[];
  rowName?: string;
  columnName?: string;
}) => {
  // =======================================
  //      Memoized Sorted Data for Chart
  // =======================================
  const data = useMemo(
    () => [...facts].sort((a, b) => a.year - b.year),
    [facts]
  );

  // =======================================
  //      Memoized Insight Aggregation
  // =======================================
  const insight = useMemo(() => {
    const totalMissing = facts.filter((f) => f.value === null).length;

    const totalNull = facts.filter(
      (f) => f.value === null && f.old_value === null
    ).length;

    const totalOutlier = facts.filter((f) => f.is_outlier).length;

    const changed = facts.filter(
      (f) => f.value !== null && f.old_value !== null && f.value !== f.old_value
    ).length;

    const minValue = Math.min(...facts.map((f) => f.value ?? Infinity));
    const maxValue = Math.max(...facts.map((f) => f.value ?? -Infinity));

    return {
      totalMissing,
      totalNull,
      totalOutlier,
      changed,
      minValue,
      maxValue,
    };
  }, [facts]);

  // =======================================
  //      Memoized Insight Item Array
  // =======================================
  const insightItems = useMemo(
    () => [
      {
        label: "Missing",
        value: formatThousand(insight.totalMissing),
        icon: <MinusCircle className="w-4 h-4 text-blue-500" />,
      },
      {
        label: "Null",
        value: formatThousand(insight.totalNull),
        icon: <MinusCircle className="w-4 h-4 text-gray-500" />,
      },
      {
        label: "Outlier",
        value: formatThousand(insight.totalOutlier),
        icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      },
      {
        label: "Changed",
        value: formatThousand(insight.changed),
        icon: <TrendingUp className="w-4 h-4 text-amber-500" />,
      },
      {
        label: "Min",
        value: isFinite(insight.minValue)
          ? formatThousand(insight.minValue)
          : "-",
        icon: <TrendingDown className="w-4 h-4 text-green-600" />,
      },
      {
        label: "Max",
        value: isFinite(insight.maxValue)
          ? formatThousand(insight.maxValue)
          : "-",
        icon: <TrendingUp className="w-4 h-4 text-purple-600" />,
      },
    ],
    [insight]
  );

  // =======================================
  //      Memoized Tooltip Formatter
  // =======================================
  const tooltipFormatter = useCallback(
    (v: string) => formatNumber(Number(v)),
    []
  );

  return (
    <div className="w-full space-y-5 pb-6">
      <h2 className="text-lg font-semibold">Trend Data</h2>
      <div className="space-y-1">
        {rowName && <p className="text-xs text-gray-500">Row: {rowName}</p>}
        {columnName && (
          <p className="text-xs text-gray-500">Column: {columnName}</p>
        )}
      </div>

      {/* === Insight Summary === */}
      <div className="grid grid-cols-3 gap-2 text-sm">
        {insightItems.map((item) => (
          <InsightCard
            key={item.label}
            icon={item.icon}
            label={item.label}
            value={item.value}
          />
        ))}
      </div>

      {/* === Chart === */}
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={formatNumber} />
            <Tooltip formatter={tooltipFormatter} />
            <Legend />

            <Line
              type="monotone"
              dataKey="value"
              name="Value"
              stroke="#6366F1"
              strokeWidth={2}
              dot={{ r: 4 }}
            />

            <Line
              type="monotone"
              dataKey="old_value"
              name="Old Value"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FactChart;
