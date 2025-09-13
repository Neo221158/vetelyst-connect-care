import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { 
  CalendarIcon, 
  Filter, 
  X,
  Download,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

interface AnalyticsFiltersProps {
  onFiltersChange: (filters: any) => void;
  onExport: () => void;
  onRefresh: () => void;
}

export const AnalyticsFilters = ({ onFiltersChange, onExport, onRefresh }: AnalyticsFiltersProps) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reportType, setReportType] = useState<string>("summary");

  const specialties = [
    "Emergency Medicine",
    "Surgery", 
    "Internal Medicine",
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Orthopedics",
    "Oncology"
  ];

  const urgencyLevels = [
    { value: "all", label: "All Urgencies" },
    { value: "routine", label: "Routine" },
    { value: "urgent", label: "Urgent" },
    { value: "emergency", label: "Emergency" }
  ];

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "submitted", label: "Submitted" },
    { value: "reviewing", label: "Reviewing" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" }
  ];

  const reportTypes = [
    { value: "summary", label: "Summary Report" },
    { value: "detailed", label: "Detailed Analysis" },
    { value: "performance", label: "Performance Metrics" },
    { value: "financial", label: "Financial Analysis" }
  ];

  const handleSpecialtyToggle = (specialty: string) => {
    const updated = selectedSpecialties.includes(specialty)
      ? selectedSpecialties.filter(s => s !== specialty)
      : [...selectedSpecialties, specialty];
    
    setSelectedSpecialties(updated);
    updateFilters({ specialties: updated });
  };

  const updateFilters = (newFilters: any) => {
    const filters = {
      dateRange,
      specialties: selectedSpecialties,
      urgency: urgencyFilter,
      status: statusFilter,
      reportType,
      ...newFilters
    };
    onFiltersChange(filters);
  };

  const clearAllFilters = () => {
    setDateRange(undefined);
    setSelectedSpecialties([]);
    setUrgencyFilter("all");
    setStatusFilter("all");
    setReportType("summary");
    onFiltersChange({});
  };

  const activeFiltersCount = [
    dateRange ? 1 : 0,
    selectedSpecialties.length,
    urgencyFilter !== "all" ? 1 : 0,
    statusFilter !== "all" ? 1 : 0,
    reportType !== "summary" ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Analytics Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} active</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                    updateFilters({ dateRange: range });
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Urgency Filter */}
          <div className="space-y-2">
            <Label>Urgency Level</Label>
            <Select 
              value={urgencyFilter} 
              onValueChange={(value) => {
                setUrgencyFilter(value);
                updateFilters({ urgency: value });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {urgencyLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Case Status</Label>
            <Select 
              value={statusFilter} 
              onValueChange={(value) => {
                setStatusFilter(value);
                updateFilters({ status: value });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Report Type */}
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select 
              value={reportType} 
              onValueChange={(value) => {
                setReportType(value);
                updateFilters({ reportType: value });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Specialties Filter */}
          <div className="space-y-2">
            <Label>Specialties</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Filter className="mr-2 h-4 w-4" />
                  {selectedSpecialties.length === 0 
                    ? "All Specialties" 
                    : `${selectedSpecialties.length} selected`
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <div className="font-medium">Select Specialties</div>
                  <div className="grid grid-cols-1 gap-2">
                    {specialties.map((specialty) => (
                      <div key={specialty} className="flex items-center space-x-2">
                        <Checkbox
                          id={specialty}
                          checked={selectedSpecialties.includes(specialty)}
                          onCheckedChange={() => handleSpecialtyToggle(specialty)}
                        />
                        <Label htmlFor={specialty} className="text-sm">
                          {specialty}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedSpecialties.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSelectedSpecialties([]);
                        updateFilters({ specialties: [] });
                      }}
                    >
                      Clear Selection
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active Filter Tags */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            {dateRange && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Date: {format(dateRange.from!, "MMM d")} - {format(dateRange.to!, "MMM d")}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => {
                    setDateRange(undefined);
                    updateFilters({ dateRange: undefined });
                  }}
                />
              </Badge>
            )}
            {urgencyFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Urgency: {urgencyLevels.find(l => l.value === urgencyFilter)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => {
                    setUrgencyFilter("all");
                    updateFilters({ urgency: "all" });
                  }}
                />
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {statusOptions.find(s => s.value === statusFilter)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => {
                    setStatusFilter("all");
                    updateFilters({ status: "all" });
                  }}
                />
              </Badge>
            )}
            {selectedSpecialties.map((specialty) => (
              <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                {specialty}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleSpecialtyToggle(specialty)}
                />
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};