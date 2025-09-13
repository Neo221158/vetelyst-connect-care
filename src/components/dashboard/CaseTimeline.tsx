import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock, 
  FileText, 
  User, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare,
  Calendar,
  Activity
} from "lucide-react";
import { format } from "date-fns";

interface TimelineEntry {
  id: string;
  action: string;
  description?: string;
  created_at: string;
  metadata?: any;
  actor?: {
    first_name: string;
    last_name: string;
    role: 'referring_vet' | 'specialist';
  };
}

interface CaseTimelineProps {
  timeline: TimelineEntry[];
}

export const CaseTimeline = ({ timeline }: CaseTimelineProps) => {
  const getTimelineIcon = (action: string) => {
    if (action.includes('submitted')) return <FileText className="h-4 w-4" />;
    if (action.includes('accepted')) return <CheckCircle className="h-4 w-4" />;
    if (action.includes('completed')) return <Activity className="h-4 w-4" />;
    if (action.includes('response')) return <MessageSquare className="h-4 w-4" />;
    if (action.includes('status')) return <AlertCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const getTimelineColor = (action: string) => {
    if (action.includes('submitted')) return 'text-blue-500';
    if (action.includes('accepted')) return 'text-green-500';
    if (action.includes('completed')) return 'text-purple-500';
    if (action.includes('response')) return 'text-orange-500';
    if (action.includes('declined')) return 'text-red-500';
    return 'text-gray-500';
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'referring_vet':
        return <Badge variant="outline" className="text-xs">Referring Vet</Badge>;
      case 'specialist':
        return <Badge variant="secondary" className="text-xs">Specialist</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">System</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Case Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-4">
            {timeline.map((entry, index) => (
              <div key={entry.id} className="flex gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 bg-background flex items-center justify-center ${getTimelineColor(entry.action)}`}>
                  {getTimelineIcon(entry.action)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{entry.action}</p>
                      {entry.description && (
                        <p className="text-xs text-muted-foreground">{entry.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(entry.created_at), 'MMM d, HH:mm')}
                        </span>
                        {entry.actor && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              Dr. {entry.actor.first_name} {entry.actor.last_name}
                            </span>
                            {getRoleBadge(entry.actor.role)}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {index < timeline.length - 1 && (
                    <div className="w-px h-4 bg-border ml-4 mt-2"></div>
                  )}
                </div>
              </div>
            ))}
            
            {timeline.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No timeline entries yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};