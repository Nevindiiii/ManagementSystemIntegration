import { useMemo, useState } from 'react';

interface ActivityChartProps {
  cartData: any[];
}

export const ActivityChart = ({ cartData }: ActivityChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedRange, setSelectedRange] = useState<number | null>(null);

  const chartData = useMemo(() => {
    if (cartData.length === 0) {
      return [];
    }

    const priceRanges = [
      {
        min: 0,
        max: 50,
        label: '$0-49',
        color: 'rgb(16, 185, 129)',
        bgColor: 'bg-emerald-500',
      },
      {
        min: 50,
        max: 100,
        label: '$50-99',
        color: 'rgb(59, 130, 246)',
        bgColor: 'bg-blue-500',
      },
      {
        min: 100,
        max: 200,
        label: '$100-199',
        color: 'rgb(168, 85, 247)',
        bgColor: 'bg-purple-500',
      },
      {
        min: 200,
        max: 500,
        label: '$200-499',
        color: 'rgb(245, 158, 11)',
        bgColor: 'bg-amber-500',
      },
      {
        min: 500,
        max: Infinity,
        label: '$500+',
        color: 'rgb(244, 63, 94)',
        bgColor: 'bg-rose-500',
      },
    ];

    const total = cartData.length;

    return priceRanges
      .map(({ min, max, label, color, bgColor }) => {
        const items = cartData.filter(
          (item) => item.price >= min && item.price < max
        );
        const count = items.length;
        const percentage = total > 0 ? (count / total) * 100 : 0;
        return { range: label, count, percentage, color, bgColor, items };
      })
      .filter((item) => item.count > 0);
  }, [cartData]);

  const filteredItems =
    selectedRange !== null ? chartData[selectedRange]?.items || [] : cartData;

  const stats = useMemo(() => {
    if (filteredItems.length === 0) return { min: 0, max: 0, avg: 0, total: 0 };
    const prices = filteredItems.map((item) => item.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      total: filteredItems.length,
    };
  }, [filteredItems]);

  if (cartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  const radius = 150;
  const centerX = 160;
  const centerY = 260;
  const maxRadius = radius;

  return (
    <div>
      <div className="flex flex-col-reverse gap-4 lg:flex-row">
        {/* Interactive Radial Chart */}
        <div className="flex flex-1 justify-center lg:order-first">
          <svg width="240" height="240" className="overflow-visible">
            {/* Background circle */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="40"
            />

            {/* Data segments */}
            {chartData.map((item, i) => {
              const startAngle = chartData
                .slice(0, i)
                .reduce((sum, d) => sum + (d.percentage / 100) * 360, 0);
              const endAngle = startAngle + (item.percentage / 100) * 360;

              const startRad = (startAngle - 90) * (Math.PI / 180);
              const endRad = (endAngle - 90) * (Math.PI / 180);

              const isHovered = hoveredIndex === i;
              const isSelected = selectedRange === i;
              const currentRadius =
                isHovered || isSelected ? maxRadius + 10 : maxRadius;

              const x1 = centerX + currentRadius * Math.cos(startRad);
              const y1 = centerY + currentRadius * Math.sin(startRad);
              const x2 = centerX + currentRadius * Math.cos(endRad);
              const y2 = centerY + currentRadius * Math.sin(endRad);

              const largeArc = item.percentage > 50 ? 1 : 0;

              const path = `
                M ${centerX} ${centerY}
                L ${x1} ${y1}
                A ${currentRadius} ${currentRadius} 0 ${largeArc} 1 ${x2} ${y2}
                Z
              `;

              return (
                <g key={i}>
                  <path
                    d={path}
                    fill={item.color}
                    opacity={isSelected ? 1 : isHovered ? 0.9 : 0.8}
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() =>
                      setSelectedRange(selectedRange === i ? null : i)
                    }
                  />

                  {/* Label */}
                  {item.percentage > 5 && (
                    <text
                      x={
                        centerX +
                        currentRadius * 0.7 * Math.cos((startRad + endRad) / 2)
                      }
                      y={
                        centerY +
                        currentRadius * 0.7 * Math.sin((startRad + endRad) / 2)
                      }
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none fill-white text-xs font-semibold"
                    >
                      {item.count}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Center text */}
            <text
              x={centerX}
              y={centerY - 10}
              textAnchor="middle"
              className="fill-gray-800 text-2xl font-bold"
            >
              {stats.total}
            </text>
            <text
              x={centerX}
              y={centerY + 10}
              textAnchor="middle"
              className="fill-gray-600 text-xs"
            >
              Items
            </text>
          </svg>
        </div>

        {/* Legend and Stats */}
        <div className="flex-1 space-y-3">
          {/* Interactive Legend */}
          <div className="space-y-2">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Price Ranges
            </h3>
            {chartData.map((item, i) => (
              <div
                key={i}
                className={`flex cursor-pointer items-center justify-between rounded-lg p-3 transition-all ${
                  selectedRange === i
                    ? 'scale-105 bg-gray-100 shadow-sm'
                    : hoveredIndex === i
                      ? 'bg-gray-50'
                      : 'hover:bg-gray-50'
                }`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setSelectedRange(selectedRange === i ? null : i)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`h-4 w-4 ${item.bgColor} rounded`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {item.range}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-800">
                    {item.count}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-3 border-t pt-4">
            <div className="rounded-lg bg-linear-to-br from-emerald-50 to-emerald-100 p-3">
              <div className="text-lg font-bold text-emerald-700">
                ${stats.min.toFixed(2)}
              </div>
              <div className="text-xs text-emerald-600">Minimum</div>
            </div>
            <div className="rounded-lg bg-linear-to-br from-rose-50 to-rose-100 p-3">
              <div className="text-lg font-bold text-rose-700">
                ${stats.max.toFixed(2)}
              </div>
              <div className="text-xs text-rose-600">Maximum</div>
            </div>
            <div className="col-span-2 rounded-lg bg-linear-to-br from-blue-50 to-blue-100 p-3">
              <div className="text-lg font-bold text-blue-700">
                ${stats.avg.toFixed(2)}
              </div>
              <div className="text-xs text-blue-600">Average</div>
            </div>
          </div>

          {selectedRange !== null && (
            <button
              onClick={() => setSelectedRange(null)}
              className="w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
