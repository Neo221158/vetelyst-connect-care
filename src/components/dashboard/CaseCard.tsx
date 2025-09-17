import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Stethoscope, AlertTriangle, Calendar } from "lucide-react";
import { format } from "date-fns";

interface CaseCardProps {
  caseData: {
    id: string;
    patient_name: string;
    species: string;
    urgency: 'routine' | 'urgent' | 'emergency';
    status: 'submitted' | 'reviewing' | 'in_progress' | 'completed' | 'follow_up_needed' | 'declined';
    chief_complaint: string;
    submitted_at: string;
    referring_vet?: {
      first_name: string;
      last_name: string;
      clinic_name: string;
    };
    severity_score?: number;
  };
  onClick: (id: string) => void;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  isSelected?: boolean;
}

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'emergency': return 'destructive';
    case 'urgent': return 'secondary';
    case 'routine': return 'outline';
    default: return 'outline';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'reviewing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'in_progress': return 'bg-green-100 text-green-800 border-green-200';
    case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'follow_up_needed': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'declined': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const CaseCard = ({ 
  caseData, 
  onClick, 
  onAccept, 
  onDecline, 
  isSelected = false 
}: CaseCardProps) => {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-elevated ${
        isSelected ? 'ring-2 ring-primary shadow-elevated' : ''
      } ${caseData.urgency === 'emergency' ? 'border-l-4 border-l-destructive' : ''}`}
      onClick={() => onClick(caseData.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{caseData.patient_name}</h3>
              <Badge 
                variant={getUrgencyColor(caseData.urgency)}
                className="text-xs"
              >
                {caseData.urgency}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Stethoscope className="h-3 w-3" />
                {caseData.species}
              </span>
              {caseData.severity_score && (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Severity: {caseData.severity_score}/10
                </span>
              )}
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(caseData.status)}`}>
            {caseData.status.replace('_', ' ')}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {caseData.chief_complaint}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{caseData.referring_vet?.clinic_name || 'Unknown Clinic'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(caseData.submitted_at), 'MMM d, HH:mm')}</span>
          </div>
        </div>

        <div className="text-sm">
          <span className="text-muted-foreground">Referring Vet: </span>
          <span className="font-medium">
            Dr. {caseData.referring_vet?.first_name} {caseData.referring_vet?.last_name}
          </span>
        </div>

        {caseData.status === 'submitted' && (onAccept || onDecline) && (
          <div className="flex gap-2 mt-4">
            {onAccept && (
              <Button 
                variant="medical" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onAccept(caseData.id);
                }}
                className="flex-1"
              >
                Accept
              </Button>
            )}
            {onDecline && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDecline(caseData.id);
                }}
                className="flex-1"
              >
                Decline
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};