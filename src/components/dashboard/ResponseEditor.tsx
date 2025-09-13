import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, Send, FileText, Clock, Stethoscope } from "lucide-react";
import { format } from "date-fns";

interface ResponseEditorProps {
  caseId: string;
  onResponseSubmitted: () => void;
}

export const ResponseEditor = ({ caseId, onResponseSubmitted }: ResponseEditorProps) => {
  const [activeTab, setActiveTab] = useState("response");
  const [responseData, setResponseData] = useState({
    response_text: '',
    diagnosis: '',
    treatment_recommendations: '',
    prognosis: '',
    follow_up_needed: false,
    follow_up_date: null as Date | null,
    referral_recommendations: '',
    is_final_response: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const { toast } = useToast();

  // Response templates
  const templates = {
    anesthesia_consultation: {
      title: "Anesthesia Consultation",
      content: `ANESTHESIA CONSULTATION RESPONSE

Patient Assessment:
- ASA Physical Status Classification: [I-V]
- Anesthetic Risk Assessment: [Low/Moderate/High]

Pre-anesthetic Recommendations:
- Laboratory work: [specify tests]
- Pre-medication protocol: [medications and timing]
- Fasting requirements: [duration]

Anesthetic Protocol:
- Induction: [agents and dosages]
- Maintenance: [agents and delivery method]
- Monitoring: [required parameters]

Post-operative Care:
- Recovery monitoring: [duration and parameters]
- Pain management: [protocol]
- Potential complications: [list and management]

Additional Notes:
[Any specific concerns or modifications needed]`
    },
    surgical_consultation: {
      title: "Surgical Consultation",
      content: `SURGICAL CONSULTATION RESPONSE

Diagnosis:
[Primary and differential diagnoses]

Surgical Approach:
- Procedure: [detailed surgical plan]
- Approach: [surgical technique]
- Equipment needed: [specialized instruments]

Pre-operative Preparation:
- Patient positioning: [specific requirements]
- Surgical site preparation: [antiseptic protocol]
- Antibiotic prophylaxis: [if indicated]

Operative Considerations:
- Anatomical landmarks: [key structures]
- Potential complications: [intraoperative risks]
- Closure technique: [suture materials and pattern]

Post-operative Care:
- Monitoring requirements: [parameters and duration]
- Activity restrictions: [timeline]
- Follow-up schedule: [timing and assessments]

Prognosis:
[Expected outcome and timeline for recovery]`
    },
    general_consultation: {
      title: "General Consultation",
      content: `CONSULTATION RESPONSE

Clinical Assessment:
[Summary of findings and interpretation]

Diagnosis:
- Primary diagnosis: [main condition]
- Differential diagnoses: [alternative possibilities]
- Diagnostic confidence: [High/Moderate/Low]

Treatment Recommendations:
- Immediate treatment: [urgent interventions]
- Long-term management: [ongoing care plan]
- Medications: [specific drugs, dosages, duration]

Monitoring and Follow-up:
- Parameters to monitor: [specific measurements]
- Follow-up schedule: [timing and assessments]
- Warning signs: [when to contact immediately]

Prognosis:
[Expected outcome and timeline]

Additional Recommendations:
[Any other relevant advice or considerations]`
    }
  };

  const applyTemplate = (templateKey: string) => {
    const template = templates[templateKey];
    setResponseData(prev => ({
      ...prev,
      response_text: template.content
    }));
  };

  const submitResponse = async (asDraft = false) => {
    if (!responseData.response_text.trim()) {
      toast({
        title: "Error",
        description: "Please provide a response before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setIsDraft(asDraft);

    try {
      // Get current user's profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { error } = await supabase
        .from('case_responses')
        .insert({
          case_id: caseId,
          specialist_id: profile.id,
          response_text: responseData.response_text,
          diagnosis: responseData.diagnosis || null,
          treatment_recommendations: responseData.treatment_recommendations || null,
          prognosis: responseData.prognosis || null,
          follow_up_needed: responseData.follow_up_needed,
          follow_up_date: responseData.follow_up_date?.toISOString().split('T')[0] || null,
          referral_recommendations: responseData.referral_recommendations || null,
          is_final_response: responseData.is_final_response && !asDraft
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Response ${asDraft ? 'saved as draft' : 'submitted'} successfully.`
      });

      if (!asDraft) {
        setResponseData({
          response_text: '',
          diagnosis: '',
          treatment_recommendations: '',
          prognosis: '',
          follow_up_needed: false,
          follow_up_date: null,
          referral_recommendations: '',
          is_final_response: false
        });
        onResponseSubmitted();
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setIsDraft(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Professional Response
          </CardTitle>
          <div className="flex gap-2">
            <Select onValueChange={applyTemplate}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Use template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anesthesia_consultation">Anesthesia Consultation</SelectItem>
                <SelectItem value="surgical_consultation">Surgical Consultation</SelectItem>
                <SelectItem value="general_consultation">General Consultation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="response">Response</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="follow-up">Follow-up</TabsTrigger>
          </TabsList>

          <TabsContent value="response" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="response">Professional Response</Label>
              <Textarea
                id="response"
                placeholder="Provide your professional consultation response..."
                value={responseData.response_text}
                onChange={(e) => setResponseData(prev => ({ ...prev, response_text: e.target.value }))}
                className="min-h-[300px] font-mono text-sm"
              />
              <div className="text-xs text-muted-foreground">
                Use professional medical terminology. This response will be shared with the referring veterinarian.
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                placeholder="Primary diagnosis and differential diagnoses..."
                value={responseData.diagnosis}
                onChange={(e) => setResponseData(prev => ({ ...prev, diagnosis: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="treatment">Treatment Recommendations</Label>
              <Textarea
                id="treatment"
                placeholder="Detailed treatment plan and recommendations..."
                value={responseData.treatment_recommendations}
                onChange={(e) => setResponseData(prev => ({ ...prev, treatment_recommendations: e.target.value }))}
                className="min-h-[200px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prognosis">Prognosis</Label>
              <Textarea
                id="prognosis"
                placeholder="Expected outcome and timeline for recovery..."
                value={responseData.prognosis}
                onChange={(e) => setResponseData(prev => ({ ...prev, prognosis: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referrals">Referral Recommendations</Label>
              <Textarea
                id="referrals"
                placeholder="Recommendations for additional specialists or facilities..."
                value={responseData.referral_recommendations}
                onChange={(e) => setResponseData(prev => ({ ...prev, referral_recommendations: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="follow-up" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="follow-up"
                checked={responseData.follow_up_needed}
                onCheckedChange={(checked) => 
                  setResponseData(prev => ({ ...prev, follow_up_needed: !!checked }))
                }
              />
              <Label htmlFor="follow-up">Follow-up required</Label>
            </div>

            {responseData.follow_up_needed && (
              <div className="space-y-2">
                <Label>Follow-up Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {responseData.follow_up_date ? 
                        format(responseData.follow_up_date, "PPP") : 
                        "Select follow-up date"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={responseData.follow_up_date}
                      onSelect={(date) => setResponseData(prev => ({ ...prev, follow_up_date: date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="final-response"
                checked={responseData.is_final_response}
                onCheckedChange={(checked) => 
                  setResponseData(prev => ({ ...prev, is_final_response: !!checked }))
                }
              />
              <Label htmlFor="final-response">Mark as final response</Label>
              {responseData.is_final_response && (
                <Badge variant="secondary">Final</Badge>
              )}
            </div>

            <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-blue-500" />
                <div>
                  <div className="font-medium">Professional Response Guidelines</div>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Provide clear, evidence-based recommendations</li>
                    <li>• Include specific protocols and dosages when appropriate</li>
                    <li>• Consider follow-up requirements and monitoring</li>
                    <li>• Mark as final response when consultation is complete</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Response will be sent to the referring veterinarian and added to the case record.
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => submitResponse(true)}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isDraft ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button 
              variant="medical"
              onClick={() => submitResponse(false)}
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting && !isDraft ? 'Submitting...' : 'Submit Response'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};