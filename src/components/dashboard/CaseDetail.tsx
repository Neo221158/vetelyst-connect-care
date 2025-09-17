import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { DocumentViewer } from "./DocumentViewer";
import { ResponseEditor } from "./ResponseEditor";
import { CaseTimeline } from "./CaseTimeline";
import { ReportGenerator } from "@/components/reports/ReportGenerator";
import { 
  ChevronDown, 
  ChevronUp, 
  Stethoscope, 
  Heart, 
  Brain, 
  Activity,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertTriangle,
  User
} from "lucide-react";
import { format } from "date-fns";

interface CaseDetailProps {
  caseId: string;
}

export const CaseDetail = ({ caseId }: CaseDetailProps) => {
  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [responses, setResponses] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchCaseData();
    fetchDocuments();
    fetchResponses();
    fetchTimeline();
  }, [caseId]);

  const fetchCaseData = async () => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          referring_vet:profiles!referring_vet_id(
            first_name,
            last_name,
            clinic_name,
            phone
          ),
          specialist:profiles!specialist_id(
            first_name,
            last_name,
            specialty_area
          )
        `)
        .eq('id', caseId)
        .single();
      
      if (error) throw error;
      setCaseData(data);
    } catch (error) {
      console.error('Error fetching case:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('case_documents')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('case_responses')
        .select(`
          *,
          specialist:profiles!specialist_id(
            first_name,
            last_name,
            specialty_area
          )
        `)
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
  };

  const fetchTimeline = async () => {
    try {
      const { data, error } = await supabase
        .from('case_timeline')
        .select(`
          *,
          actor:profiles!actor_id(
            first_name,
            last_name,
            role
          )
        `)
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTimeline(data || []);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    }
  };

  const updateCaseStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from('cases')
        .update({ 
          status: status as any,
          ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {})
        })
        .eq('id', caseId);
      
      if (error) throw error;
      fetchCaseData();
      fetchTimeline();
    } catch (error) {
      console.error('Error updating case status:', error);
    }
  };

  if (loading || !caseData) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <div className="text-center">Loading case details...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const medicalHistory = caseData.medical_history || {};
  const vitalSigns = caseData.vital_signs || {};

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{caseData.patient_name}</h1>
                <Badge variant={caseData.urgency === 'emergency' ? 'destructive' : caseData.urgency === 'urgent' ? 'secondary' : 'outline'}>
                  {caseData.urgency}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {caseData.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Stethoscope className="h-4 w-4" />
                  {caseData.species} • {caseData.breed}
                </span>
                <span>
                  Age: {caseData.age_years}y {caseData.age_months}m
                </span>
                <span>
                  Weight: {caseData.weight_kg}kg
                </span>
                {caseData.severity_score && (
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    Severity: {caseData.severity_score}/10
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {caseData.status === 'reviewing' && (
                <Button onClick={() => updateCaseStatus('in_progress')}>
                  Start Review
                </Button>
              )}
              {caseData.status === 'in_progress' && (
                <Button variant="medical" onClick={() => updateCaseStatus('completed')}>
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="clinical">Clinical</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="response">Response</TabsTrigger>
                <TabsTrigger value="report">Report</TabsTrigger>
              </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Chief Complaint</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{caseData.chief_complaint}</p>
                  {caseData.surgery_type && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Surgery Type</h4>
                      <p className="text-sm text-muted-foreground">{caseData.surgery_type}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Presenting Complaint</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{caseData.presenting_complaint}</p>
                </CardContent>
              </Card>

              {caseData.questions_for_specialist && (
                <Card>
                  <CardHeader>
                    <CardTitle>Questions for Specialist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{caseData.questions_for_specialist}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="clinical" className="space-y-4">
              {/* Medical History */}
              <Card>
                <CardHeader>
                  <CardTitle>Medical History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries({
                    'heart': { icon: Heart, label: 'Cardiovascular' },
                    'lungs': { icon: Activity, label: 'Respiratory' },
                    'neurological': { icon: Brain, label: 'Neurological' },
                    'hepatic': { icon: FileText, label: 'Hepatic' },
                    'renal': { icon: FileText, label: 'Renal' }
                  }).map(([key, { icon: Icon, label }]: [string, any]) => (
                    <Collapsible key={key}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border hover:bg-accent">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{label}</span>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 py-2">
                        <p className="text-sm text-muted-foreground">
                          {medicalHistory[key] || 'No significant history reported'}
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </CardContent>
              </Card>

              {/* Physical Examination */}
              {caseData.physical_examination && (
                <Card>
                  <CardHeader>
                    <CardTitle>Physical Examination</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{caseData.physical_examination}</p>
                  </CardContent>
                </Card>
              )}

              {/* Vital Signs */}
              {Object.keys(vitalSigns).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Vital Signs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(vitalSigns).map(([key, value]: [string, any]) => (
                        <div key={key}>
                          <span className="text-sm font-medium capitalize">{key.replace('_', ' ')}: </span>
                          <span className="text-sm">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                    {caseData.body_condition_score && (
                      <div className="mt-4">
                        <span className="text-sm font-medium">Body Condition Score: </span>
                        <span className="text-sm">{caseData.body_condition_score}/9</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Diagnostic Results */}
              {caseData.diagnostic_results && (
                <Card>
                  <CardHeader>
                    <CardTitle>Diagnostic Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{caseData.diagnostic_results}</p>
                  </CardContent>
                </Card>
              )}

              {/* Diagnosis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseData.working_diagnosis && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Working Diagnosis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{caseData.working_diagnosis}</p>
                    </CardContent>
                  </Card>
                )}

                {caseData.differential_diagnoses && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Differential Diagnoses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{caseData.differential_diagnoses}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="documents">
              <DocumentViewer documents={documents} caseId={caseId} />
            </TabsContent>

            <TabsContent value="response">
              <ResponseEditor 
                caseId={caseId} 
                onResponseSubmitted={() => {
                  fetchResponses();
                  fetchTimeline();
                }} 
              />
              
              {/* Previous Responses */}
              {responses.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Previous Responses</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {responses.map((response) => (
                      <div key={response.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            Dr. {response.specialist?.first_name} {response.specialist?.last_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(response.created_at), 'MMM d, yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm">{response.response_text}</p>
                        {response.is_final_response && (
                          <Badge variant="secondary" className="mt-2">Final Response</Badge>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="report">
              <ReportGenerator 
                caseId={caseId} 
                caseData={caseData}
                onReportGenerated={() => {
                  fetchCaseData();
                  fetchTimeline();
                }} 
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Referring Vet Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Referring Veterinarian
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-medium">
                  Dr. {caseData.referring_vet?.first_name} {caseData.referring_vet?.last_name}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {caseData.referring_vet?.clinic_name}
                </div>
              </div>
              {caseData.referring_vet?.phone && (
                <Button variant="outline" size="sm" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Call: {caseData.referring_vet.phone}
                </Button>
              )}
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Submitted: {format(new Date(caseData.submitted_at), 'MMM d, yyyy HH:mm')}
              </div>
            </CardContent>
          </Card>

          {/* Case Timeline */}
          <CaseTimeline timeline={timeline} />

          {/* Case Management */}
          <Card>
            <CardHeader>
              <CardTitle>Case Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {caseData.complexity_rating && (
                <div>
                  <span className="text-sm font-medium">Complexity: </span>
                  <span className="text-sm">{caseData.complexity_rating}/5</span>
                </div>
              )}
              {caseData.estimated_hours && (
                <div>
                  <span className="text-sm font-medium">Estimated Hours: </span>
                  <span className="text-sm">{caseData.estimated_hours}</span>
                </div>
              )}
              <Separator />
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  Request Additional Info
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Schedule Follow-up
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};