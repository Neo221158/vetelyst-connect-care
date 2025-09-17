import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { VeterinarianAnalytics } from "./VeterinarianAnalytics";
import { SpecialistAnalytics } from "./SpecialistAnalytics";
import { PlatformAnalytics } from "./PlatformAnalytics";
import { AnalyticsFilters } from "./AnalyticsFilters";
import { 
  CalendarIcon, 
  TrendingUp, 
  Users, 
  Activity,
  BarChart3,
  Download
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

export interface AnalyticsData {
  caseMetrics: any;
  performanceMetrics: any;
  userMetrics: any;
  financialMetrics: any;
  timeRange: {
    start: Date;
    end: Date;
  };
}

export const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (userProfile) {
      fetchAnalyticsData();
      
      // Set up auto-refresh for real-time updates
      const interval = setInterval(fetchAnalyticsData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [userProfile, dateRange, selectedSpecialty, refreshInterval]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch different analytics based on user role
      const data = await Promise.all([
        fetchCaseMetrics(),
        fetchPerformanceMetrics(),
        fetchUserMetrics(),
        fetchFinancialMetrics()
      ]);

      setAnalyticsData({
        caseMetrics: data[0],
        performanceMetrics: data[1],
        userMetrics: data[2],
        financialMetrics: data[3],
        timeRange: dateRange
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCaseMetrics = async () => {
    const { data, error } = await supabase
      .from('cases')
      .select(`
        *,
        case_responses(count),
        case_reports(count)
      `)
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());
    
    if (error) throw error;
    return data;
  };

  const fetchPerformanceMetrics = async () => {
    const { data, error } = await supabase
      .from('case_responses')
      .select(`
        *,
        cases(urgency, status, created_at),
        specialist:profiles!specialist_id(specialty_area, rating)
      `)
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());
    
    if (error) throw error;
    return data;
  };

  const fetchUserMetrics = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) throw error;
    return data;
  };

  const fetchFinancialMetrics = async () => {
    // This would include billing data when implemented
    return {
      totalRevenue: 0,
      avgCaseValue: 0,
      outstandingInvoices: 0
    };
  };

  const exportAnalytics = async () => {
    // Generate and download analytics report
    const reportData = {
      dateRange,
      userProfile,
      analyticsData,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vetelyst-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading || !userProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  const quickDateRanges = [
    { label: "Last 7 days", start: subDays(new Date(), 7), end: new Date() },
    { label: "Last 30 days", start: subDays(new Date(), 30), end: new Date() },
    { label: "This month", start: startOfMonth(new Date()), end: endOfMonth(new Date()) },
    { label: "Last 3 months", start: subDays(new Date(), 90), end: new Date() }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Performance insights for {userProfile.first_name} {userProfile.last_name}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <Select 
            value=""
            onValueChange={(value) => {
              const range = quickDateRanges.find(r => r.label === value);
              if (range) {
                setDateRange({ start: range.start, end: range.end });
              }
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Quick ranges" />
            </SelectTrigger>
            <SelectContent>
              {quickDateRanges.map((range) => (
                <SelectItem key={range.label} value={range.label}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {format(dateRange.start, "MMM d")} - {format(dateRange.end, "MMM d")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: dateRange.start, to: dateRange.end }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ start: range.from, end: range.to });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Button onClick={exportAnalytics} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.caseMetrics?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active in selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
            <p className="text-xs text-muted-foreground">
              15min faster than target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.userMetrics?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered professionals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role-based Analytics */}
      <Tabs defaultValue={userProfile.role} className="space-y-4">
        <TabsList>
          {userProfile.role === 'referring_vet' && (
            <TabsTrigger value="referring_vet">Veterinarian View</TabsTrigger>
          )}
          {userProfile.role === 'specialist' && (
            <TabsTrigger value="specialist">Specialist View</TabsTrigger>
          )}
          <TabsTrigger value="platform">Platform Overview</TabsTrigger>
        </TabsList>

        {userProfile.role === 'referring_vet' && (
          <TabsContent value="referring_vet">
            <VeterinarianAnalytics 
              data={analyticsData} 
              userProfile={userProfile}
              dateRange={dateRange}
            />
          </TabsContent>
        )}

        {userProfile.role === 'specialist' && (
          <TabsContent value="specialist">
            <SpecialistAnalytics 
              data={analyticsData} 
              userProfile={userProfile}
              dateRange={dateRange}
            />
          </TabsContent>
        )}

        <TabsContent value="platform">
          <PlatformAnalytics 
            data={analyticsData} 
            userProfile={userProfile}
            dateRange={dateRange}
          />
        </TabsContent>
      </Tabs>

      {/* Refresh Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Real-time Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select 
              value={refreshInterval.toString()}
              onValueChange={(value) => setRefreshInterval(parseInt(value))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10000">10 seconds</SelectItem>
                <SelectItem value="30000">30 seconds</SelectItem>
                <SelectItem value="60000">1 minute</SelectItem>
                <SelectItem value="300000">5 minutes</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="flex items-center gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};