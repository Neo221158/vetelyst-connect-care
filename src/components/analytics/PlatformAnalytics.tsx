import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, 
  Line, 
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
  AreaChart,
  Area,
  ScatterChart,
  Scatter
} from "recharts";
import { 
  Users, 
  Globe, 
  Clock, 
  TrendingUp,
  Activity,
  Award,
  MapPin,
  Zap,
  Target,
  Network
} from "lucide-react";
import type { AnalyticsData } from "./AnalyticsDashboard";

interface PlatformAnalyticsProps {
  data: AnalyticsData | null;
  userProfile: any;
  dateRange: { start: Date; end: Date };
}

export const PlatformAnalytics = ({ data, userProfile, dateRange }: PlatformAnalyticsProps) => {
  if (!data) {
    return <div>Loading platform analytics...</div>;
  }

  // Mock data for comprehensive platform analytics
  const userEngagementData = [
    { date: '2024-01', activeUsers: 245, newRegistrations: 32, retention: 87 },
    { date: '2024-02', activeUsers: 268, newRegistrations: 41, retention: 89 },
    { date: '2024-03', activeUsers: 289, newRegistrations: 38, retention: 91 },
    { date: '2024-04', activeUsers: 312, newRegistrations: 45, retention: 88 },
    { date: '2024-05', activeUsers: 334, newRegistrations: 39, retention: 92 },
    { date: '2024-06', activeUsers: 358, newRegistrations: 48, retention: 94 }
  ];

  const caseResolutionData = [
    { month: 'Jan', resolved: 156, pending: 23, success: 94.2 },
    { month: 'Feb', resolved: 178, pending: 18, success: 95.8 },
    { month: 'Mar', resolved: 164, pending: 21, success: 93.6 },
    { month: 'Apr', resolved: 189, pending: 16, success: 96.1 },
    { month: 'May', resolved: 201, pending: 14, success: 97.2 },
    { month: 'Jun', resolved: 223, pending: 12, success: 98.1 }
  ];

  const geographicData = [
    { region: 'West Coast', users: 142, cases: 456, growth: '+18%', color: '#3b82f6' },
    { region: 'East Coast', users: 89, cases: 312, growth: '+12%', color: '#22c55e' },
    { region: 'Midwest', users: 67, cases: 201, growth: '+15%', color: '#f59e0b' },
    { region: 'South', users: 94, cases: 278, growth: '+22%', color: '#ef4444' },
    { region: 'International', users: 23, cases: 67, growth: '+35%', color: '#8b5cf6' }
  ];

  const peakUsageData = [
    { hour: '6 AM', consultations: 12, emergency: 2 },
    { hour: '8 AM', consultations: 34, emergency: 5 },
    { hour: '10 AM', consultations: 67, emergency: 8 },
    { hour: '12 PM', consultations: 89, emergency: 12 },
    { hour: '2 PM', consultations: 92, emergency: 15 },
    { hour: '4 PM', consultations: 78, emergency: 9 },
    { hour: '6 PM', consultations: 45, emergency: 6 },
    { hour: '8 PM', consultations: 23, emergency: 4 },
    { hour: '10 PM', consultations: 18, emergency: 8 }
  ];

  const specialtyDemand = [
    { specialty: 'Emergency Medicine', demand: 28, growth: '+15%', satisfaction: 4.8 },
    { specialty: 'Surgery', demand: 24, growth: '+12%', satisfaction: 4.7 },
    { specialty: 'Internal Medicine', demand: 18, growth: '+8%', satisfaction: 4.6 },
    { specialty: 'Cardiology', demand: 12, growth: '+22%', satisfaction: 4.9 },
    { specialty: 'Dermatology', demand: 10, growth: '+18%', satisfaction: 4.5 },
    { specialty: 'Neurology', demand: 8, growth: '+25%', satisfaction: 4.8 }
  ];

  const networkGrowthData = [
    { month: 'Jan', specialists: 89, vets: 156, connections: 245 },
    { month: 'Feb', specialists: 94, vets: 178, connections: 272 },
    { month: 'Mar', specialists: 98, vets: 189, connections: 287 },
    { month: 'Apr', specialists: 105, vets: 204, connections: 309 },
    { month: 'May', specialists: 112, vets: 223, connections: 335 },
    { month: 'Jun', specialists: 118, vets: 245, connections: 363 }
  ];

  const systemPerformanceData = [
    { metric: 'Response Time', value: 98.5, target: 95, status: 'excellent' },
    { metric: 'Uptime', value: 99.9, target: 99.5, status: 'excellent' },
    { metric: 'Error Rate', value: 0.3, target: 1.0, status: 'excellent' },
    { metric: 'Load Capacity', value: 87, target: 80, status: 'good' },
    { metric: 'User Satisfaction', value: 4.7, target: 4.5, status: 'excellent' }
  ];

  return (
    <div className="space-y-6">
      {/* Platform Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              +12.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">432</div>
            <p className="text-xs text-muted-foreground">
              +8.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.8%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3h</div>
            <p className="text-xs text-muted-foreground">
              15min faster than target
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Engagement Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            User Engagement & Growth Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userEngagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="activeUsers" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary) / 0.6)" 
                  name="Active Users"
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="newRegistrations" 
                  stroke="hsl(var(--secondary))" 
                  fill="hsl(var(--secondary) / 0.4)" 
                  name="New Registrations"
                />
                {/* Line and Bar cannot be mixed in AreaChart */}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Resolution Success */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Case Resolution Success Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={caseResolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="resolved" 
                    stroke="#22c55e" 
                    fill="#22c55e"
                    fillOpacity={0.6}
                    name="Resolved Cases"
                  />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="pending" 
                    stroke="#f59e0b" 
                    fill="#f59e0b"
                    fillOpacity={0.6}
                    name="Pending Cases"
                  />
                  {/* Line cannot be used in AreaChart */}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">1,311</div>
                <div className="text-sm text-muted-foreground">Total Resolved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">104</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">96.8%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Peak Usage Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Peak Usage Times & System Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="consultations" 
                    fill="hsl(var(--primary))" 
                    name="Consultations"
                  />
                  <Bar 
                    dataKey="emergency" 
                    fill="#dc2626" 
                    name="Emergency Cases"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2">
              {systemPerformanceData.map((metric, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.metric}</span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={metric.metric === 'User Satisfaction' ? (metric.value / 5) * 100 : metric.value} 
                      className="w-20" 
                    />
                    <span className="text-sm text-muted-foreground w-12">
                      {metric.metric === 'User Satisfaction' ? metric.value : `${metric.value}%`}
                    </span>
                    <Badge variant={metric.status === 'excellent' ? 'default' : 'secondary'}>
                      {metric.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Usage Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geographic Usage Patterns & Growth Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={geographicData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="users"
                  >
                    {geographicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3">
              {geographicData.map((region, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: region.color }}
                    />
                    <div>
                      <div className="font-medium">{region.region}</div>
                      <div className="text-sm text-muted-foreground">
                        {region.users} users • {region.cases} cases
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{region.growth}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specialty Demand Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Popular Specialties & Emerging Needs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {specialtyDemand.map((specialty, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{specialty.specialty}</div>
                  <div className="text-sm text-muted-foreground">
                    {specialty.demand}% of total demand
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-sm font-medium">{specialty.satisfaction}</div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                  <Badge variant={specialty.growth.startsWith('+') ? 'default' : 'secondary'}>
                    {specialty.growth}
                  </Badge>
                </div>
                <Progress value={specialty.demand * 3.5} className="w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Professional Network Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Professional Network Growth & Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={networkGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="specialists" 
                  stackId="1"
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))"
                  fillOpacity={0.8}
                  name="Specialists"
                />
                <Area 
                  type="monotone" 
                  dataKey="vets" 
                  stackId="1"
                  stroke="hsl(var(--secondary))" 
                  fill="hsl(var(--secondary))"
                  fillOpacity={0.8}
                  name="Veterinarians"
                />
                {/* Line cannot be used in AreaChart */}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">118</div>
              <div className="text-sm text-muted-foreground">Active Specialists</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">245</div>
              <div className="text-sm text-muted-foreground">Referring Veterinarians</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">363</div>
              <div className="text-sm text-muted-foreground">Professional Connections</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};