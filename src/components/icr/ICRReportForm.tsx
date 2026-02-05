import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  MessageSquare,
  Filter,
  FileCheck,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createICRReport, updateICRReport, ICRCreatePayload, ICRUpdatePayload, type ICRReport } from "@/lib/api/icr";

// Types
interface ActivityData {
  selected: boolean;
  leads: number;
  description: string;
}

interface FormData {
  reportMonth: string;
  leadGeneration: Record<string, ActivityData>;
  leadEngagement: Record<string, ActivityData>;
  applicationFunnel: {
    leadsEngaged: number;
    notInterested: number;
    interested2026: number;
    applicationsSubmitted: number;
    admitted: number;
    offersAccepted: number;
    enrolled: number;
  };
}

// Activity definitions
const LEAD_GENERATION_ACTIVITIES = [
  { key: "testPrep", label: "Test Prep Events" },
  { key: "collegeCampus", label: "College Campus Events" },
  { key: "highSchool", label: "High School Events" },
  { key: "festivals", label: "Festivals / Fairs / Seminars" },
  { key: "coffeeMeets", label: "Coffee Meets / Info-sessions" },
  { key: "webinars", label: "Online Masterclasses / Webinars" },
  { key: "partners", label: "Partners Engaged" },
  { key: "otherGen", label: "Other Activity" },
];

const LEAD_ENGAGEMENT_ACTIVITIES = [
  { key: "phoneCalls", label: "Phone Calls" },
  { key: "onlineMeetings", label: "Online Meetings / Profile Evaluations" },
  { key: "emailConv", label: "Email Conversations" },
  { key: "whatsapp", label: "WhatsApp Conversations" },
  { key: "otherEng", label: "Other Activity" },
];

// Generate available months (current month + next 12 months)
function generateAvailableMonths(): { value: string; label: string }[] {
  const months = [];
  const now = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    months.push({ value, label });
  }
  
  return months;
}

// Initial form state
function getInitialFormData(): FormData {
  const leadGeneration: Record<string, ActivityData> = {};
  LEAD_GENERATION_ACTIVITIES.forEach(({ key }) => {
    leadGeneration[key] = { selected: false, leads: 0, description: "" };
  });

  const leadEngagement: Record<string, ActivityData> = {};
  LEAD_ENGAGEMENT_ACTIVITIES.forEach(({ key }) => {
    leadEngagement[key] = { selected: false, leads: 0, description: "" };
  });

  return {
    reportMonth: "",
    leadGeneration,
    leadEngagement,
    applicationFunnel: {
      leadsEngaged: 0,
      notInterested: 0,
      interested2026: 0,
      applicationsSubmitted: 0,
      admitted: 0,
      offersAccepted: 0,
      enrolled: 0,
    },
  };
}

// Convert ICRReport to FormData for editing
function convertReportToFormData(report: ICRReport): FormData {
  const leadGeneration: Record<string, ActivityData> = {};
  LEAD_GENERATION_ACTIVITIES.forEach(({ key }) => {
    const activity = report.lead_generation.find((lg) => lg.activity_type === key);
    leadGeneration[key] = activity
      ? { selected: true, leads: activity.qualified_leads, description: activity.description || "" }
      : { selected: false, leads: 0, description: "" };
  });

  const leadEngagement: Record<string, ActivityData> = {};
  LEAD_ENGAGEMENT_ACTIVITIES.forEach(({ key }) => {
    const activity = report.lead_engagement.find((le) => le.activity_type === key);
    leadEngagement[key] = activity
      ? { selected: true, leads: activity.leads_engaged, description: activity.description || "" }
      : { selected: false, leads: 0, description: "" };
  });

  const funnel = report.application_funnel;

  return {
    reportMonth: report.report_month,
    leadGeneration,
    leadEngagement,
    applicationFunnel: {
      leadsEngaged: funnel?.leads_engaged ?? 0,
      notInterested: funnel?.not_interested ?? 0,
      interested2026: funnel?.interested_2026 ?? 0,
      applicationsSubmitted: funnel?.applications_submitted ?? 0,
      admitted: funnel?.admitted ?? 0,
      offersAccepted: funnel?.offers_accepted ?? 0,
      enrolled: funnel?.enrolled ?? 0,
    },
  };
}

interface ICRReportFormProps {
  onSuccess?: () => void;
  submittedMonths?: string[];
  editReport?: ICRReport | null;
  onCancelEdit?: () => void;
}

export function ICRReportForm({ onSuccess, submittedMonths = [], editReport, onCancelEdit }: ICRReportFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(getInitialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!editReport;

  // Load edit data when editReport changes
  useEffect(() => {
    if (editReport) {
      setFormData(convertReportToFormData(editReport));
      setCurrentStep(1);
    } else {
      setFormData(getInitialFormData());
      setCurrentStep(1);
    }
  }, [editReport]);

  const availableMonths = useMemo(() => generateAvailableMonths(), []);

  const steps = [
    { number: 1, label: "Month", icon: Calendar },
    { number: 2, label: "Generation", icon: Users },
    { number: 3, label: "Engagement", icon: MessageSquare },
    { number: 4, label: "Funnel", icon: Filter },
    { number: 5, label: "Review", icon: FileCheck },
  ];

  // Calculate totals
  const totalLeadsGenerated = useMemo(() => {
    return Object.values(formData.leadGeneration)
      .filter((a) => a.selected)
      .reduce((sum, a) => sum + a.leads, 0);
  }, [formData.leadGeneration]);

  const totalLeadsEngaged = useMemo(() => {
    return Object.values(formData.leadEngagement)
      .filter((a) => a.selected)
      .reduce((sum, a) => sum + a.leads, 0);
  }, [formData.leadEngagement]);

  // Auto-update funnel leads engaged
  const autoLeadsEngaged = totalLeadsGenerated + totalLeadsEngaged;

  // Toggle activity selection
  const toggleActivity = useCallback((type: "leadGeneration" | "leadEngagement", key: string) => {
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: {
          ...prev[type][key],
          selected: !prev[type][key].selected,
        },
      },
    }));
  }, []);

  // Update activity data
  const updateActivity = useCallback(
    (type: "leadGeneration" | "leadEngagement", key: string, field: "leads" | "description", value: number | string) => {
      setFormData((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          [key]: {
            ...prev[type][key],
            [field]: value,
          },
        },
      }));
    },
    []
  );

  // Update funnel data
  const updateFunnel = useCallback((field: keyof FormData["applicationFunnel"], value: number) => {
    setFormData((prev) => ({
      ...prev,
      applicationFunnel: {
        ...prev.applicationFunnel,
        [field]: value,
      },
    }));
  }, []);

  // Navigation
  const canProceed = useMemo(() => {
    if (currentStep === 1) return formData.reportMonth !== "";
    return true;
  }, [currentStep, formData.reportMonth]);

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 5 && step <= currentStep + 1) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (currentStep < 5 && canProceed) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Build submission payload matching API structure
      const basePayload = {
        reportMonth: formData.reportMonth,
        leadGeneration: Object.entries(formData.leadGeneration)
          .filter(([, data]) => data.selected && data.leads > 0)
          .map(([key, data]) => ({
            activity_type: key,
            qualified_leads: data.leads,
            description: data.description,
          })),
        leadEngagement: Object.entries(formData.leadEngagement)
          .filter(([, data]) => data.selected && data.leads > 0)
          .map(([key, data]) => ({
            activity_type: key,
            leads_engaged: data.leads,
            description: data.description,
          })),
        applicationFunnel: {
          leadsEngaged: autoLeadsEngaged,
          notInterested: formData.applicationFunnel.notInterested,
          interested2026: formData.applicationFunnel.interested2026,
          applicationsSubmitted: formData.applicationFunnel.applicationsSubmitted,
          admitted: formData.applicationFunnel.admitted,
          offersAccepted: formData.applicationFunnel.offersAccepted,
          enrolled: formData.applicationFunnel.enrolled,
        },
      };

      let result;
      if (isEditMode && editReport) {
        const updatePayload: ICRUpdatePayload = {
          ...basePayload,
          report_id: editReport.report_id,
        };
        result = await updateICRReport(updatePayload);
      } else {
        result = await createICRReport(basePayload as ICRCreatePayload);
      }

      if (!result.success) {
        throw new Error(result.error || `Failed to ${isEditMode ? "update" : "submit"} report`);
      }

      toast({
        title: isEditMode ? "Report Updated Successfully" : "Report Submitted Successfully",
        description: `Your ${availableMonths.find((m) => m.value === formData.reportMonth)?.label} report has been ${isEditMode ? "updated" : "submitted"}.`,
      });

      // Reset form
      setFormData(getInitialFormData());
      setCurrentStep(1);
      onSuccess?.();
    } catch (error) {
      console.error(`Failed to ${isEditMode ? "update" : "submit"} report:`, error);
      toast({
        title: isEditMode ? "Update Failed" : "Submission Failed",
        description: error instanceof Error ? error.message : `Failed to ${isEditMode ? "update" : "submit"} the report. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get selected activities summary
  const getSelectedActivities = (type: "leadGeneration" | "leadEngagement") => {
    const activities = type === "leadGeneration" ? LEAD_GENERATION_ACTIVITIES : LEAD_ENGAGEMENT_ACTIVITIES;
    return activities.filter(({ key }) => formData[type][key].selected && formData[type][key].leads > 0);
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card variant="elevated">
        <CardContent className="py-6">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
              />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.map((step) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;

                return (
                  <button
                    key={step.number}
                    onClick={() => goToStep(step.number)}
                    className={cn(
                      "flex flex-col items-center gap-2 transition-all",
                      isActive || isCompleted ? "cursor-pointer" : "cursor-not-allowed"
                    )}
                    disabled={step.number > currentStep + 1}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                        isCompleted
                          ? "bg-success border-success text-success-foreground"
                          : isActive
                          ? "bg-primary border-primary text-primary-foreground scale-110"
                          : "bg-background border-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-4 w-4" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isActive ? "text-primary" : isCompleted ? "text-success" : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Card */}
      <Card variant="elevated">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {isEditMode && <Badge variant="secondary" className="mr-2">Editing</Badge>}
            {currentStep === 1 && "Select Reporting Month"}
            {currentStep === 2 && "Lead Generation Activities"}
            {currentStep === 3 && "Lead Engagement Activities"}
            {currentStep === 4 && "Application Funnel"}
            {currentStep === 5 && (isEditMode ? "Review & Update" : "Review & Submit")}
          </CardTitle>
          {isEditMode && onCancelEdit && (
            <Button variant="ghost" size="sm" onClick={onCancelEdit}>
              <X className="h-4 w-4 mr-1" />
              Cancel Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="min-h-[400px]">
          {/* Step 1: Month Selection */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <p className="text-muted-foreground">Choose the month you're reporting for</p>
              <div className="max-w-sm">
                <Label htmlFor="reportMonth">Reporting Month *</Label>
                <Select
                  value={formData.reportMonth}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, reportMonth: value }))}
                >
                  <SelectTrigger id="reportMonth" className="mt-2">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map((month) => {
                      const isSubmitted = submittedMonths.includes(month.value);
                      return (
                        <SelectItem key={month.value} value={month.value} disabled={isSubmitted}>
                          {month.label} {isSubmitted && "(Already Submitted)"}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Lead Generation */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-muted-foreground mb-6">
                Click on activities you conducted and add details
              </p>
              <div className="grid gap-4">
                {LEAD_GENERATION_ACTIVITIES.map(({ key, label }) => (
                  <ActivityCard
                    key={key}
                    label={label}
                    selected={formData.leadGeneration[key].selected}
                    leads={formData.leadGeneration[key].leads}
                    description={formData.leadGeneration[key].description}
                    leadsLabel="Qualified Leads"
                    onToggle={() => toggleActivity("leadGeneration", key)}
                    onLeadsChange={(v) => updateActivity("leadGeneration", key, "leads", v)}
                    onDescriptionChange={(v) => updateActivity("leadGeneration", key, "description", v)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Lead Engagement */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-muted-foreground mb-6">
                Click on engagement activities you conducted and add details
              </p>
              <div className="grid gap-4">
                {LEAD_ENGAGEMENT_ACTIVITIES.map(({ key, label }) => (
                  <ActivityCard
                    key={key}
                    label={label}
                    selected={formData.leadEngagement[key].selected}
                    leads={formData.leadEngagement[key].leads}
                    description={formData.leadEngagement[key].description}
                    leadsLabel="Leads Engaged"
                    onToggle={() => toggleActivity("leadEngagement", key)}
                    onLeadsChange={(v) => updateActivity("leadEngagement", key, "leads", v)}
                    onDescriptionChange={(v) => updateActivity("leadEngagement", key, "description", v)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Application Funnel */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <p className="text-muted-foreground">
                Track leads through each stage of your funnel. "Leads Engaged" is auto-calculated.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FunnelItem
                  label="Leads Engaged"
                  value={autoLeadsEngaged}
                  readOnly
                />
                <FunnelItem
                  label="Not Interested"
                  value={formData.applicationFunnel.notInterested}
                  onChange={(v) => updateFunnel("notInterested", v)}
                />
                <FunnelItem
                  label="Interested in 2026"
                  value={formData.applicationFunnel.interested2026}
                  onChange={(v) => updateFunnel("interested2026", v)}
                />
                <FunnelItem
                  label="Applications"
                  value={formData.applicationFunnel.applicationsSubmitted}
                  onChange={(v) => updateFunnel("applicationsSubmitted", v)}
                />
                <FunnelItem
                  label="Admitted"
                  value={formData.applicationFunnel.admitted}
                  onChange={(v) => updateFunnel("admitted", v)}
                />
                <FunnelItem
                  label="Offers Accepted"
                  value={formData.applicationFunnel.offersAccepted}
                  onChange={(v) => updateFunnel("offersAccepted", v)}
                />
                <FunnelItem
                  label="Enrolled"
                  value={formData.applicationFunnel.enrolled}
                  onChange={(v) => updateFunnel("enrolled", v)}
                />
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              {/* Totals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-primary to-accent p-6 rounded-xl text-center text-primary-foreground">
                  <p className="text-sm opacity-90 mb-1">Total Leads Generated</p>
                  <p className="text-4xl font-bold">{totalLeadsGenerated}</p>
                </div>
                <div className="bg-gradient-to-r from-accent to-success p-6 rounded-xl text-center text-accent-foreground">
                  <p className="text-sm opacity-90 mb-1">Total Leads Engaged</p>
                  <p className="text-4xl font-bold">{totalLeadsEngaged}</p>
                </div>
              </div>

              {/* Report Month */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Reporting Month</p>
                <Badge variant="default" className="text-base">
                  {availableMonths.find((m) => m.value === formData.reportMonth)?.label || "Not selected"}
                </Badge>
              </div>

              {/* Lead Generation Summary */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-3">Lead Generation Activities</h4>
                {getSelectedActivities("leadGeneration").length === 0 ? (
                  <p className="text-muted-foreground text-sm">No activities recorded</p>
                ) : (
                  <div className="space-y-2">
                    {getSelectedActivities("leadGeneration").map(({ key, label }) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b last:border-0">
                        <span className="text-sm">{label}</span>
                        <Badge variant="secondary">{formData.leadGeneration[key].leads} leads</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lead Engagement Summary */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-3">Lead Engagement Activities</h4>
                {getSelectedActivities("leadEngagement").length === 0 ? (
                  <p className="text-muted-foreground text-sm">No activities recorded</p>
                ) : (
                  <div className="space-y-2">
                    {getSelectedActivities("leadEngagement").map(({ key, label }) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b last:border-0">
                        <span className="text-sm">{label}</span>
                        <Badge variant="secondary">{formData.leadEngagement[key].leads} engaged</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Funnel Summary */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-3">Application Funnel</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Engaged</p>
                    <p className="text-xl font-bold text-primary">{autoLeadsEngaged}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Applications</p>
                    <p className="text-xl font-bold">{formData.applicationFunnel.applicationsSubmitted}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Admitted</p>
                    <p className="text-xl font-bold">{formData.applicationFunnel.admitted}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Enrolled</p>
                    <p className="text-xl font-bold">{formData.applicationFunnel.enrolled}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Navigation */}
        <div className="px-6 pb-6">
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            {currentStep < 5 ? (
              <Button onClick={nextStep} disabled={!canProceed}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditMode ? "Updating..." : "Submitting..."}
                  </>
                ) : (
                  isEditMode ? "Update Report" : "Submit Report"
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Activity Card Component
interface ActivityCardProps {
  label: string;
  selected: boolean;
  leads: number;
  description: string;
  leadsLabel: string;
  onToggle: () => void;
  onLeadsChange: (value: number) => void;
  onDescriptionChange: (value: string) => void;
}

function ActivityCard({
  label,
  selected,
  leads,
  description,
  leadsLabel,
  onToggle,
  onLeadsChange,
  onDescriptionChange,
}: ActivityCardProps) {
  return (
    <div
      className={cn(
        "border-2 rounded-lg p-4 cursor-pointer transition-all",
        selected
          ? "border-primary bg-primary/5"
          : "border-muted hover:border-primary/50"
      )}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{label}</span>
        <div
          className={cn(
            "w-6 h-6 rounded border-2 flex items-center justify-center transition-all",
            selected
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground/30"
          )}
        >
          {selected && <Check className="h-4 w-4" />}
        </div>
      </div>

      {selected && (
        <div className="mt-4 pt-4 border-t space-y-4" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{leadsLabel}</Label>
              <Input
                type="number"
                min={0}
                value={leads === 0 ? "" : leads}
                placeholder="0"
                onFocus={(e) => e.target.select()}
                onChange={(e) => onLeadsChange(parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the activity..."
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                className="mt-1 min-h-[60px]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Funnel Item Component
interface FunnelItemProps {
  label: string;
  value: number;
  readOnly?: boolean;
  onChange?: (value: number) => void;
}

function FunnelItem({ label, value, readOnly, onChange }: FunnelItemProps) {
  return (
    <div className="bg-muted/50 border rounded-lg p-4 text-center">
      <Label className="text-xs text-muted-foreground uppercase tracking-wide">{label}</Label>
      <Input
        type="number"
        min={0}
        value={readOnly ? value : (value === 0 ? "" : value)}
        placeholder="0"
        readOnly={readOnly}
        onFocus={(e) => !readOnly && e.target.select()}
        onChange={(e) => onChange?.(parseInt(e.target.value) || 0)}
        className={cn(
          "mt-2 text-center text-2xl font-bold h-12",
          readOnly && "bg-primary/10 text-primary cursor-not-allowed"
        )}
      />
    </div>
  );
}
