import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Stethoscope,
  LogOut,
  User,
  Settings,
  Search,
  FileText,
  Camera,
  Bot,
  CheckCircle,
  Clock,
  Activity,
  Download,
  Eye,
  ZoomIn,
  MessageSquare,
  Pill,
  TestTube,
  Monitor,
  Wind
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface CaseData {
  id: string;
  patient_name: string;
  species: string;
  breed: string;
  age_years: number;
  age_months: number;
  weight: number;
  sex: string;
  spay_neuter_status: string;
  chief_complaint: string;
  history_of_present_illness: string;
  temperature: number;
  pulse: number;
  respiration: number;
  body_condition_score: number;
  mucous_membranes: string;
  capillary_refill_time: string;
  hydration_status: string;
  lymph_nodes: string;
  heart_murmur: boolean;
  heart_murmur_grade: string;
  medications: any[];
  uploaded_files: any[];
  physical_exam_findings: any;
  anesthesia_equipment: any;
  submitted_at: string;
  status: string;
}

interface ImageModalProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImageModal = ({ src, alt, isOpen, onClose }: ImageModalProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-4xl max-h-[90vh] p-2">
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
      </div>
    </DialogContent>
  </Dialog>
);

export default function SummaryDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Get case data from navigation state if available
  const navigationCaseData = location.state?.caseData;

  // Debug logging
  console.log('SummaryDashboard - Navigation case data:', navigationCaseData);
  console.log('SummaryDashboard - Database case data:', caseData);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  useEffect(() => {
    // Only fetch from database if we don't have navigation state data
    if (user && !navigationCaseData) {
      fetchLatestCase();
    }
  }, [user, navigationCaseData]);

  const fetchLatestCase = async () => {
    try {
      console.log('Fetching latest case for user:', user?.id);

      // First try to get case for current user
      let { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          anesthesia_equipment(*)
        `)
        .eq('referring_vet_id', user?.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single();

      console.log('User-specific case query result:', { data, error });

      // If no case found for current user, try to get any recent case (for debugging)
      if ((error && error.code === 'PGRST116') || !data) {
        console.log('No case found for current user, trying to get any recent case...');

        const { data: anyData, error: anyError } = await supabase
          .from('cases')
          .select(`
            *,
            anesthesia_equipment(*)
          `)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .single();

        console.log('Any recent case query result:', { data: anyData, error: anyError });

        if (anyData && !anyError) {
          console.log('Found recent case from different user, using it for demo');
          data = anyData;
          error = anyError;
        }
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Database error:', error);
        throw error;
      }

      if (data) {
        console.log('Case found:', data);
        setCaseData(data);
      } else {
        console.log('No case data found');
        setCaseData(null);
      }
    } catch (error) {
      console.error('Error fetching case:', error);
      setCaseData(null);
    }
  };

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;

    setIsLoadingAi(true);
    // Placeholder for AI integration
    setTimeout(() => {
      setAiResponse(`AI response for: "${aiQuery}" will be integrated here. This is a placeholder response showing how the AI agent will analyze the medical records and provide insights.`);
      setIsLoadingAi(false);
    }, 2000);
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

  // Demo mode - show sample data for testing
  const demoMode = false;

  // Demo data for testing the dashboard
  const demoData = {
    id: "demo-case-123",
    patient_name: "Buddy",
    species: "dog",
    breed: "Golden Retriever",
    age_years: 5,
    age_months: 3,
    weight: 28.5,
    sex: "male",
    spay_neuter_status: "neutered",
    chief_complaint: "Lethargy and decreased appetite for 3 days",
    history_of_present_illness: "Owner reports that Buddy has been less active than usual, eating only half his normal portions, and seems to be uncomfortable when moving around.",
    temperature: 39.2,
    pulse: 110,
    respiration: 24,
    body_condition_score: 5,
    mucous_membranes: "pink",
    capillary_refill_time: "< 2 seconds",
    hydration_status: "normal",
    lymph_nodes: "normal",
    heart_murmur: false,
    heart_murmur_grade: "",
    medications: [
      { drugName: "Carprofen", dose: "2.2", unit: "mg/kg" },
      { drugName: "Gabapentin", dose: "10", unit: "mg/kg" }
    ],
    uploaded_files: [
      {
        name: "blood_work_results.pdf",
        type: "application/pdf",
        url: "https://example.com/sample.pdf"
      },
      {
        name: "xray_chest.jpg",
        type: "image/jpeg",
        url: "https://picsum.photos/400/300?random=1"
      },
      {
        name: "ultrasound_abdomen.jpg",
        type: "image/jpeg",
        url: "https://picsum.photos/400/300?random=2"
      }
    ],
    physical_exam_findings: {
      cardiovascular: { hasIssues: false, notes: "Regular rhythm, no murmur detected" },
      respiratory: { hasIssues: true, notes: "Mild increase in respiratory effort" },
      neurological: { hasIssues: false, notes: "Alert and responsive, normal reflexes" },
      musculoskeletal: { hasIssues: true, notes: "Mild stiffness in rear limbs" },
      gastrointestinal: { hasIssues: false, notes: "Soft, non-painful abdomen" },
      urogenital: { hasIssues: false, notes: "Normal external genitalia" }
    },
    anesthesia_equipment: {
      monitoring: {
        pulse_oximeter: { available: true, comments: "Working properly" },
        ecg: { available: true, comments: "5-lead available" },
        blood_pressure: { available: false, comments: "Under repair" }
      },
      anesthesia_machine: {
        isoflurane: { available: true, comments: "Full vaporizer" },
        sevoflurane: { available: false, comments: "Not available" }
      }
    },
    submitted_at: "2025-09-18T09:30:00Z",
    status: "submitted"
  };

  // Use data priority: navigation state > database > demo data
  const displayData = navigationCaseData || caseData || (demoMode ? demoData : null);

  if (!displayData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Stethoscope className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">Vetelyst</span>
                <Badge variant="secondary" className="text-xs">Summary Dashboard</Badge>
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
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Case Data Found</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                It looks like you haven't submitted any cases yet, or there might be a loading issue.
                Try refreshing the data or submit a new case to see the summary dashboard.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={fetchLatestCase}>
                  Refresh Data
                </Button>
                <Button onClick={() => navigate('/dashboard')}>
                  Submit New Case
                </Button>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>User ID: {user?.id}</p>
                <p>If you just submitted a case, try clicking "Refresh Data"</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Organize checkbox data from physical exam findings
  const organizeCheckboxData = (findings: any) => {
    if (!findings) return {};

    const organized: any = {};
    Object.entries(findings).forEach(([system, data]: [string, any]) => {
      if (typeof data === 'object' && data !== null) {
        organized[system] = {
          hasIssues: data.hasIssues || false,
          notes: data.notes || '',
          ...data
        };
      }
    });
    return organized;
  };

  const checkboxData = organizeCheckboxData(displayData?.physical_exam_findings);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">Vetelyst</span>
              <Badge variant="secondary" className="text-xs">Case Summary</Badge>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant={displayData.status === 'submitted' ? 'default' : 'secondary'}>
                {displayData.status.replace('_', ' ').toUpperCase()}
              </Badge>

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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Case Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            Case Summary: {displayData.patient_name}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Submitted: {new Date(displayData.submitted_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Case ID: {displayData.id.slice(0, 8)}
            </span>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Patient Overview</TabsTrigger>
            <TabsTrigger value="examination">Physical Exam</TabsTrigger>
            <TabsTrigger value="media">Images & Documents</TabsTrigger>
            <TabsTrigger value="equipment">Equipment & Drugs</TabsTrigger>
            <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
          </TabsList>

          {/* Patient Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Signalment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Patient Signalment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="font-semibold">{displayData.patient_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Species</label>
                      <p className="font-semibold capitalize">{displayData.species}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Breed</label>
                      <p className="font-semibold">{displayData.breed}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Age</label>
                      <p className="font-semibold">{displayData.age_years}y {displayData.age_months}m</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Weight</label>
                      <p className="font-semibold">{displayData.weight} kg</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Sex</label>
                      <p className="font-semibold capitalize">{displayData.sex} ({displayData.spay_neuter_status})</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vital Signs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Vital Signs (TPR)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <label className="text-sm font-medium text-muted-foreground">Temperature</label>
                      <p className="text-2xl font-bold text-blue-600">{displayData.temperature}°C</p>
                    </div>
                    <div className="text-center">
                      <label className="text-sm font-medium text-muted-foreground">Pulse</label>
                      <p className="text-2xl font-bold text-green-600">{displayData.pulse} bpm</p>
                    </div>
                    <div className="text-center">
                      <label className="text-sm font-medium text-muted-foreground">Respiration</label>
                      <p className="text-2xl font-bold text-purple-600">{displayData.respiration} rpm</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Body Condition Score</label>
                      <p className="font-semibold">{displayData.body_condition_score}/9</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Mucous Membranes</label>
                      <p className="font-semibold capitalize">{displayData.mucous_membranes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chief Complaint & History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Chief Complaint</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{displayData.chief_complaint}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>History of Present Illness</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{displayData.history_of_present_illness}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Physical Examination Tab */}
          <TabsContent value="examination" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Physical Examination Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(checkboxData).map(([system, data]: [string, any]) => (
                    <Card key={system} className={`border ${data.hasIssues ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium capitalize">{system.replace(/_/g, ' ')}</h4>
                          <Badge variant={data.hasIssues ? 'destructive' : 'default'}>
                            {data.hasIssues ? 'Issues Found' : 'Normal'}
                          </Badge>
                        </div>
                      </CardHeader>
                      {data.notes && (
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground">{data.notes}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Medications */}
            {displayData.medications && displayData.medications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Current Medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayData.medications.map((med: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <h4 className="font-medium">{med.drugName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {med.dose} {med.unit}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            {/* Images Gallery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Uploaded Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                {displayData.uploaded_files?.filter(file => file.type?.startsWith('image/')).length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {displayData.uploaded_files
                      .filter(file => file.type?.startsWith('image/'))
                      .map((file: any, index: number) => (
                        <div key={index} className="relative group cursor-pointer">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-32 object-cover rounded-lg border"
                            onClick={() => setSelectedImage({ src: file.url, alt: file.name })}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-lg transition-all">
                            <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 truncate">{file.name}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No images uploaded</p>
                )}
              </CardContent>
            </Card>

            {/* PDF Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Medical Records (PDFs)
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search in documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {displayData.uploaded_files?.filter(file => file.type === 'application/pdf').length > 0 ? (
                  <div className="space-y-4">
                    {displayData.uploaded_files
                      .filter(file => file.type === 'application/pdf')
                      .map((file: any, index: number) => (
                        <Card key={index} className="border">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{file.name}</h4>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-64 w-full border rounded">
                              <div className="p-4">
                                <iframe
                                  src={file.url}
                                  className="w-full h-64"
                                  title={file.name}
                                />
                              </div>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No PDF documents uploaded</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Equipment & Drugs Tab */}
          <TabsContent value="equipment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Anesthesia Equipment & Drugs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {displayData.anesthesia_equipment ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(displayData.anesthesia_equipment).map(([category, items]: [string, any]) => {
                      if (typeof items === 'object' && items !== null) {
                        return (
                          <Card key={category} className="border">
                            <CardHeader className="pb-2">
                              <h4 className="font-medium capitalize">{category.replace(/_/g, ' ')}</h4>
                            </CardHeader>
                            <CardContent>
                              {Object.entries(items).map(([item, data]: [string, any]) => (
                                <div key={item} className="flex items-center justify-between py-1">
                                  <span className="text-sm">{item.replace(/_/g, ' ')}</span>
                                  <Badge variant={data?.available ? 'default' : 'secondary'}>
                                    {data?.available ? 'Available' : 'Not Available'}
                                  </Badge>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        );
                      }
                      return null;
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No equipment information available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant" className="space-y-6">
            {/* AI Summary Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Medical Record Summary
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Automated analysis and summary of the complete medical record
                </p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full border rounded-lg p-4 bg-blue-50">
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">📋 Patient Overview:</h4>
                      <ul className="space-y-1 text-blue-700">
                        <li><strong>Name:</strong> {displayData.patient_name}</li>
                        <li><strong>Species:</strong> {displayData.species}</li>
                        <li><strong>Breed:</strong> {displayData.breed}</li>
                        <li><strong>Age:</strong> {displayData.age_years} years, {displayData.age_months} months</li>
                        <li><strong>Weight:</strong> {displayData.weight} kg</li>
                        <li><strong>Sex:</strong> {displayData.sex} ({displayData.spay_neuter_status})</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">🩺 Clinical Presentation:</h4>
                      <p className="text-blue-700 mb-2"><strong>Chief Complaint:</strong> {displayData.chief_complaint}</p>
                      <p className="text-blue-700"><strong>History:</strong> {displayData.history_of_present_illness}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">📊 Vital Signs & Physical Exam:</h4>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-white p-2 rounded border">
                          <div className="text-xs text-gray-600">Temperature</div>
                          <div className="font-semibold text-blue-800">{displayData.temperature}°C</div>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <div className="text-xs text-gray-600">Pulse</div>
                          <div className="font-semibold text-blue-800">{displayData.pulse} bpm</div>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <div className="text-xs text-gray-600">Respiration</div>
                          <div className="font-semibold text-blue-800">{displayData.respiration} rpm</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-medium text-blue-800">Physical Examination Findings:</h5>
                        {Object.entries(checkboxData).map(([system, data]: [string, any]) => (
                          <div key={system} className="flex items-start gap-2">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${data.hasIssues ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                            <div>
                              <span className="font-medium capitalize">{system.replace(/_/g, ' ')}:</span>
                              <span className={`ml-2 ${data.hasIssues ? 'text-yellow-700' : 'text-green-700'}`}>
                                {data.hasIssues ? 'Abnormal findings' : 'Normal'}
                              </span>
                              {data.notes && <div className="text-xs text-gray-600 mt-1">{data.notes}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {displayData.medications && displayData.medications.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-2">💊 Current Medications:</h4>
                        <ul className="space-y-1">
                          {displayData.medications.map((med: any, index: number) => (
                            <li key={index} className="text-blue-700">
                              <strong>{med.drugName}:</strong> {med.dose} {med.unit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">🔬 Diagnostic Summary:</h4>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-blue-700 text-sm">
                          Based on the clinical presentation and physical examination findings, this case shows:
                        </p>
                        <ul className="list-disc list-inside mt-2 text-blue-700 text-sm space-y-1">
                          <li>Primary concern: {displayData.chief_complaint}</li>
                          <li>Temperature: {displayData.temperature > 39.0 ? 'Elevated (fever)' : 'Normal range'}</li>
                          <li>Cardiovascular: {checkboxData.cardiovascular?.hasIssues ? 'Abnormal findings noted' : 'No abnormalities detected'}</li>
                          <li>Respiratory: {checkboxData.respiratory?.hasIssues ? 'Respiratory compromise present' : 'Normal respiratory function'}</li>
                          <li>Additional systems requiring attention: {Object.entries(checkboxData).filter(([,data]: [string, any]) => data.hasIssues).map(([system]) => system.replace(/_/g, ' ')).join(', ') || 'None'}</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">📋 Clinical Recommendations:</h4>
                      <div className="bg-white p-3 rounded border">
                        <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
                          <li>Continue monitoring vital signs and clinical progression</li>
                          <li>Follow medication protocols as prescribed</li>
                          <li>Consider additional diagnostics based on system abnormalities</li>
                          <li>Monitor for improvement or deterioration in clinical status</li>
                          <li>Schedule appropriate follow-up examinations</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* AI Chat Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Ask AI Assistant
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ask specific questions about the medical records and get detailed answers
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question about the medical records..."
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAiQuery()}
                    className="flex-1"
                  />
                  <Button onClick={handleAiQuery} disabled={isLoadingAi || !aiQuery.trim()}>
                    {isLoadingAi ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {aiResponse && (
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">AI Assistant Response</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-green-700">{aiResponse}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
                  <p className="font-medium mb-1">Integration Ready:</p>
                  <p>The AI assistant interface is ready for your external AI platform integration. The summary above will be automatically generated from the medical records, and the chat interface will connect to your AI service.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          src={selectedImage.src}
          alt={selectedImage.alt}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}