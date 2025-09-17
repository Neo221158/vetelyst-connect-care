import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Stethoscope,
  Upload,
  FileText,
  Camera,
  LogOut,
  User,
  Settings,
  Activity,
  TestTube,
  FolderOpen,
  Pill,
  Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Navigate } from "react-router-dom";

type Species = "dog" | "cat" | "other";
type SpayNeuterStatus = "spayed" | "neutered" | "intact";
type DoseUnit = "mg/kg" | "microgram/kg" | "gram/kg" | "total_dose";

interface MedicalSystemExam {
  hasIssues: boolean;
  notes: string;
}

interface Medication {
  drugName: string;
  dose: string;
  unit: DoseUnit;
}

// Comprehensive veterinary drug list
const veterinaryDrugs = [
  // Antibiotics
  "Amoxicillin", "Amoxi-Tabs", "Amoxi-Drop", "Amoxicillin/Clavulanate", "Clavamox", "Augmentin",
  "Azithromycin", "Zithromax", "Cephalexin", "Keflex", "Rilexine", "Clindamycin", "Antirobe", "Cleocin",
  "Doxycycline", "Vibramycin", "Ronaxan", "Enrofloxacin", "Baytril", "Erythromycin", "Gallimycin",
  "Gentamicin", "Gentocin", "Marbofloxacin", "Zeniquin", "Metronidazole", "Flagyl", "Oxytetracycline",
  "Terramycin", "Penicillin G", "Pen G", "Sulfamethoxazole/Trimethoprim", "Bactrim", "Tribrissen",
  "Tylosin", "Tylan",

  // NSAIDs/Anti-inflammatory
  "Carprofen", "Rimadyl", "Novox", "Quellin", "Captieve", "Deracoxib", "Deramaxx", "Firocoxib",
  "Previcox", "Equioxx", "Grapiprant", "Galliprant", "Mavacoxib", "Trocoxil", "Meloxicam", "Metacam",
  "Loxicom", "OroCAM", "Rheumocam", "Phenylbutazone", "Butazolidin", "Piroxicam", "Feldene",
  "Robenacoxib", "Onsior", "Tepoxalin", "Zubrin", "Tolfenamic acid", "Tolfedine",

  // Analgesics/Pain Relief
  "Buprenorphine", "Buprenex", "Simbadol", "Butorphanol", "Torbugesic", "Torbutrol", "Fentanyl",
  "Duragesic", "Gabapentin", "Neurontin", "Hydromorphone", "Dilaudid", "Morphine", "Oxymorphone",
  "Numorphan", "Tramadol", "Ultram",

  // Cardiac Medications
  "Amlodipine", "Norvasc", "Atenolol", "Tenormin", "Benazepril", "Fortekor", "Lotensin", "Digoxin",
  "Cardoxin", "Lanoxin", "Diltiazem", "Cardizem", "Enalapril", "Enacard", "Vasotec", "Furosemide",
  "Lasix", "Salix", "Pimobendan", "Vetmedin", "Spironolactone", "Aldactone",

  // Antiparasitic
  "Afoxolaner", "NexGard", "Fenbendazole", "Panacur", "Fluralaner", "Bravecto", "Imidacloprid",
  "Advantage", "Ivermectin", "Heartgard", "Milbemycin oxime", "Interceptor", "Pyrantel", "Strongid",
  "Selamectin", "Revolution",

  // Behavioral/Neurological
  "Alprazolam", "Xanax", "Amitriptyline", "Elavil", "Clomipramine", "Clomicalm", "Diazepam", "Valium",
  "Fluoxetine", "Prozac", "Reconcile", "Levetiracetam", "Keppra", "Phenobarbital", "Luminal",
  "Sertraline", "Zoloft", "Sileo", "Trazodone", "Desyrel", "Zonisamide", "Zonegran",

  // Endocrine
  "Levothyroxine", "Thyro-Tabs", "Soloxine", "Methimazole", "Tapazole", "Felimazole", "Trilostane", "Vetoryl",

  // Gastrointestinal
  "Famotidine", "Pepcid", "Lactulose", "Chronulac", "Maropitant", "Cerenia", "Mirtazapine", "Remeron",
  "Elura", "Omeprazole", "Prilosec", "GastroGard", "Ondansetron", "Zofran", "Ranitidine", "Zantac",
  "Sucralfate", "Carafate",

  // Respiratory
  "Albuterol", "Proventil", "Ventolin", "Aminophylline", "Dextromethorphan", "Robitussin", "Fluticasone",
  "Flovent", "Terbutaline", "Brethine", "Theophylline", "Theo-Dur",

  // Sedatives/Anesthetics
  "Acepromazine", "PromAce", "Dexmedetomidine", "Precedex", "Ketamine", "Ketaset", "Propofol", "Diprivan",
  "Xylazine", "Rompun"
];

export default function DocumentUpload() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Signalment state
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [age, setAge] = useState<string>("");
  const [spayNeuterStatus, setSpayNeuterStatus] = useState<SpayNeuterStatus | null>(null);
  const [ccSurgeryType, setCcSurgeryType] = useState("");
  const [hadAnesthesia, setHadAnesthesia] = useState<boolean | null>(null);
  const [hadProblems, setHadProblems] = useState<boolean>(false);
  const [problemsNotes, setProblemsNotes] = useState("");

  // Medical Examination state
  const [tpr, setTpr] = useState({ temperature: "", pulse: "", respiratory: "" });
  const [cardiovascular, setCardiovascular] = useState<MedicalSystemExam>({ hasIssues: false, notes: "" });
  const [auscultation, setAuscultation] = useState("");
  const [respiratory, setRespiratory] = useState<MedicalSystemExam>({ hasIssues: false, notes: "" });
  const [gastrointestinal, setGastrointestinal] = useState<MedicalSystemExam>({ hasIssues: false, notes: "" });
  const [urogenital, setUrogenital] = useState<MedicalSystemExam>({ hasIssues: false, notes: "" });
  const [renal, setRenal] = useState<MedicalSystemExam>({ hasIssues: false, notes: "" });
  const [hepatic, setHepatic] = useState<MedicalSystemExam>({ hasIssues: false, notes: "" });
  const [musculoskeletal, setMusculoskeletal] = useState<MedicalSystemExam>({ hasIssues: false, notes: "" });
  const [neurological, setNeurological] = useState<MedicalSystemExam>({ hasIssues: false, notes: "" });
  const [dermatological, setDermatological] = useState<MedicalSystemExam>({ hasIssues: false, notes: "" });
  const [ophthalmic, setOphthalmic] = useState<MedicalSystemExam>({ hasIssues: false, notes: "" });
  const [oralDental, setOralDental] = useState<MedicalSystemExam>({ hasIssues: false, notes: "" });
  const [lymphatic, setLymphatic] = useState<MedicalSystemExam>({ hasIssues: false, notes: "" });
  const [endocrine, setEndocrine] = useState<MedicalSystemExam>({ hasIssues: false, notes: "" });
  const [otherSystem, setOtherSystem] = useState({ checked: false, notes: "" });

  // Medications state
  const [medications, setMedications] = useState<Medication[]>([{ drugName: "", dose: "", unit: "mg/kg" }]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const speciesOptions: { value: Species; label: string; icon: string }[] = [
    { value: "dog", label: "Dog", icon: "🐕" },
    { value: "cat", label: "Cat", icon: "🐱" },
    { value: "other", label: "Other", icon: "🐾" }
  ];

  const spayNeuterOptions: { value: SpayNeuterStatus; label: string }[] = [
    { value: "spayed", label: "Spayed" },
    { value: "neutered", label: "Neutered" },
    { value: "intact", label: "Intact" }
  ];

  const addMedication = () => {
    setMedications([...medications, { drugName: "", dose: "", unit: "mg/kg" }]);
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updatedMedications = medications.map((med, i) =>
      i === index ? { ...med, [field]: value } : med
    );
    setMedications(updatedMedications);
  };

  const filteredDrugs = (searchTerm: string) => {
    if (!searchTerm) return [];
    return veterinaryDrugs.filter(drug =>
      drug.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
  };

  const renderSystemExam = (
    system: MedicalSystemExam,
    setSystem: (system: MedicalSystemExam) => void,
    label: string,
    showAuscultation = false
  ) => (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <Label className="font-medium min-w-[200px]">{label}</Label>
        <div className="flex gap-3">
          <Button
            type="button"
            variant={system.hasIssues === false ? "default" : "outline"}
            size="sm"
            onClick={() => setSystem({ hasIssues: false, notes: "" })}
          >
            No
          </Button>
          <Button
            type="button"
            variant={system.hasIssues === true ? "default" : "outline"}
            size="sm"
            onClick={() => setSystem({ hasIssues: true, notes: system.notes })}
          >
            Yes
          </Button>
        </div>
      </div>

      {system.hasIssues && (
        <div className="space-y-3 pl-4 border-l-2 border-primary/20">
          <Textarea
            placeholder="Describe the findings..."
            value={system.notes}
            onChange={(e) => setSystem({ hasIssues: true, notes: e.target.value })}
            className="min-h-[80px]"
          />

          {showAuscultation && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Auscultation</Label>
              <Textarea
                placeholder="Auscultation findings..."
                value={auscultation}
                onChange={(e) => setAuscultation(e.target.value)}
                className="min-h-[60px]"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );

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
              <Badge variant="secondary" className="text-xs">Document Upload</Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium">{user.email}</div>
                  <div className="text-xs text-muted-foreground">Veterinary Professional</div>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold mb-2">Upload Medical Documents</h1>
            <p className="text-muted-foreground">
              Please provide the patient information and upload relevant medical documents for consultation
            </p>
          </div>

          {/* 1. Signalment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Signalment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Species Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Species *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {speciesOptions.map((species) => (
                    <Button
                      key={species.value}
                      type="button"
                      variant={selectedSpecies === species.value ? "default" : "outline"}
                      className={`h-16 flex flex-col items-center justify-center gap-2 transition-all ${
                        selectedSpecies === species.value
                          ? "ring-2 ring-primary ring-offset-2"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedSpecies(species.value)}
                    >
                      <span className="text-2xl">{species.icon}</span>
                      <span className="font-medium">{species.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Age *</Label>
                <Select value={age} onValueChange={setAge}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Select age" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 26 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i} {i === 1 ? "year" : "years"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Spay/Neuter Status */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Reproductive Status *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {spayNeuterOptions.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={spayNeuterStatus === option.value ? "default" : "outline"}
                      className={`h-12 ${
                        spayNeuterStatus === option.value
                          ? "ring-2 ring-primary ring-offset-2"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSpayNeuterStatus(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* CC/Surgery Type */}
              <div className="space-y-3">
                <Label htmlFor="cc-surgery-type" className="text-base font-medium">
                  Chief Complaint / Surgery Type *
                </Label>
                <Textarea
                  id="cc-surgery-type"
                  placeholder="Please describe the chief complaint or surgery type in detail..."
                  value={ccSurgeryType}
                  onChange={(e) => setCcSurgeryType(e.target.value)}
                  className="min-h-[100px] resize-none"
                  rows={4}
                />

                {/* Anesthesia History Subsection */}
                <div className="mt-4 p-4 bg-muted/30 rounded-lg space-y-4">
                  <h4 className="font-medium text-sm">Anesthesia History</h4>

                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <Label className="min-w-[200px]">Were there any anesthesia before?</Label>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant={hadAnesthesia === false ? "default" : "outline"}
                          size="sm"
                          onClick={() => setHadAnesthesia(false)}
                        >
                          No
                        </Button>
                        <Button
                          type="button"
                          variant={hadAnesthesia === true ? "default" : "outline"}
                          size="sm"
                          onClick={() => setHadAnesthesia(true)}
                        >
                          Yes
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Label className="min-w-[200px]">Were there any problems?</Label>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant={hadProblems === false ? "default" : "outline"}
                          size="sm"
                          onClick={() => {setHadProblems(false); setProblemsNotes("");}}
                        >
                          No
                        </Button>
                        <Button
                          type="button"
                          variant={hadProblems === true ? "default" : "outline"}
                          size="sm"
                          onClick={() => setHadProblems(true)}
                        >
                          Yes
                        </Button>
                      </div>
                    </div>

                    {hadProblems && (
                      <div className="pl-4">
                        <Textarea
                          placeholder="Please describe the problems..."
                          value={problemsNotes}
                          onChange={(e) => setProblemsNotes(e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Medical Examination Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Medical Examination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* TPR */}
              <div className="space-y-4">
                <Label className="text-base font-medium">TPR (Temperature, Pulse, Respiratory)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input
                      id="temperature"
                      type="number"
                      placeholder="°F or °C"
                      value={tpr.temperature}
                      onChange={(e) => setTpr({...tpr, temperature: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pulse">Pulse</Label>
                    <Input
                      id="pulse"
                      type="number"
                      placeholder="bpm"
                      value={tpr.pulse}
                      onChange={(e) => setTpr({...tpr, pulse: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="respiratory">Respiratory</Label>
                    <Input
                      id="respiratory"
                      type="number"
                      placeholder="rpm"
                      value={tpr.respiratory}
                      onChange={(e) => setTpr({...tpr, respiratory: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {renderSystemExam(cardiovascular, setCardiovascular, "Cardiovascular System", true)}
                {renderSystemExam(respiratory, setRespiratory, "Respiratory System")}
                {renderSystemExam(gastrointestinal, setGastrointestinal, "Gastrointestinal System")}
                {renderSystemExam(urogenital, setUrogenital, "Urogenital System")}
                {renderSystemExam(renal, setRenal, "Renal System")}
                {renderSystemExam(hepatic, setHepatic, "Hepatic System")}
                {renderSystemExam(musculoskeletal, setMusculoskeletal, "Musculoskeletal System")}
                {renderSystemExam(neurological, setNeurological, "Neurological System")}
                {renderSystemExam(dermatological, setDermatological, "Dermatological/Integumentary System")}
                {renderSystemExam(ophthalmic, setOphthalmic, "Ophthalmic (Eyes)")}
                {renderSystemExam(oralDental, setOralDental, "Oral/Dental")}
                {renderSystemExam(lymphatic, setLymphatic, "Lymphatic System")}
                {renderSystemExam(endocrine, setEndocrine, "Endocrine System")}

                {/* Other System */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      id="other-system"
                      checked={otherSystem.checked}
                      onCheckedChange={(checked) => setOtherSystem({...otherSystem, checked: !!checked})}
                    />
                    <Label htmlFor="other-system" className="font-medium">Other</Label>
                  </div>

                  {otherSystem.checked && (
                    <div className="pl-6">
                      <Textarea
                        placeholder="Please specify other system findings..."
                        value={otherSystem.notes}
                        onChange={(e) => setOtherSystem({...otherSystem, notes: e.target.value})}
                        className="min-h-[80px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Blood Tests Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Blood Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Blood Test Images</h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop images here, or click to select files
                </p>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Images
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports: JPEG, PNG, GIF, BMP, TIFF, HEIC, WEBP
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 4. Medical Record Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Medical Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Medical Records</h3>
                <p className="text-muted-foreground mb-4">
                  Upload documents, images, or videos of medical records
                </p>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Documents: PDF, DOC, DOCX, TXT, RTF, ODT<br/>
                  Images: JPEG, PNG, GIF, BMP, TIFF, HEIC, WEBP<br/>
                  Videos: MP4, MOV, AVI, WMV, MKV, WEBM (optional)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 5. Medication Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Medication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {medications.map((medication, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Drug Name</Label>
                    <Input
                      placeholder="Start typing drug name..."
                      value={medication.drugName}
                      onChange={(e) => updateMedication(index, 'drugName', e.target.value)}
                    />
                    {medication.drugName && (
                      <div className="max-h-32 overflow-y-auto border rounded-md bg-background">
                        {filteredDrugs(medication.drugName).map((drug, drugIndex) => (
                          <div
                            key={drugIndex}
                            className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                            onClick={() => updateMedication(index, 'drugName', drug)}
                          >
                            {drug}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Dose</Label>
                    <Input
                      type="number"
                      placeholder="Enter dose"
                      value={medication.dose}
                      onChange={(e) => updateMedication(index, 'dose', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select
                      value={medication.unit}
                      onValueChange={(value: DoseUnit) => updateMedication(index, 'unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mg/kg">mg/kg</SelectItem>
                        <SelectItem value="microgram/kg">microgram/kg</SelectItem>
                        <SelectItem value="gram/kg">gram/kg</SelectItem>
                        <SelectItem value="total_dose">Total Dose</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addMedication}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Medication
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <div className="flex gap-3">
              <Button variant="outline">
                Save Draft
              </Button>
              <Button
                className="bg-gradient-primary hover:opacity-90"
                disabled={!selectedSpecies || !ccSurgeryType.trim() || !age}
              >
                Submit for Review
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}