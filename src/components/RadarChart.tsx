import React, { useState } from 'react';

interface SkillData {
  key: string;
  name: string;
  value: number;
  max: number;
  icon: string;
  color: string;
}

interface RadarChartProps {
  skills: {
    triTue: number;
    theLuc: number;
    taiChinh: number;
    kyLuat: number;
    sangTao: number;
  };
}

export const RadarChart: React.FC<RadarChartProps> = ({ skills }) => {
  const [hoveredSkill, setHoveredSkill] = useState<SkillData | null>(null);

  const maxEXP = 2000;

  const data: SkillData[] = [
    { key: 'triTue', name: 'Trí tuệ', value: skills.triTue, max: maxEXP, icon: '🧠', color: '#6366f1' },
    { key: 'theLuc', name: 'Thể lực', value: skills.theLuc, max: maxEXP, icon: '⚡', color: '#ef4444' },
    { key: 'taiChinh', name: 'Tài chính', value: skills.taiChinh, max: maxEXP, icon: '💰', color: '#10b981' },
    { key: 'kyLuat', name: 'Kỷ luật', value: skills.kyLuat, max: maxEXP, icon: '🛡️', color: '#f59e0b' },
    { key: 'sangTao', name: 'Sáng tạo', value: skills.sangTao, max: maxEXP, icon: '✨', color: '#06b6d4' },
  ];

  const size = 300;
  const center = size / 2;
  const radius = size * 0.38;
  const total = data.length;

  // Calculate coordinates on spider polygon
  const getCoordinates = (index: number, valPercent: number) => {
    // Start at top (-90 degrees)
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = radius * valPercent;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Polygon grid rings (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const gridPolygons = gridLevels.map(level => {
    return data
      .map((_, i) => {
        const { x, y } = getCoordinates(i, level);
        return `${x},${y}`;
      })
      .join(' ');
  });

  // User stats polygon
  const statsPolygon = data
    .map((item, i) => {
      const normalized = Math.min(1, Math.max(0.1, item.value / item.max));
      const { x, y } = getCoordinates(i, normalized);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center">
      {/* SVG Canvas */}
      <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full filter drop-shadow-md overflow-visible"
        >
          {/* Background Grid Rings */}
          {gridPolygons.map((points, idx) => (
            <polygon
              key={idx}
              points={points}
              fill={idx === 4 ? 'rgba(30, 41, 59, 0.5)' : 'none'}
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray={idx < 4 ? '3 3' : undefined}
            />
          ))}

          {/* Axes Lines */}
          {data.map((_, i) => {
            const { x, y } = getCoordinates(i, 1.0);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#475569"
                strokeWidth="1"
              />
            );
          })}

          {/* Player Stats Polygon (Filled Glowing) */}
          <polygon
            points={statsPolygon}
            fill="url(#radarGradient)"
            stroke="#818cf8"
            strokeWidth="2.5"
            className="transition-all duration-700 ease-out"
          />

          {/* Gradient Definition */}
          <defs>
            <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.55" />
            </linearGradient>
          </defs>

          {/* Vertex Nodes and Interactive Hover Hitboxes */}
          {data.map((item, i) => {
            const normalized = Math.min(1, Math.max(0.1, item.value / item.max));
            const point = getCoordinates(i, normalized);
            const labelCoord = getCoordinates(i, 1.25);
            const isHovered = hoveredSkill?.key === item.key;

            return (
              <g key={item.key}>
                {/* Node circle */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? 7 : 5}
                  fill={item.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredSkill(item)}
                  onMouseLeave={() => setHoveredSkill(null)}
                />

                {/* Outer Axis Labels */}
                <text
                  x={labelCoord.x}
                  y={labelCoord.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-[11px] font-bold cursor-pointer transition-colors select-none ${
                    isHovered ? 'fill-amber-300 font-extrabold text-[12px]' : 'fill-slate-300'
                  }`}
                  onMouseEnter={() => setHoveredSkill(item)}
                  onMouseLeave={() => setHoveredSkill(null)}
                >
                  {item.icon} {item.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Floating Tooltip */}
        {hoveredSkill && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 border border-indigo-500/60 shadow-xl shadow-indigo-500/20 backdrop-blur-md px-3.5 py-2 rounded-xl pointer-events-none text-center animate-fade-in z-20">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-100">
              <span>{hoveredSkill.icon}</span>
              <span>{hoveredSkill.name}</span>
            </div>
            <div className="text-amber-400 font-mono text-sm font-black mt-0.5">
              {hoveredSkill.value.toLocaleString('vi-VN')} / {hoveredSkill.max.toLocaleString('vi-VN')} EXP
            </div>
            <div className="text-[10px] text-slate-400">
              Cấp kỹ năng: Lv.{Math.floor(hoveredSkill.value / 250) + 1}
            </div>
          </div>
        )}
      </div>

      {/* Mini attribute badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full mt-2">
        {data.map(item => {
          const percent = Math.min(100, Math.round((item.value / item.max) * 100));
          return (
            <div
              key={item.key}
              onMouseEnter={() => setHoveredSkill(item)}
              onMouseLeave={() => setHoveredSkill(null)}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-2 rounded-xl cursor-pointer transition-all hover:bg-slate-850"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <span>{item.icon}</span> {item.name}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{percent}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percent}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
