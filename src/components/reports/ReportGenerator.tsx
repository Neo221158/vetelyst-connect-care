import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Download, 
  Send, 
  Save, 
  Eye, 
  Printer,
  Shield,
  Mail,
  Clock
} from "lucide-react";
import { PDFDownloadLink, BlobProvider } from '@react-pdf/renderer';
import { ConsultationReportTemplate } from './ConsultationReportTemplate';

interface ReportGeneratorProps {
  caseId: string;
  caseData: any;
  onReportGenerated?: () => void;
}

export const ReportGenerator = ({ caseId, caseData, onReportGenerated }: ReportGeneratorProps) => {
  const [reportData, setReportData] = useState({
    report_type: 'consultation' as const,
    title: `Consultation Report - ${caseData?.patient_name}`,
    clinical_summary: '',
    diagnosis_details: {
      primary: '',
      differential: '',
      confidence: 'high'
    },
    treatment_recommendations: '',
    prognosis_assessment: '',
    follow_up_instructions: '',
    disclaimer_text: '',
    watermark_applied: true,
    security_settings: {
      prevent_editing: true,
      prevent_copying: false,
      require_password: false
    }
  });

  const [specialist, setSpecialist] = useState(null);
  const [letterhead, setLetterhead] = useState(null);
  const [reportNumber, setReportNumber] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const { toast } = useToast();

  useEffect(() => {
    fetchSpecialistData();
    generateReportNumber();
  }, []);

  const fetchSpecialistData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get specialist profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setSpecialist(profile);

        // Get letterhead
        const { data: letterheadData } = await supabase
          .from('specialist_letterheads')
          .select('*')
          .eq('specialist_id', profile.id)
          .eq('is_active', true)
          .order('is_default', { ascending: false })
          .limit(1)
          .single();

        setLetterhead(letterheadData);
      }
    } catch (error) {
      console.error('Error fetching specialist data:', error);
    }
  };

  const generateReportNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_report_number');
      if (error) throw error;
      setReportNumber(data);
    } catch (error) {
      console.error('Error generating report number:', error);
      // Fallback to timestamp-based number
      setReportNumber(`VET-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`);
    }
  };

  const handleSaveDraft = async () => {
    if (!specialist) return;

    try {
      const { error } = await supabase
        .from('case_reports')
        .upsert({
          case_id: caseId,
          specialist_id: specialist.id,
          report_number: reportNumber,
          ...reportData,
          report_status: 'draft'
        });

      if (error) throw error;

      toast({
        title: "Draft Saved",
        description: "Report draft has been saved successfully."
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive"
      });
    }
  };

  const generatePDF = async () => {
    if (!specialist || !letterhead) {
      toast({
        title: "Error",
        description: "Specialist profile and letterhead required.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const reportDataForPDF = {
        reportNumber,
        caseData,
        specialist,
        letterhead,
        clinicalSummary: reportData.clinical_summary,
        diagnosis: reportData.diagnosis_details,
        treatmentRecommendations: reportData.treatment_recommendations,
        prognosis: reportData.prognosis_assessment,
        followUpInstructions: reportData.follow_up_instructions
      };

      // Save report to database
      const { data: savedReport, error } = await supabase
        .from('case_reports')
        .upsert({
          case_id: caseId,
          specialist_id: specialist.id,
          report_number: reportNumber,
          ...reportData,
          report_status: 'generated',
          generated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Report Generated",
        description: `Report ${reportNumber} has been generated successfully.`
      });

      onReportGenerated?.();
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendReportEmail = async () => {
    if (!caseData?.referring_vet?.email) {
      toast({
        title: "Error",
        description: "Referring veterinarian email not available.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    try {
      // Call edge function to send email
      const { error } = await supabase.functions.invoke('send-report-email', {
        body: {
          reportNumber,
          recipientEmail: caseData.referring_vet.email,
          recipientName: `Dr. ${caseData.referring_vet.first_name} ${caseData.referring_vet.last_name}`,
          caseId,
          patientName: caseData.patient_name
        }
      });

      if (error) throw error;

      // Update report status
      await supabase
        .from('case_reports')
        .update({
          report_status: 'sent',
          email_sent_at: new Date().toISOString(),
          email_recipients: [caseData.referring_vet.email],
          email_status: 'sent'
        })
        .eq('case_id', caseId)
        .eq('report_number', reportNumber);

      toast({
        title: "Report Sent",
        description: "Report has been sent to the referring veterinarian."
      });
    } catch (error) {
      console.error('Error sending report:', error);
      toast({
        title: "Error",
        description: "Failed to send report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const reportDataForPDF = {
    reportNumber,
    caseData,
    specialist,
    letterhead,
    clinicalSummary: reportData.clinical_summary,
    diagnosis: reportData.diagnosis_details,
    treatmentRecommendations: reportData.treatment_recommendations,
    prognosis: reportData.prognosis_assessment,
    followUpInstructions: reportData.follow_up_instructions
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Consultation Report Generator
            </CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline">Report #{reportNumber}</Badge>
              <Badge variant="secondary">{reportData.report_type}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            {specialist && letterhead && (
              <BlobProvider document={<ConsultationReportTemplate data={reportDataForPDF} />}>
                {({ blob, url, loading }) => (
                  <Button variant="outline" size="sm" disabled={loading}>
                    <Eye className="h-4 w-4 mr-2" />
                    {loading ? 'Loading...' : 'Preview'}
                  </Button>
                )}
              </BlobProvider>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Report Title</Label>
              <Input
                id="title"
                value={reportData.title}
                onChange={(e) => setReportData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Report Type</Label>
              <Select 
                value={reportData.report_type} 
                onValueChange={(value: any) => setReportData(prev => ({ ...prev, report_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="second_opinion">Second Opinion</SelectItem>
                  <SelectItem value="emergency_response">Emergency Response</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinical-summary">Clinical Summary</Label>
              <Textarea
                id="clinical-summary"
                placeholder="Summarize the clinical review and assessment..."
                value={reportData.clinical_summary}
                onChange={(e) => setReportData(prev => ({ ...prev, clinical_summary: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatment">Treatment Recommendations</Label>
              <Textarea
                id="treatment"
                placeholder="Detailed treatment recommendations and protocols..."
                value={reportData.treatment_recommendations}
                onChange={(e) => setReportData(prev => ({ ...prev, treatment_recommendations: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prognosis">Prognosis Assessment</Label>
              <Textarea
                id="prognosis"
                placeholder="Prognosis and expected outcomes..."
                value={reportData.prognosis_assessment}
                onChange={(e) => setReportData(prev => ({ ...prev, prognosis_assessment: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="followup">Follow-up Instructions</Label>
              <Textarea
                id="followup"
                placeholder="Follow-up care instructions and recommendations..."
                value={reportData.follow_up_instructions}
                onChange={(e) => setReportData(prev => ({ ...prev, follow_up_instructions: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="diagnosis" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primary-diagnosis">Primary Diagnosis</Label>
              <Input
                id="primary-diagnosis"
                placeholder="Primary diagnosis..."
                value={reportData.diagnosis_details.primary}
                onChange={(e) => setReportData(prev => ({
                  ...prev,
                  diagnosis_details: { ...prev.diagnosis_details, primary: e.target.value }
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="differential">Differential Diagnoses</Label>
              <Textarea
                id="differential"
                placeholder="List differential diagnoses..."
                value={reportData.diagnosis_details.differential}
                onChange={(e) => setReportData(prev => ({
                  ...prev,
                  diagnosis_details: { ...prev.diagnosis_details, differential: e.target.value }
                }))}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Diagnostic Confidence</Label>
              <Select 
                value={reportData.diagnosis_details.confidence} 
                onValueChange={(value) => setReportData(prev => ({
                  ...prev,
                  diagnosis_details: { ...prev.diagnosis_details, confidence: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Confidence</SelectItem>
                  <SelectItem value="moderate">Moderate Confidence</SelectItem>
                  <SelectItem value="low">Low Confidence</SelectItem>
                  <SelectItem value="tentative">Tentative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={reportData.watermark_applied}
                  onCheckedChange={(checked) => 
                    setReportData(prev => ({ ...prev, watermark_applied: !!checked }))
                  }
                />
                <Label>Apply Vetelyst watermark</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={reportData.security_settings.prevent_editing}
                  onCheckedChange={(checked) => 
                    setReportData(prev => ({
                      ...prev,
                      security_settings: { ...prev.security_settings, prevent_editing: !!checked }
                    }))
                  }
                />
                <Label>Prevent unauthorized editing</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={reportData.security_settings.prevent_copying}
                  onCheckedChange={(checked) => 
                    setReportData(prev => ({
                      ...prev,
                      security_settings: { ...prev.security_settings, prevent_copying: !!checked }
                    }))
                  }
                />
                <Label>Prevent text copying</Label>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-amber-800">Security Notice</div>
                    <div className="text-sm text-amber-700 mt-1">
                      Reports are automatically secured with digital signatures and audit trails. 
                      Additional security settings help protect sensitive medical information.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-medium text-blue-800 mb-2">Delivery Information</div>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>Report will be sent to: <strong>{caseData?.referring_vet?.email}</strong></div>
                  <div>Recipient: Dr. {caseData?.referring_vet?.first_name} {caseData?.referring_vet?.last_name}</div>
                  <div>Clinic: {caseData?.referring_vet?.clinic_name}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Reports are typically delivered within 2-5 minutes
                </span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Report will include digital signature and professional letterhead
          </div>
          <div className="flex gap-2">
            {specialist && letterhead && (
              <PDFDownloadLink
                document={<ConsultationReportTemplate data={reportDataForPDF} />}
                fileName={`${reportNumber}-${caseData?.patient_name}-consultation.pdf`}
              >
                {({ loading }) => (
                  <Button variant="outline" disabled={loading}>
                    <Download className="h-4 w-4 mr-2" />
                    {loading ? 'Preparing...' : 'Download PDF'}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
            
            <Button onClick={generatePDF} disabled={isGenerating}>
              <FileText className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
            
            <Button variant="medical" onClick={sendReportEmail} disabled={isSending}>
              <Mail className="h-4 w-4 mr-2" />
              {isSending ? 'Sending...' : 'Send Report'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};