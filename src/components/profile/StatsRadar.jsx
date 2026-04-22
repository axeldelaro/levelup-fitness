import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'

const STAT_LABELS = {
  strength:     'FORCE',
  agility:      'AGILITÉ',
  endurance:    'ENDURANCE',
  vitality:     'VITALITÉ',
  intelligence: 'INTEL',
}

export default function StatsRadar({ stats = {} }) {
  const data = Object.entries(STAT_LABELS).map(([key, label]) => ({
    stat: label,
    value: stats[key] ?? 10,
    fullMark: 100,
  }))

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid
            gridType="polygon"
            stroke="rgba(0,212,255,0.15)"
            strokeDasharray="0"
          />
          <PolarAngleAxis
            dataKey="stat"
            tick={({ x, y, payload }) => (
              <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize: 9, fill: 'rgba(0,212,255,0.7)', fontFamily: 'Orbitron', fontWeight: 600, letterSpacing: '0.05em' }}>
                {payload.value}
              </text>
            )}
          />
          <Radar
            dataKey="value"
            stroke="#00d4ff"
            strokeWidth={2}
            fill="#00d4ff"
            fillOpacity={0.15}
            dot={{ fill: '#00d4ff', r: 3, strokeWidth: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
