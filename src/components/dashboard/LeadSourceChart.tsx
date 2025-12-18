import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Website', value: 35, color: 'hsl(234, 89%, 54%)' },
  { name: 'Referral', value: 25, color: 'hsl(158, 64%, 42%)' },
  { name: 'Social Media', value: 20, color: 'hsl(173, 80%, 40%)' },
  { name: 'Cold Call', value: 12, color: 'hsl(38, 92%, 50%)' },
  { name: 'Others', value: 8, color: 'hsl(220, 9%, 46%)' },
];

export function LeadSourceChart() {
  return (
    <div className="stat-card h-[350px]">
      <h3 className="text-lg font-semibold text-foreground mb-4">Lead Sources</h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-sm text-muted-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
