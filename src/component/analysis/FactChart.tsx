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
import { formatNumberUnit, formatThousand } from "@/utils/table";

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
        value: formatNumberUnit(insight.totalMissing),
        realValue: insight.totalMissing,
        icon: <MinusCircle className="w-4 h-4 text-blue-500" />,
      },
      {
        label: "Null",
        value: formatNumberUnit(insight.totalNull),
        realValue: insight.totalNull,
        icon: <MinusCircle className="w-4 h-4 text-gray-500" />,
      },
      {
        label: "Outlier",
        value: formatNumberUnit(insight.totalOutlier),
        realValue: insight.totalOutlier,
        icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      },
      {
        label: "Changed",
        value: formatNumberUnit(insight.changed),
        realValue: insight.changed,
        icon: <TrendingUp className="w-4 h-4 text-amber-500" />,
      },
      {
        label: "Min",
        value: isFinite(insight.minValue)
          ? formatNumberUnit(insight.minValue)
          : "-",
        realValue: insight.minValue,
        icon: <TrendingDown className="w-4 h-4 text-green-600" />,
      },
      {
        label: "Max",
        value: isFinite(insight.maxValue)
          ? formatNumberUnit(insight.maxValue)
          : "-",
        realValue: insight.maxValue,
        icon: <TrendingUp className="w-4 h-4 text-purple-600" />,
      },
    ],
    [insight]
  );

  // =======================================
  //      Memoized Tooltip Formatter
  // =======================================
  const tooltipFormatter = useCallback(
    (v: string | undefined) => formatThousand(Number(v ?? 0)),
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
            realValue={item.realValue}
          />
        ))}
      </div>

      {/* === Chart === */}
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={formatNumberUnit} />
            <Tooltip formatter={tooltipFormatter} />
            <Legend />

            <Line
              type="monotone"
              dataKey="value"
              name="Value"
              stroke="#6366F1"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload } = props;

                if (cx === undefined || cy === undefined) return null;

                if (payload.is_outlier) {
                  // DOT khusus untuk outlier (merah + lebih besar + segitiga)
                  return (
                    <svg x={cx - 6} y={cy - 6} width={12} height={12}>
                      <polygon points="6,0 12,12 0,12" fill="#EF4444" />
                    </svg>
                  );
                }

                // DOT normal
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill="#6366F1"
                    stroke="white"
                    strokeWidth={1}
                  />
                );
              }}
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
