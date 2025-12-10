import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, ArrowUpRight, Calendar } from "lucide-react";

const roiData = [
  { month: "Jan", investment: 15000, returns: 42000, leads: 180 },
  { month: "Feb", investment: 18000, returns: 58000, leads: 220 },
  { month: "Mar", investment: 22000, returns: 78000, leads: 310 },
  { month: "Apr", investment: 20000, returns: 85000, leads: 290 },
  { month: "May", investment: 25000, returns: 112000, leads: 380 },
  { month: "Jun", investment: 28000, returns: 145000, leads: 420 },
];

const channelData = [
  { name: "Virtual Events", value: 35, color: "hsl(225, 73%, 57%)" },
  { name: "Direct Outreach", value: 28, color: "hsl(280, 73%, 60%)" },
  { name: "Partner Referrals", value: 22, color: "hsl(152, 69%, 46%)" },
  { name: "Digital Marketing", value: 15, color: "hsl(38, 92%, 50%)" },
];

const funnelData = [
  { stage: "Impressions", value: 45000, fill: "hsl(225, 73%, 57%)" },
  { stage: "Engaged", value: 12000, fill: "hsl(250, 73%, 60%)" },
  { stage: "Leads", value: 4800, fill: "hsl(280, 73%, 60%)" },
  { stage: "Applied", value: 1200, fill: "hsl(310, 73%, 55%)" },
  { stage: "Admitted", value: 420, fill: "hsl(152, 69%, 46%)" },
];

export function AdvancedROIChart() {
  return (
    <Card className="col-span-2 overflow-hidden border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              ROI Performance
              <Badge variant="secondary" className="font-normal">
                <TrendingUp className="h-3 w-3 mr-1 text-success" />
                5.2x multiplier
              </Badge>
            </CardTitle>
            <CardDescription>Investment vs Returns over time</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              Last 6 months
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={roiData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(225, 73%, 57%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(225, 73%, 57%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(280, 73%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(280, 73%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.08)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="returns"
                stroke="hsl(225, 73%, 57%)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorReturns)"
                name="Returns"
              />
              <Area
                type="monotone"
                dataKey="investment"
                stroke="hsl(280, 73%, 60%)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorInvestment)"
                name="Investment"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Investment</p>
            <p className="text-xl font-display font-bold">$128K</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-success" />
              <span className="text-success">+12%</span> vs last period
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Returns</p>
            <p className="text-xl font-display font-bold text-primary">$520K</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-success" />
              <span className="text-success">+28%</span> vs last period
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Leads Generated</p>
            <p className="text-xl font-display font-bold">1,800</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-success" />
              <span className="text-success">+35%</span> vs last period
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ChannelPerformance() {
  return (
    <Card className="overflow-hidden border-border/50">
      <CardHeader className="pb-2">
        <CardTitle>Channel Mix</CardTitle>
        <CardDescription>Lead attribution by source</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[200px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={channelData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {channelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-3 mt-4">
          {channelData.map((channel) => (
            <div key={channel.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: channel.color }}
                />
                <span className="text-sm">{channel.name}</span>
              </div>
              <span className="text-sm font-medium">{channel.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ConversionFunnel() {
  return (
    <Card className="overflow-hidden border-border/50">
      <CardHeader className="pb-2">
        <CardTitle>Conversion Funnel</CardTitle>
        <CardDescription>From impression to admission</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {funnelData.map((stage, index) => {
            const percentage = index === 0 ? 100 : (stage.value / funnelData[0].value) * 100;
            return (
              <div key={stage.stage} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{stage.stage}</span>
                  <span className="font-medium">{stage.value.toLocaleString()}</span>
                </div>
                <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: stage.fill,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overall Conversion</span>
            <Badge className="gradient-success text-white">
              0.93%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}