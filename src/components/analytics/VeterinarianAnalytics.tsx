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
  Area
} from "recharts";
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Award,
  BookOpen,
  Users,
  Star,
  Target
} from "lucide-react";
import type { AnalyticsData } from "./AnalyticsDashboard";

interface VeterinarianAnalyticsProps {
  data: AnalyticsData | null;
  userProfile: any;
  dateRange: { start: Date; end: Date };
}

export const VeterinarianAnalytics = ({ data, userProfile, dateRange }: VeterinarianAnalyticsProps) => {
  if (!data) {
    return <div>Loading veterinarian analytics...</div>;
  }

  // Mock data for demonstration - in real app, this would come from the backend
  const submissionTrends = [
    { month: 'Jan', cases: 12, outcomes: 11, satisfaction: 4.5 },
    { month: 'Feb', cases: 15, outcomes: 14, satisfaction: 4.6 },
    { month: 'Mar', cases: 18, outcomes: 17, satisfaction: 4.7 },
    { month: 'Apr', cases: 22, outcomes: 21, satisfaction: 4.8 },
    { month: 'May', cases: 19, outcomes: 18, satisfaction: 4.6 },
    { month: 'Jun', cases: 25, outcomes: 24, satisfaction: 4.9 }
  ];

  const specialistPerformance = [
    { name: 'Dr. Smith', cases: 8, avgResponse: '2.1h', rating: 4.9, cost: 1200 },
    { name: 'Dr. Johnson', cases: 6, avgResponse: '1.8h', rating: 4.8, cost: 980 },
    { name: 'Dr. Williams', cases: 10, avgResponse: '3.2h', rating: 4.7, cost: 1450 },
    { name: 'Dr. Brown', cases: 4, avgResponse: '2.5h', rating: 4.6, cost: 760 }
  ];

  const caseComplexity = [
    { complexity: 'Simple', count: 15, color: '#22c55e' },
    { complexity: 'Moderate', count: 25, color: '#eab308' },
    { complexity: 'Complex', count: 12, color: '#ef4444' },
    { complexity: 'Emergency', count: 8, color: '#dc2626' }
  ];

  const costAnalysis = [
    { month: 'Jan', consultations: 2400, diagnostic: 800, total: 3200, roi: 150 },
    { month: 'Feb', consultations: 3100, diagnostic: 1200, total: 4300, roi: 165 },
    { month: 'Mar', consultations: 2800, diagnostic: 900, total: 3700, roi: 145 },
    { month: 'Apr', consultations: 3500, diagnostic: 1100, total: 4600, roi: 170 },
    { month: 'May', consultations: 3200, diagnostic: 950, total: 4150, roi: 160 },
    { month: 'Jun', consultations: 3800, diagnostic: 1300, total: 5100, roi: 180 }
  ];

  const learningOpportunities = [
    { category: 'Cardiology', frequency: 15, accuracy: 85, improvement: '+12%' },
    { category: 'Dermatology', frequency: 22, accuracy: 92, improvement: '+8%' },
    { category: 'Orthopedics', frequency: 18, accuracy: 78, improvement: '+15%' },
    { category: 'Neurology', frequency: 8, accuracy: 88, improvement: '+5%' }
  ];

  return (
    <div className="space-y-6">
      {/* Case Submission History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Case Submission & Outcomes Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={submissionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="cases" 
                  stackId="1"
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary) / 0.6)" 
                  name="Cases Submitted"
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="outcomes" 
                  stackId="2"
                  stroke="hsl(var(--secondary))" 
                  fill="hsl(var(--secondary) / 0.6)" 
                  name="Successful Outcomes"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="satisfaction" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={3}
                  name="Satisfaction Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Specialist Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Specialist Performance & Partnerships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {specialistPerformance.map((specialist, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{specialist.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {specialist.cases} cases • {specialist.avgResponse} avg response
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{specialist.rating}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${specialist.cost}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Case Complexity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Case Complexity Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={caseComplexity}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {caseComplexity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {caseComplexity.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.complexity}: {item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Analysis & ROI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost Analysis & ROI Measurements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar 
                  yAxisId="left"
                  dataKey="consultations" 
                  stackId="a"
                  fill="hsl(var(--primary))" 
                  name="Consultation Costs"
                />
                <Bar 
                  yAxisId="left"
                  dataKey="diagnostic" 
                  stackId="a"
                  fill="hsl(var(--secondary))" 
                  name="Diagnostic Costs"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="roi" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={3}
                  name="ROI %"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">$24,150</div>
              <div className="text-sm text-muted-foreground">Total Savings</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">165%</div>
              <div className="text-sm text-muted-foreground">Average ROI</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">$850</div>
              <div className="text-sm text-muted-foreground">Cost per Case</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Learning Opportunities & Professional Development
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {learningOpportunities.map((opportunity, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{opportunity.category}</h4>
                  <Badge variant="outline">{opportunity.improvement}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Cases: </span>
                    <span className="font-medium">{opportunity.frequency}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Accuracy: </span>
                    <span className="font-medium">{opportunity.accuracy}%</span>
                  </div>
                </div>
                <Progress value={opportunity.accuracy} className="mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};