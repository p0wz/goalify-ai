import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Pzt", başarı: 75, tahmin: 8 },
  { name: "Sal", başarı: 82, tahmin: 12 },
  { name: "Çar", başarı: 68, tahmin: 6 },
  { name: "Per", başarı: 90, tahmin: 10 },
  { name: "Cum", başarı: 78, tahmin: 15 },
  { name: "Cmt", başarı: 85, tahmin: 20 },
  { name: "Paz", başarı: 92, tahmin: 18 },
];

export const PerformanceChart = () => {
  return (
    <div className="glass-card-premium rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-lg">Haftalık Performans</h3>
          <p className="text-sm text-muted-foreground">Başarı oranınız %81.4</p>
        </div>
        <select className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
          <option>Bu Hafta</option>
          <option>Geçen Hafta</option>
          <option>Bu Ay</option>
        </select>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorBasari" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(220, 10%, 45%)', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(220, 10%, 45%)', fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 15%, 88%)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              labelStyle={{ color: 'hsl(220, 25%, 12%)', fontWeight: 600 }}
            />
            <Area 
              type="monotone" 
              dataKey="başarı" 
              stroke="hsl(262, 83%, 58%)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorBasari)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
