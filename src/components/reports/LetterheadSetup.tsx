import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Building, 
  Upload, 
  Save, 
  Settings, 
  Award,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

interface LetterheadSetupProps {
  specialistId: string;
  onLetterheadSaved?: () => void;
}

export const LetterheadSetup = ({ specialistId, onLetterheadSaved }: LetterheadSetupProps) => {
  const [letterheadData, setLetterheadData] = useState({
    practice_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    phone: '',
    fax: '',
    email: '',
    website: '',
    credentials: [] as string[],
    license_numbers: [] as string[],
    specialties: [] as string[],
    board_certifications: [] as string[],
    is_default: true
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchExistingLetterhead();
  }, [specialistId]);

  const fetchExistingLetterhead = async () => {
    try {
      const { data } = await supabase
        .from('specialist_letterheads')
        .select('*')
        .eq('specialist_id', specialistId)
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setLetterheadData({
          practice_name: data.practice_name || '',
          address_line1: data.address_line1 || '',
          address_line2: data.address_line2 || '',
          city: data.city || '',
          state: data.state || '',
          postal_code: data.postal_code || '',
          country: data.country || 'United States',
          phone: data.phone || '',
          fax: data.fax || '',
          email: data.email || '',
          website: data.website || '',
          credentials: data.credentials || [],
          license_numbers: data.license_numbers || [],
          specialties: data.specialties || [],
          board_certifications: data.board_certifications || [],
          is_default: data.is_default || true
        });

        if (data.practice_logo_url) {
          setLogoPreview(data.practice_logo_url);
        }
      }
    } catch (error) {
      console.error('Error fetching letterhead:', error);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return null;

    setIsUploading(true);
    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${specialistId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('letterhead-logos')
        .upload(fileName, logoFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('letterhead-logos')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!letterheadData.practice_name.trim()) {
      toast({
        title: "Required Field",
        description: "Practice name is required.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      let logoUrl = logoPreview;
      
      // Upload new logo if selected
      if (logoFile) {
        logoUrl = await uploadLogo();
        if (!logoUrl && logoFile) {
          return; // Upload failed
        }
      }

      const { error } = await supabase
        .from('specialist_letterheads')
        .upsert({
          specialist_id: specialistId,
          ...letterheadData,
          practice_logo_url: logoUrl,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Letterhead Saved",
        description: "Your professional letterhead has been saved successfully."
      });

      onLetterheadSaved?.();
    } catch (error) {
      console.error('Error saving letterhead:', error);
      toast({
        title: "Error",
        description: "Failed to save letterhead. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleArrayFieldChange = (field: string, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    setLetterheadData(prev => ({ ...prev, [field]: items }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Professional Letterhead Setup
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Configure your professional letterhead for consultation reports
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Practice Logo */}
        <div className="space-y-3">
          <Label>Practice Logo</Label>
          <div className="flex items-center gap-4">
            {logoPreview && (
              <div className="w-20 h-20 border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                <img 
                  src={logoPreview} 
                  alt="Practice logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Recommended: 300x300px, PNG or JPG, max 5MB
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Practice Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building className="h-4 w-4" />
            Practice Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="practice-name">Practice Name *</Label>
              <Input
                id="practice-name"
                value={letterheadData.practice_name}
                onChange={(e) => setLetterheadData(prev => ({ ...prev, practice_name: e.target.value }))}
                placeholder="Veterinary Specialty Clinic"
              />
            </div>

            <div>
              <Label htmlFor="address1">Address Line 1</Label>
              <Input
                id="address1"
                value={letterheadData.address_line1}
                onChange={(e) => setLetterheadData(prev => ({ ...prev, address_line1: e.target.value }))}
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <Label htmlFor="address2">Address Line 2</Label>
              <Input
                id="address2"
                value={letterheadData.address_line2}
                onChange={(e) => setLetterheadData(prev => ({ ...prev, address_line2: e.target.value }))}
                placeholder="Suite 100"
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={letterheadData.city}
                onChange={(e) => setLetterheadData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="City"
              />
            </div>

            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={letterheadData.state}
                onChange={(e) => setLetterheadData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="State"
              />
            </div>

            <div>
              <Label htmlFor="postal">Postal Code</Label>
              <Input
                id="postal"
                value={letterheadData.postal_code}
                onChange={(e) => setLetterheadData(prev => ({ ...prev, postal_code: e.target.value }))}
                placeholder="12345"
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={letterheadData.country}
                onChange={(e) => setLetterheadData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="United States"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={letterheadData.phone}
                onChange={(e) => setLetterheadData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="fax">Fax</Label>
              <Input
                id="fax"
                value={letterheadData.fax}
                onChange={(e) => setLetterheadData(prev => ({ ...prev, fax: e.target.value }))}
                placeholder="(555) 123-4568"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={letterheadData.email}
                onChange={(e) => setLetterheadData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contact@vetclinic.com"
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={letterheadData.website}
                onChange={(e) => setLetterheadData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="www.vetclinic.com"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Professional Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="h-4 w-4" />
            Professional Credentials
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="credentials">Professional Credentials</Label>
              <Input
                id="credentials"
                value={letterheadData.credentials.join(', ')}
                onChange={(e) => handleArrayFieldChange('credentials', e.target.value)}
                placeholder="DVM, DACVS, PhD (comma-separated)"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Enter credentials separated by commas
              </div>
            </div>

            <div>
              <Label htmlFor="licenses">License Numbers</Label>
              <Input
                id="licenses"
                value={letterheadData.license_numbers.join(', ')}
                onChange={(e) => handleArrayFieldChange('license_numbers', e.target.value)}
                placeholder="VET12345, DEA123456 (comma-separated)"
              />
            </div>

            <div>
              <Label htmlFor="specialties">Specialties</Label>
              <Input
                id="specialties"
                value={letterheadData.specialties.join(', ')}
                onChange={(e) => handleArrayFieldChange('specialties', e.target.value)}
                placeholder="Surgery, Internal Medicine (comma-separated)"
              />
            </div>

            <div>
              <Label htmlFor="certifications">Board Certifications</Label>
              <Input
                id="certifications"
                value={letterheadData.board_certifications.join(', ')}
                onChange={(e) => handleArrayFieldChange('board_certifications', e.target.value)}
                placeholder="American College of Veterinary Surgeons (comma-separated)"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Preview</h3>
          <div className="border rounded-lg p-6 bg-white">
            <div className="flex items-start gap-4 border-b-2 border-blue-600 pb-4">
              {logoPreview && (
                <div className="w-16 h-16 flex-shrink-0">
                  <img 
                    src={logoPreview} 
                    alt="Practice logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-blue-600">
                  {letterheadData.practice_name || 'Practice Name'}
                </h2>
                <div className="text-sm text-gray-600 mt-2 space-y-1">
                  {(letterheadData.address_line1 || letterheadData.city) && (
                    <div>
                      {letterheadData.address_line1}
                      {letterheadData.address_line2 && `, ${letterheadData.address_line2}`}
                      {letterheadData.city && (
                        <>
                          {letterheadData.address_line1 && <br />}
                          {letterheadData.city}, {letterheadData.state} {letterheadData.postal_code}
                        </>
                      )}
                    </div>
                  )}
                  {letterheadData.phone && <div>Phone: {letterheadData.phone}</div>}
                  {letterheadData.email && <div>Email: {letterheadData.email}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving || isUploading}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : isUploading ? 'Uploading...' : 'Save Letterhead'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};