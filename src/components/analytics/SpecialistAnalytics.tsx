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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { 
  Activity, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Users,
  Star,
  Target,
  BookOpen,
  Award,
  Network
} from "lucide-react";
import type { AnalyticsData } from "./AnalyticsDashboard";

interface SpecialistAnalyticsProps {
  data: AnalyticsData | null;
  userProfile: any;
  dateRange: { start: Date; end: Date };
}

export const SpecialistAnalytics = ({ data, userProfile, dateRange }: SpecialistAnalyticsProps) => {
  if (!data) {
    return <div>Loading specialist analytics...</div>;
  }

  // Mock data for demonstration
  const caseVolumeData = [
    { month: 'Jan', cases: 45, emergency: 8, routine: 25, urgent: 12 },
    { month: 'Feb', cases: 52, emergency: 12, routine: 28, urgent: 12 },
    { month: 'Mar', cases: 48, emergency: 9, routine: 26, urgent: 13 },
    { month: 'Apr', cases: 58, emergency: 15, routine: 30, urgent: 13 },
    { month: 'May', cases: 55, emergency: 11, routine: 32, urgent: 12 },
    { month: 'Jun', cases: 62, emergency: 13, routine: 35, urgent: 14 }
  ];

  const performanceMetrics = [
    { metric: 'Response Time', score: 92, target: 90, color: '#22c55e' },
    { metric: 'Case Resolution', score: 96, target: 95, color: '#3b82f6' },
    { metric: 'Client Satisfaction', score: 4.8, target: 4.5, color: '#8b5cf6' },
    { metric: 'Follow-up Rate', score: 88, target: 85, color: '#f59e0b' },
    { metric: 'Documentation', score: 94, target: 90, color: '#ef4444' }
  ];

  const satisfactionTrends = [
    { month: 'Jan', rating: 4.6, reviews: 23, referrals: 12 },
    { month: 'Feb', rating: 4.7, reviews: 28, referrals: 15 },
    { month: 'Mar', rating: 4.5, reviews: 25, referrals: 13 },
    { month: 'Apr', rating: 4.8, reviews: 32, referrals: 18 },
    { month: 'May', rating: 4.9, reviews: 29, referrals: 16 },
    { month: 'Jun', rating: 4.8, reviews: 35, referrals: 22 }
  ];

  const revenueData = [
    { month: 'Jan', consultations: 5400, reports: 1200, total: 6600 },
    { month: 'Feb', consultations: 6240, reports: 1440, total: 7680 },
    { month: 'Mar', consultations: 5760, reports: 1320, total: 7080 },
    { month: 'Apr', categories: 6960, reports: 1680, total: 8640 },
    { month: 'May', consultations: 6600, reports: 1500, total: 8100 },
    { month: 'Jun', consultations: 7440, reports: 1800, total: 9240 }
  ];

  const caseComplexityProgression = [
    { quarter: 'Q1 2024', simple: 45, moderate: 35, complex: 20, success: 92 },
    { quarter: 'Q2 2024', simple: 40, moderate: 38, complex: 22, success: 94 },
    { quarter: 'Q3 2024', simple: 35, moderate: 40, complex: 25, success: 95 },
    { quarter: 'Q4 2024', simple: 30, moderate: 42, complex: 28, success: 96 }
  ];

  const referralSources = [
    { source: 'Metropolitan Vet Clinic', cases: 15, satisfaction: 4.9, growth: '+12%' },
    { source: 'Coastal Animal Hospital', cases: 12, satisfaction: 4.7, growth: '+8%' },
    { source: 'Valley Pet Center', cases: 10, satisfaction: 4.8, growth: '+15%' },
    { source: 'Mountain View Vets', cases: 8, satisfaction: 4.6, growth: '+5%' },
    { source: 'Direct Referrals', cases: 6, satisfaction: 4.9, growth: '+20%' }
  ];

  const radarData = [
    { subject: 'Technical Expertise', A: 95, fullMark: 100 },
    { subject: 'Communication', A: 88, fullMark: 100 },
    { subject: 'Timeliness', A: 92, fullMark: 100 },
    { subject: 'Innovation', A: 86, fullMark: 100 },
    { subject: 'Collaboration', A: 90, fullMark: 100 },
    { subject: 'Mentoring', A: 84, fullMark: 100 }
  ];

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">
                {metric.metric === 'Client Satisfaction' ? metric.score : `${metric.score}%`}
              </div>
              <Progress 
                value={metric.metric === 'Client Satisfaction' ? (metric.score / 5) * 100 : metric.score} 
                className="mb-2" 
              />
              <p className="text-xs text-muted-foreground">
                Target: {metric.metric === 'Client Satisfaction' ? metric.target : `${metric.target}%`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Case Volume & Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Case Volume Trends & Seasonal Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={caseVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="emergency" 
                  stackId="1"
                  stroke="#dc2626" 
                  fill="#dc2626"
                  fillOpacity={0.8}
                  name="Emergency"
                />
                <Area 
                  type="monotone" 
                  dataKey="urgent" 
                  stackId="1"
                  stroke="#f59e0b" 
                  fill="#f59e0b"
                  fillOpacity={0.8}
                  name="Urgent"
                />
                <Area 
                  type="monotone" 
                  dataKey="routine" 
                  stackId="1"
                  stroke="#22c55e" 
                  fill="#22c55e"
                  fillOpacity={0.8}
                  name="Routine"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Satisfaction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Client Satisfaction & Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={satisfactionTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" domain={[4.0, 5.0]} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="rating" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    name="Rating"
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="reviews" 
                    fill="hsl(var(--secondary) / 0.6)" 
                    name="Reviews"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-yellow-500">4.8</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500">172</div>
                <div className="text-sm text-muted-foreground">Total Reviews</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">96</div>
                <div className="text-sm text-muted-foreground">Referrals</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Development Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Professional Development Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar
                    name="Performance"
                    dataKey="A"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Tracking & Billing Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="consultations" 
                  stackId="a"
                  fill="hsl(var(--primary))" 
                  name="Consultations"
                />
                <Bar 
                  dataKey="reports" 
                  stackId="a"
                  fill="hsl(var(--secondary))" 
                  name="Reports"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">$47,340</div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">$162</div>
              <div className="text-sm text-muted-foreground">Avg Case Value</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">15.2%</div>
              <div className="text-sm text-muted-foreground">Growth Rate</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">$2,450</div>
              <div className="text-sm text-muted-foreground">Outstanding</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Case Complexity Progression */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Case Complexity Progression & Success Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={caseComplexityProgression}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="simple" 
                  stackId="1"
                  stroke="#22c55e" 
                  fill="#22c55e"
                  fillOpacity={0.6}
                  name="Simple Cases %"
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="moderate" 
                  stackId="1"
                  stroke="#f59e0b" 
                  fill="#f59e0b"
                  fillOpacity={0.6}
                  name="Moderate Cases %"
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="complex" 
                  stackId="1"
                  stroke="#ef4444" 
                  fill="#ef4444"
                  fillOpacity={0.6}
                  name="Complex Cases %"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="success" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  name="Success Rate %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Referral Source Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Referral Source Analysis & Network Effectiveness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {referralSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{source.source}</div>
                  <div className="text-sm text-muted-foreground">
                    {source.cases} cases this period
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{source.satisfaction}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Satisfaction</div>
                  </div>
                  <Badge variant={source.growth.startsWith('+') ? 'default' : 'secondary'}>
                    {source.growth}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};