import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import {
  Stethoscope,
  LogOut,
  User,
  Settings,
  Activity,
  Pill,
  Syringe,
  Monitor,
  Wind,
  RotateCcw,
  Cog,
  Upload,
  Camera
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";

interface EquipmentItem {
  available: boolean;
  comments: string;
}

interface EquipmentSection {
  [key: string]: EquipmentItem;
}

interface MachineInfo {
  model: string;
  image?: File;
  imagePreview?: string;
}

interface SystemInfo {
  description: string;
  image?: File;
  imagePreview?: string;
}

export default function AnesthesiaEquipment() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get case ID or case data from navigation state
  const caseId = location.state?.caseId;
  const caseData = location.state?.caseData;

  console.log('AnesthesiaEquipment page loaded');
  console.log('Location state:', location.state);
  console.log('Case ID received:', caseId);
  console.log('Case data received:', caseData);

  // Drug sections
  const [opioids, setOpioids] = useState<EquipmentSection>({
    "Morphine": { available: false, comments: "" },
    "Methadone": { available: false, comments: "" },
    "Meperidine (Demerol)": { available: false, comments: "" },
    "Fentanyl": { available: false, comments: "" },
    "Remifentanil": { available: false, comments: "" },
    "Butorphanol": { available: false, comments: "" },
    "Buprenorphine": { available: false, comments: "" },
    "Tramadol": { available: false, comments: "" },
    "Oxycodone": { available: false, comments: "" },
    "Other": { available: false, comments: "" }
  });

  const [nsaids, setNsaids] = useState<EquipmentSection>({
    "Optalgin": { available: false, comments: "" },
    "Meloxicam": { available: false, comments: "" },
    "Previcox": { available: false, comments: "" },
    "Rimadyl": { available: false, comments: "" },
    "Other": { available: false, comments: "" }
  });

  const [sedation, setSedation] = useState<EquipmentSection>({
    "Acepromazine": { available: false, comments: "" },
    "Medetomidine (Domitor)": { available: false, comments: "" },
    "Dexmedetomidine": { available: false, comments: "" },
    "Xylazine": { available: false, comments: "" },
    "Midazolam": { available: false, comments: "" },
    "Diazepam": { available: false, comments: "" },
    "Other": { available: false, comments: "" }
  });

  const [induction, setInduction] = useState<EquipmentSection>({
    "Propofol 1%": { available: false, comments: "" },
    "Propofol 2%": { available: false, comments: "" },
    "Ketamine": { available: false, comments: "" },
    "Tiletamine-zolazepam (Zoletil/Telazol)": { available: false, comments: "" },
    "Alfaxalone": { available: false, comments: "" },
    "Thiopental": { available: false, comments: "" },
    "Etomidate": { available: false, comments: "" },
    "Other": { available: false, comments: "" }
  });

  const [anestheticGases, setAnestheticGases] = useState<EquipmentSection>({
    "Isoflurane": { available: false, comments: "" },
    "Sevoflurane": { available: false, comments: "" },
    "Other": { available: false, comments: "" }
  });

  const [localAnesthetics, setLocalAnesthetics] = useState<EquipmentSection>({
    "Lidocaine": { available: false, comments: "" },
    "Bupivacaine": { available: false, comments: "" },
    "Ropivacaine": { available: false, comments: "" },
    "EMLA": { available: false, comments: "" },
    "Other": { available: false, comments: "" }
  });

  const [supplementDrugs, setSupplementDrugs] = useState<EquipmentSection>({
    "Dopamine": { available: false, comments: "" },
    "Dobutamine": { available: false, comments: "" },
    "Phenylephrine": { available: false, comments: "" },
    "Ephedrine": { available: false, comments: "" },
    "Atropine": { available: false, comments: "" },
    "Glycopyrrolate": { available: false, comments: "" },
    "Epinephrine": { available: false, comments: "" },
    "Norepinephrine": { available: false, comments: "" },
    "Other": { available: false, comments: "" }
  });

  // Equipment sections
  const [anesthesiaMachine, setAnesthesiaMachine] = useState<MachineInfo>({
    model: "",
    image: undefined,
    imagePreview: ""
  });

  const [breathingSystem, setBreathingSystem] = useState<SystemInfo>({
    description: "",
    image: undefined,
    imagePreview: ""
  });

  const [infusionMachine, setInfusionMachine] = useState<SystemInfo>({
    description: "",
    image: undefined,
    imagePreview: ""
  });

  const [heatingSystem, setHeatingSystem] = useState<EquipmentSection>({
    "Blower": { available: false, comments: "" },
    "Heating Pad": { available: false, comments: "" },
    "Heated Infusion Set": { available: false, comments: "" },
    "None": { available: false, comments: "" },
    "Other": { available: false, comments: "" }
  });

  const [ventilator, setVentilator] = useState<{
    available: boolean;
    comments: string;
    image?: File;
    imagePreview?: string;
  }>({
    available: false,
    comments: "",
    image: undefined,
    imagePreview: ""
  });

  const [monitoring, setMonitoring] = useState<EquipmentSection>({
    "ECG": { available: false, comments: "" },
    "Capnograph": { available: false, comments: "" },
    "Pulse Ox": { available: false, comments: "" },
    "BP (Oscillometer)": { available: false, comments: "" },
    "Doppler": { available: false, comments: "" },
    "Temperature": { available: false, comments: "" },
    "Other": { available: false, comments: "" }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show loading while checking authentication
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect if no case ID and no case data
  if (!caseId && !caseData) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const updateEquipmentItem = (
    section: EquipmentSection,
    setSectionFunc: React.Dispatch<React.SetStateAction<EquipmentSection>>,
    item: string,
    available: boolean,
    comments?: string
  ) => {
    setSectionFunc(prev => ({
      ...prev,
      [item]: {
        available,
        comments: comments !== undefined ? comments : prev[item]?.comments || ""
      }
    }));
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      let finalCaseId = caseId;

      // If we have case data but no case ID, submit the case first
      if (caseData && !caseId) {
        console.log('Submitting case data first...');
        const { submitCase, createTimelineEntry } = await import('@/lib/caseSubmission');

        const result = await submitCase(caseData);

        if (result.success && result.caseId) {
          finalCaseId = result.caseId;

          // Create timeline entry
          await createTimelineEntry(
            result.caseId,
            'case_submitted',
            'Case submitted for specialist review',
            {
              filesUploaded: {
                bloodTests: caseData.bloodTestFiles?.length || 0,
                medicalRecords: caseData.medicalRecordFiles?.length || 0
              }
            }
          );

          console.log('Case submitted successfully, case ID:', result.caseId);
        } else {
          throw new Error(result.error || 'Failed to submit case');
        }
      }

      // Prepare equipment data
      const equipmentData = {
        case_id: finalCaseId,
        drugs: {
          opioids,
          nsaids,
          sedation,
          induction,
          anestheticGases,
          localAnesthetics,
          supplementDrugs
        },
        equipment: {
          anesthesiaMachine,
          breathingSystem,
          infusionMachine,
          heatingSystem,
          ventilator,
          monitoring
        },
        created_at: new Date().toISOString()
      };

      // Save equipment data to database
      const { error } = await supabase
        .from('anesthesia_equipment')
        .insert(equipmentData);

      if (error) {
        throw error;
      }

      toast({
        title: "Case Submitted Successfully!",
        description: `Your case and equipment information has been submitted for review. Case ID: ${finalCaseId}`,
      });

      // Navigate back to dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to save information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDrugSection = (
    title: string,
    icon: React.ReactNode,
    section: EquipmentSection,
    setSectionFunc: React.Dispatch<React.SetStateAction<EquipmentSection>>
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(section).map(([item, data]) => (
            <div key={item} className="space-y-3 p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${title}-${item}`}
                  checked={data.available}
                  onCheckedChange={(checked) =>
                    updateEquipmentItem(section, setSectionFunc, item, checked as boolean)
                  }
                />
                <Label htmlFor={`${title}-${item}`} className="text-sm font-medium">
                  {item}
                </Label>
              </div>
              {data.available && (
                <div className="ml-6 space-y-2">
                  <Textarea
                    placeholder="Comments..."
                    value={data.comments}
                    onChange={(e) =>
                      updateEquipmentItem(section, setSectionFunc, item, true, e.target.value)
                    }
                    className="min-h-[60px]"
                  />
                  {item === "Other" && (
                    <Input
                      placeholder="Please specify..."
                      value={data.comments}
                      onChange={(e) =>
                        updateEquipmentItem(section, setSectionFunc, item, true, e.target.value)
                      }
                      className="max-w-xs"
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderMachineSection = (
    title: string,
    icon: React.ReactNode,
    machine: MachineInfo,
    setMachine: React.Dispatch<React.SetStateAction<MachineInfo>>
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`${title}-model`}>Machine Model</Label>
          <Input
            id={`${title}-model`}
            placeholder="Enter machine model..."
            value={machine.model}
            onChange={(e) => setMachine(prev => ({ ...prev, model: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor={`${title}-image`}>Machine Image</Label>
          <div className="flex items-center gap-3">
            <Input
              id={`${title}-image`}
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const preview = await handleImageUpload(file);
                  setMachine(prev => ({ ...prev, image: file, imagePreview: preview }));
                }
              }}
            />
            <Camera className="h-5 w-5 text-muted-foreground" />
          </div>
          {machine.imagePreview && (
            <img
              src={machine.imagePreview}
              alt="Machine preview"
              className="mt-2 h-32 w-32 object-cover rounded border"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderSystemSection = (
    title: string,
    icon: React.ReactNode,
    system: SystemInfo,
    setSystem: React.Dispatch<React.SetStateAction<SystemInfo>>
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`${title}-description`}>Description</Label>
          <Input
            id={`${title}-description`}
            placeholder="Enter description..."
            value={system.description}
            onChange={(e) => setSystem(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor={`${title}-image`}>Image</Label>
          <div className="flex items-center gap-3">
            <Input
              id={`${title}-image`}
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const preview = await handleImageUpload(file);
                  setSystem(prev => ({ ...prev, image: file, imagePreview: preview }));
                }
              }}
            />
            <Camera className="h-5 w-5 text-muted-foreground" />
          </div>
          {system.imagePreview && (
            <img
              src={system.imagePreview}
              alt="System preview"
              className="mt-2 h-32 w-32 object-cover rounded border"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderVentilatorSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="h-5 w-5" />
          Ventilator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="ventilator-available"
            checked={ventilator.available}
            onCheckedChange={(checked) =>
              setVentilator(prev => ({ ...prev, available: checked as boolean }))
            }
          />
          <Label htmlFor="ventilator-available">Available</Label>
        </div>
        {ventilator.available && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="ventilator-comments">Comments</Label>
              <Textarea
                id="ventilator-comments"
                placeholder="Comments..."
                value={ventilator.comments}
                onChange={(e) =>
                  setVentilator(prev => ({ ...prev, comments: e.target.value }))
                }
                className="min-h-[60px]"
              />
            </div>
            <div>
              <Label htmlFor="ventilator-image">Ventilator Image</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="ventilator-image"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const preview = await handleImageUpload(file);
                      setVentilator(prev => ({ ...prev, image: file, imagePreview: preview }));
                    }
                  }}
                />
                <Camera className="h-5 w-5 text-muted-foreground" />
              </div>
              {ventilator.imagePreview && (
                <img
                  src={ventilator.imagePreview}
                  alt="Ventilator preview"
                  className="mt-2 h-32 w-32 object-cover rounded border"
                />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900">Vetelyst</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Clinic Equipment & Drug Inventory
            </h1>
            <p className="text-gray-600">
              Please indicate which equipment and drugs you have available in your clinic
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {caseId ? `Case ID: ${caseId}` : 'New Case - Equipment Selection'}
            </p>
          </div>

          {/* Section 1 - Drugs */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Section 1 - Drugs</h2>

            {renderDrugSection(
              "Opioids",
              <Pill className="h-5 w-5" />,
              opioids,
              setOpioids
            )}

            {renderDrugSection(
              "NSAIDs",
              <Pill className="h-5 w-5" />,
              nsaids,
              setNsaids
            )}

            {renderDrugSection(
              "Sedation",
              <Syringe className="h-5 w-5" />,
              sedation,
              setSedation
            )}

            {renderDrugSection(
              "Induction",
              <Syringe className="h-5 w-5" />,
              induction,
              setInduction
            )}

            {renderDrugSection(
              "Anesthetic Gases",
              <Wind className="h-5 w-5" />,
              anestheticGases,
              setAnestheticGases
            )}

            {renderDrugSection(
              "Local Anesthetics",
              <Pill className="h-5 w-5" />,
              localAnesthetics,
              setLocalAnesthetics
            )}

            {renderDrugSection(
              "Supplement Drugs",
              <Activity className="h-5 w-5" />,
              supplementDrugs,
              setSupplementDrugs
            )}
          </div>

          {/* Section 2 - Equipment */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Section 2 - Equipment</h2>

            {renderMachineSection(
              "Anesthetic Machine",
              <Cog className="h-5 w-5" />,
              anesthesiaMachine,
              setAnesthesiaMachine
            )}

            {renderSystemSection(
              "Breathing System",
              <Wind className="h-5 w-5" />,
              breathingSystem,
              setBreathingSystem
            )}

            {renderSystemSection(
              "Infusion Machine",
              <Syringe className="h-5 w-5" />,
              infusionMachine,
              setInfusionMachine
            )}

            {renderDrugSection(
              "Heating System",
              <Activity className="h-5 w-5" />,
              heatingSystem,
              setHeatingSystem
            )}

            {renderVentilatorSection()}

            {renderDrugSection(
              "Monitoring",
              <Monitor className="h-5 w-5" />,
              monitoring,
              setMonitoring
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
            <Button
              className="bg-gradient-primary hover:opacity-90"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Saving..." : "Save Equipment Information"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}