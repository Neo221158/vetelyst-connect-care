import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  Cog
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EquipmentSection {
  [key: string]: {
    selected: boolean;
    otherText?: string;
  };
}

export default function AnesthesiaEquipment() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get case ID from navigation state
  const caseId = location.state?.caseId;

  // Sedation/Premedication Drugs
  const [sedationDrugs, setSedationDrugs] = useState<EquipmentSection>({
    "Acepromazine (ACP)": { selected: false },
    "Dexmedetomidine (Precedex, Dexdomitor)": { selected: false },
    "Medetomidine (Domitor)": { selected: false },
    "Diazepam (Valium)": { selected: false },
    "Midazolam (Versed)": { selected: false },
    "Butorphanol (Torbugesic)": { selected: false },
    "Buprenorphine (Buprenex)": { selected: false },
    "Gabapentin": { selected: false },
    "Trazodone": { selected: false },
    "Other": { selected: false, otherText: "" }
  });

  // Injectable Anesthetics
  const [injectableAnesthetics, setInjectableAnesthetics] = useState<EquipmentSection>({
    "Propofol (Diprivan, PropoFlo)": { selected: false },
    "Ketamine (Ketaset)": { selected: false },
    "Tiletamine/Zolazepam (Telazol)": { selected: false },
    "Etomidate (Amidate)": { selected: false },
    "Alfaxalone (Alfaxan)": { selected: false },
    "Thiopental (Pentothal)": { selected: false },
    "Other": { selected: false, otherText: "" }
  });

  // Inhalation Anesthetics
  const [inhalationAnesthetics, setInhalationAnesthetics] = useState<EquipmentSection>({
    "Isoflurane": { selected: false },
    "Sevoflurane": { selected: false },
    "Desflurane": { selected: false },
    "Nitrous Oxide (N2O)": { selected: false },
    "Other": { selected: false, otherText: "" }
  });

  // Analgesics/Pain Management
  const [analgesics, setAnalgesics] = useState<EquipmentSection>({
    "Morphine": { selected: false },
    "Fentanyl": { selected: false },
    "Hydromorphone (Dilaudid)": { selected: false },
    "Tramadol (Ultram)": { selected: false },
    "Carprofen (Rimadyl)": { selected: false },
    "Meloxicam (Metacam)": { selected: false },
    "Lidocaine (local/IV)": { selected: false },
    "Bupivacaine (Marcaine)": { selected: false },
    "Other": { selected: false, otherText: "" }
  });

  // Reversal Agents
  const [reversalAgents, setReversalAgents] = useState<EquipmentSection>({
    "Atipamezole (Antisedan)": { selected: false },
    "Flumazenil (Romazicon)": { selected: false },
    "Naloxone (Narcan)": { selected: false },
    "Yohimbine": { selected: false },
    "Other": { selected: false, otherText: "" }
  });

  // Anesthesia Machine
  const [anesthesiaMachine, setAnesthesiaMachine] = useState(false);

  // Monitoring Parameters
  const [monitoringParams, setMonitoringParams] = useState<EquipmentSection>({
    "Heart Rate (HR)": { selected: false },
    "Blood Pressure (BP)": { selected: false },
    "Pulse Oximetry (SpO2)": { selected: false },
    "End-tidal CO2 (EtCO2/Capnography)": { selected: false },
    "ECG/EKG": { selected: false },
    "Temperature": { selected: false },
    "Respiratory Rate": { selected: false },
    "Anesthetic Gas Concentration": { selected: false },
    "Central Venous Pressure (CVP)": { selected: false },
    "Other": { selected: false, otherText: "" }
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

  // Redirect if no case ID
  if (!caseId) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const updateSection = (
    section: EquipmentSection,
    setSectionFunc: React.Dispatch<React.SetStateAction<EquipmentSection>>,
    item: string,
    checked: boolean,
    otherText?: string
  ) => {
    setSectionFunc(prev => ({
      ...prev,
      [item]: {
        selected: checked,
        otherText: item === "Other" ? otherText || "" : prev[item]?.otherText
      }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Prepare equipment data
      const equipmentData = {
        case_id: caseId,
        sedation_drugs: sedationDrugs,
        injectable_anesthetics: injectableAnesthetics,
        inhalation_anesthetics: inhalationAnesthetics,
        analgesics: analgesics,
        reversal_agents: reversalAgents,
        anesthesia_machine_available: anesthesiaMachine,
        monitoring_parameters: monitoringParams,
        created_at: new Date().toISOString()
      };

      // Save to database (you'll need to create this table)
      const { error } = await supabase
        .from('anesthesia_equipment')
        .insert(equipmentData);

      if (error) {
        throw error;
      }

      toast({
        title: "Equipment Information Saved!",
        description: "Your anesthesia equipment information has been recorded successfully.",
      });

      // Navigate to next page or back to dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error('Error saving equipment data:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to save equipment information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEquipmentSection = (
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
        <div className="space-y-3">
          {Object.entries(section).map(([item, data]) => (
            <div key={item} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${title}-${item}`}
                  checked={data.selected}
                  onCheckedChange={(checked) =>
                    updateSection(section, setSectionFunc, item, checked as boolean)
                  }
                />
                <Label htmlFor={`${title}-${item}`} className="text-sm font-normal">
                  {item}
                </Label>
              </div>
              {item === "Other" && data.selected && (
                <Input
                  placeholder="Please specify..."
                  value={data.otherText || ""}
                  onChange={(e) =>
                    updateSection(section, setSectionFunc, item, true, e.target.value)
                  }
                  className="ml-6 max-w-xs"
                />
              )}
            </div>
          ))}
        </div>
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
              Anesthesia & Monitoring Equipment
            </h1>
            <p className="text-gray-600">
              Please indicate which equipment and drugs you have available for this procedure
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Case ID: {caseId}
            </p>
          </div>

          {/* Equipment Sections */}
          {renderEquipmentSection(
            "Sedation/Premedication Drugs",
            <Pill className="h-5 w-5" />,
            sedationDrugs,
            setSedationDrugs
          )}

          {renderEquipmentSection(
            "Injectable Anesthetics",
            <Syringe className="h-5 w-5" />,
            injectableAnesthetics,
            setInjectableAnesthetics
          )}

          {renderEquipmentSection(
            "Inhalation Anesthetics",
            <Wind className="h-5 w-5" />,
            inhalationAnesthetics,
            setInhalationAnesthetics
          )}

          {renderEquipmentSection(
            "Analgesics/Pain Management",
            <Activity className="h-5 w-5" />,
            analgesics,
            setAnalgesics
          )}

          {renderEquipmentSection(
            "Reversal Agents",
            <RotateCcw className="h-5 w-5" />,
            reversalAgents,
            setReversalAgents
          )}

          {/* Anesthesia Machine */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cog className="h-5 w-5" />
                Anesthesia Machine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anesthesia-machine"
                  checked={anesthesiaMachine}
                  onCheckedChange={(checked) => setAnesthesiaMachine(checked as boolean)}
                />
                <Label htmlFor="anesthesia-machine">
                  Anesthesia Machine Available
                </Label>
              </div>
            </CardContent>
          </Card>

          {renderEquipmentSection(
            "Monitoring Parameters Available",
            <Monitor className="h-5 w-5" />,
            monitoringParams,
            setMonitoringParams
          )}

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