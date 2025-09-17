import { useState, useEffect } from "react";
import { CaseCard } from "./CaseCard";
import { CaseFilters, type CaseFilters as CaseFiltersType } from "./CaseFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CheckSquare, Square, RefreshCw } from "lucide-react";

interface CaseQueueProps {
  onCaseSelect: (caseId: string) => void;
  selectedCaseId?: string;
}

export const CaseQueue = ({ onCaseSelect, selectedCaseId }: CaseQueueProps) => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('submitted_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState<CaseFiltersType>({
    search: '',
    specialty: '',
    urgency: '',
    status: '',
    dateRange: ''
  });

  const fetchCases = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('cases')
        .select(`
          *,
          referring_vet:profiles!referring_vet_id(
            first_name,
            last_name,
            clinic_name
          )
        `);

      // Apply filters
      if (filters.search) {
        query = query.or(`patient_name.ilike.%${filters.search}%,chief_complaint.ilike.%${filters.search}%`);
      }
      if (filters.urgency) {
        query = query.eq('urgency', filters.urgency as any);
      }
      if (filters.status) {
        query = query.eq('status', filters.status as any);
      }

      // Apply date filters
      if (filters.dateRange) {
        const now = new Date();
        let startDate: Date;
        
        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'yesterday':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            break;
          case 'last_7_days':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'last_30_days':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'last_90_days':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }
        
        if (filters.dateRange !== 'yesterday') {
          query = query.gte('submitted_at', startDate.toISOString());
        } else {
          const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
          query = query.gte('submitted_at', startDate.toISOString()).lt('submitted_at', endDate.toISOString());
        }
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;
      
      if (error) throw error;
      
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [filters, sortBy, sortOrder]);

  const handleAcceptCase = async (caseId: string) => {
    try {
      const { error } = await supabase
        .from('cases')
        .update({ 
          status: 'reviewing',
          accepted_at: new Date().toISOString()
        })
        .eq('id', caseId);
      
      if (error) throw error;
      
      fetchCases(); // Refresh the list
    } catch (error) {
      console.error('Error accepting case:', error);
    }
  };

  const handleDeclineCase = async (caseId: string) => {
    try {
      const { error } = await supabase
        .from('cases')
        .update({ status: 'declined' })
        .eq('id', caseId);
      
      if (error) throw error;
      
      fetchCases(); // Refresh the list
    } catch (error) {
      console.error('Error declining case:', error);
    }
  };

  const handleBatchAction = async (action: 'accept' | 'decline') => {
    try {
      const updates = selectedCases.map(caseId => 
        supabase
          .from('cases')
          .update({ 
            status: action === 'accept' ? 'reviewing' : 'declined',
            ...(action === 'accept' ? { accepted_at: new Date().toISOString() } : {})
          })
          .eq('id', caseId)
      );
      
      await Promise.all(updates);
      setSelectedCases([]);
      fetchCases();
    } catch (error) {
      console.error(`Error ${action}ing cases:`, error);
    }
  };

  const toggleCaseSelection = (caseId: string) => {
    setSelectedCases(prev => 
      prev.includes(caseId) 
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedCases(prev => 
      prev.length === cases.length ? [] : cases.map(c => c.id)
    );
  };

  const getUrgencyStats = () => {
    const stats = cases.reduce((acc, case_) => {
      acc[case_.urgency] = (acc[case_.urgency] || 0) + 1;
      return acc;
    }, {});
    return stats;
  };

  const urgencyStats = getUrgencyStats();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading cases...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <CaseFilters onFiltersChange={setFilters} activeFilters={filters} />
      
      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Case Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{cases.length}</div>
              <div className="text-sm text-muted-foreground">Total Cases</div>
            </div>
            {Object.entries(urgencyStats).map(([urgency, count]: [string, any]) => (
              <div key={urgency} className="text-center">
                <div className="text-2xl font-bold text-foreground">{count}</div>
                <Badge variant={urgency === 'emergency' ? 'destructive' : urgency === 'urgent' ? 'secondary' : 'outline'} className="text-xs">
                  {urgency}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedCases.length === cases.length && cases.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm">
                  {selectedCases.length > 0 ? `${selectedCases.length} selected` : 'Select all'}
                </span>
              </div>
              
              {selectedCases.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="medical" size="sm" onClick={() => handleBatchAction('accept')}>
                    Accept Selected
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBatchAction('decline')}>
                    Decline Selected
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted_at">Date Submitted</SelectItem>
                  <SelectItem value="urgency">Urgency</SelectItem>
                  <SelectItem value="severity_score">Severity</SelectItem>
                  <SelectItem value="patient_name">Patient Name</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Case List */}
      <div className="grid gap-4">
        {cases.map((case_: any) => (
          <div key={case_.id} className="flex items-start gap-3">
            <Checkbox
              checked={selectedCases.includes(case_.id)}
              onCheckedChange={() => toggleCaseSelection(case_.id)}
              className="mt-6"
            />
            <div className="flex-1">
              <CaseCard
                caseData={case_}
                onClick={onCaseSelect}
                onAccept={handleAcceptCase}
                onDecline={handleDeclineCase}
                isSelected={selectedCaseId === case_.id}
              />
            </div>
          </div>
        ))}
        
        {cases.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No cases match your current filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};