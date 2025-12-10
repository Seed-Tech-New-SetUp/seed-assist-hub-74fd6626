import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const roiData = [
  { month: "Jan", leads: 120, applications: 45, admits: 28, roi: 2.4 },
  { month: "Feb", leads: 145, applications: 52, admits: 35, roi: 2.8 },
  { month: "Mar", leads: 180, applications: 68, admits: 42, roi: 3.2 },
  { month: "Apr", leads: 210, applications: 85, admits: 55, roi: 3.6 },
  { month: "May", leads: 250, applications: 102, admits: 68, roi: 4.1 },
  { month: "Jun", leads: 280, applications: 118, admits: 78, roi: 4.5 },
  { month: "Jul", leads: 320, applications: 135, admits: 92, roi: 5.0 },
  { month: "Aug", leads: 350, applications: 148, admits: 105, roi: 5.4 },
];

const channelData = [
  { name: "Virtual Events", leads: 450, conversion: 32 },
  { name: "Campus Tours", leads: 280, conversion: 45 },
  { name: "Festivals", leads: 380, conversion: 28 },
  { name: "Meetups", leads: 220, conversion: 38 },
  { name: "In-Country", leads: 320, conversion: 42 },
];

export function ROIChart() {
  return (
    <Card variant="default" className="col-span-2 animate-fade-in-up opacity-0" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">ROI & Performance Trends</CardTitle>
        <CardDescription className="text-xs">
          Monthly leads, applications, and admits with ROI multiplier
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={roiData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAdmits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="hsl(220, 9%, 46%)" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(220, 9%, 46%)" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(0, 0%, 100%)',
                  border: '1px solid hsl(220, 13%, 91%)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '16px' }} />
              <Area
                type="monotone"
                dataKey="leads"
                stroke="hsl(221, 83%, 53%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLeads)"
                name="Leads"
              />
              <Area
                type="monotone"
                dataKey="applications"
                stroke="hsl(262, 83%, 58%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorApplications)"
                name="Applications"
              />
              <Area
                type="monotone"
                dataKey="admits"
                stroke="hsl(142, 71%, 45%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAdmits)"
                name="Admits"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ChannelPerformanceChart() {
  return (
    <Card variant="default" className="animate-fade-in-up opacity-0" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Channel Performance</CardTitle>
        <CardDescription className="text-xs">Leads by channel with conversion rates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channelData} layout="vertical" margin={{ top: 10, right: 10, left: 70, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="hsl(220, 9%, 46%)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="hsl(220, 9%, 46%)" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(0, 0%, 100%)',
                  border: '1px solid hsl(220, 13%, 91%)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  fontSize: '12px',
                }}
              />
              <Bar 
                dataKey="leads" 
                fill="hsl(221, 83%, 53%)" 
                radius={[0, 4, 4, 0]}
                name="Leads Generated"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
