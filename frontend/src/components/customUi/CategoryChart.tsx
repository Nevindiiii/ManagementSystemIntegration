import { useMemo, useState } from 'react';

interface CategoryChartProps {
  products: any[];
}

export const CategoryChart = ({ products }: CategoryChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    if (products.length === 0) return [];

    const categoryCount: Record<string, number> = {};
    products.forEach((product) => {
      const category = product.category || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const colors = [
      { color: 'rgb(59, 130, 246)', bgColor: 'bg-blue-500' },
      { color: 'rgb(16, 185, 129)', bgColor: 'bg-emerald-500' },
      { color: 'rgb(245, 158, 11)', bgColor: 'bg-amber-500' },
      { color: 'rgb(168, 85, 247)', bgColor: 'bg-purple-500' },
      { color: 'rgb(244, 63, 94)', bgColor: 'bg-rose-500' },
      { color: 'rgb(99, 102, 241)', bgColor: 'bg-indigo-500' },
      { color: 'rgb(236, 72, 153)', bgColor: 'bg-pink-500' },
      { color: 'rgb(20, 184, 166)', bgColor: 'bg-teal-500' },
    ];

    return Object.entries(categoryCount)
      .map(([category, count], index) => ({
        category,
        count,
        percentage: (count / products.length) * 100,
        ...colors[index % colors.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No products available
      </div>
    );
  }

  const radius = 120;
  const centerX = 140;
  const centerY = 140;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex justify-center">
        <svg width="280" height="280" className="overflow-visible">
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="40"
          />

          {chartData.map((item, i) => {
            const startAngle = chartData
              .slice(0, i)
              .reduce((sum, d) => sum + (d.percentage / 100) * 360, 0);
            const endAngle = startAngle + (item.percentage / 100) * 360;

            const startRad = (startAngle - 90) * (Math.PI / 180);
            const endRad = (endAngle - 90) * (Math.PI / 180);

            const isHovered = hoveredIndex === i;
            const currentRadius = isHovered ? radius + 10 : radius;

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
                  opacity={isHovered ? 0.9 : 0.8}
                  className="cursor-pointer transition-all duration-300"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

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

          <text
            x={centerX}
            y={centerY - 10}
            textAnchor="middle"
            className="fill-gray-800 text-2xl font-bold"
          >
            {products.length}
          </text>
          <text
            x={centerX}
            y={centerY + 10}
            textAnchor="middle"
            className="fill-gray-600 text-xs"
          >
            Products
          </text>
        </svg>
      </div>

      <div className="flex-1 space-y-2">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Categories</h3>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {chartData.map((item, i) => (
            <div
              key={i}
              className={`flex items-center justify-between rounded-lg p-3 transition-all ${
                hoveredIndex === i ? 'bg-gray-100 scale-105' : 'hover:bg-gray-50'
              }`}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center space-x-3">
                <div className={`h-4 w-4 ${item.bgColor} rounded`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {item.category}
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
      </div>
    </div>
  );
};
