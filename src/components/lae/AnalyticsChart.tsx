import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

interface ChartDataItem {
  label: string;
  value: number;
}

interface AnalyticsChartProps {
  type: "bar" | "doughnut";
  data: ChartDataItem[];
  colors: string[];
  onItemClick?: (label: string) => void;
}

function truncateLabel(label: string, maxLength = 25): string {
  if (!label) return "";
  if (label.length <= maxLength) return label;
  return label.substring(0, maxLength - 3) + "...";
}

function shouldUseLogScale(data: number[]): boolean {
  if (data.length === 0) return false;
  const max = Math.max(...data);
  const nonZeroValues = data.filter((v) => v > 0);
  if (nonZeroValues.length === 0) return false;
  const min = Math.min(...nonZeroValues);
  return max / min > 50;
}

export function AnalyticsChart({
  type,
  data,
  colors,
  onItemClick,
}: AnalyticsChartProps) {
  const chartData = useMemo(
    () =>
      data.map((item, index) => ({
        name: item.label,
        value: item.value,
        fill: colors[index % colors.length],
      })),
    [data, colors]
  );

  const total = useMemo(
    () => chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData]
  );

  const useLogScale = useMemo(
    () => type === "bar" && shouldUseLogScale(chartData.map((d) => d.value)),
    [type, chartData]
  );

  const handleClick = (data: { name: string }) => {
    if (onItemClick && data.name) {
      onItemClick(data.name);
    }
  };

  if (type === "bar") {
    return (
      <div className="w-full h-full min-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          >
            <XAxis 
              type="number" 
              tick={{ fontSize: 11 }} 
              scale={useLogScale ? "log" : "auto"}
              domain={useLogScale ? [1, "auto"] : [0, "auto"]}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => truncateLabel(value, 20)}
            />
            <Tooltip
              formatter={(value: number) => [
                `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
                "Count - Click for details",
              ]}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                borderColor: "hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              cursor="pointer"
              onClick={(data) => handleClick(data)}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Doughnut/Pie chart
  return (
    <div className="w-full h-full min-h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
            cursor="pointer"
            onClick={(data) => handleClick(data)}
            label={({ name, percent }) =>
              `${truncateLabel(name, 15)} (${(percent * 100).toFixed(0)}%)`
            }
            labelLine={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [
              `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%) - Click for details`,
              "Count",
            ]}
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              borderColor: "hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: "hsl(var(--foreground))", fontSize: "12px", cursor: "pointer" }}>
                {truncateLabel(value, 20)}
              </span>
            )}
            onClick={(data) => handleClick({ name: data.value as string })}
            wrapperStyle={{ cursor: "pointer" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
