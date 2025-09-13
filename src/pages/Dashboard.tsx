import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CaseQueue } from "@/components/dashboard/CaseQueue";
import { CaseDetail } from "@/components/dashboard/CaseDetail";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Settings, 
  LogOut, 
  Stethoscope, 
  Activity,
  Clock,
  CheckCircle,
  User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Navigate } from "react-router-dom";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [notifications] = useState(3); // Mock notification count
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">Vetelyst</span>
              </div>
              <Badge variant="secondary" className="text-xs">Specialist Dashboard</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-6 mr-6">
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-muted-foreground">Active:</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-muted-foreground">Pending:</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="font-medium">45</span>
                </div>
              </div>

              {/* Notifications */}
              <Button variant="outline" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium">{user.email}</div>
                  <div className="text-xs text-muted-foreground">Veterinary Specialist</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Case Queue */}
          <div className={selectedCaseId ? "lg:col-span-1" : "lg:col-span-3"}>
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">Case Queue</h1>
                <p className="text-muted-foreground">
                  Review and manage incoming veterinary consultations
                </p>
              </div>
              
              <CaseQueue 
                onCaseSelect={setSelectedCaseId}
                selectedCaseId={selectedCaseId}
              />
            </div>
          </div>

          {/* Case Detail */}
          {selectedCaseId && (
            <div className="lg:col-span-2">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Case Details</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedCaseId(null)}
                  >
                    Close
                  </Button>
                </div>
                
                <CaseDetail caseId={selectedCaseId} />
              </div>
            </div>
          )}
        </div>

        {/* Welcome Message for First Time Users */}
        {!selectedCaseId && (
          <Card className="mt-8">
            <CardContent className="p-8 text-center">
              <Stethoscope className="h-16 w-16 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">Welcome to Vetelyst</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your professional veterinary consultation platform. Select a case from the queue above to begin your review, 
                or use the filters to find specific cases that match your expertise.
              </p>
              <div className="flex justify-center gap-4 mt-6">
                <Button variant="medical">
                  View All Cases
                </Button>
                <Button variant="outline">
                  Review Guidelines
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}