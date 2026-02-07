import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  User, GraduationCap, Globe, Save, TrendingUp, BarChart3,
  Calendar, Shield, Mail, Phone, CheckCircle2, XCircle,
} from "lucide-react";
import {
  fetchAllocationDetail,
  fetchSessionDetails,
  updateAllocation,
  type UpdateAllocationPayload,
  type SessionData,
} from "@/lib/api/visa-tutor";
import { cn } from "@/lib/utils";

interface LicenseDetailModalProps {
  licenseNumber: string | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

function InfoRow({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      {icon && <div className="mt-0.5 text-muted-foreground">{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );
}

function ScoreCard({ label, value, large }: { label: string; value: number | null | undefined; large?: boolean }) {
  const color = value == null ? "text-muted-foreground" : value >= 80 ? "text-green-600" : value >= 60 ? "text-yellow-600" : "text-red-600";
  return (
    <div className="text-center p-4 rounded-lg border bg-muted/30">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn(large ? "text-3xl" : "text-2xl", "font-bold", color)}>
        {value?.toFixed?.(1) ?? value ?? "—"}
      </p>
    </div>
  );
}

export function LicenseDetailModal({ licenseNumber, open, onClose, onUpdate }: LicenseDetailModalProps) {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<UpdateAllocationPayload | null>(null);

  const { data: detailData, isLoading: loadingDetails } = useQuery({
    queryKey: ["allocation-detail", licenseNumber],
    queryFn: () => fetchAllocationDetail(licenseNumber!),
    enabled: !!licenseNumber && open,
  });

  const { data: sessionsData, isLoading: loadingSessions } = useQuery({
    queryKey: ["session-details", licenseNumber],
    queryFn: () => fetchSessionDetails(licenseNumber!),
    enabled: !!licenseNumber && open,
  });

  const updateMutation = useMutation({
    mutationFn: updateAllocation,
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "Success", description: "Allocation updated successfully" });
        setEditMode(false);
        onUpdate();
      } else {
        toast({ title: "Error", description: result.error || "Update failed", variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update allocation", variant: "destructive" });
    },
  });

  const detail = detailData?.data;
  const sessions = sessionsData?.data?.sessions || [];
  const allocation = detail?.allocation;
  const apiStudent = detail?.api_student;
  const performance = detail?.performance;
  const improvements = detail?.improvements || [];

  const handleEdit = () => {
    setFormData({
      license_no: licenseNumber!,
      student_first_name: allocation?.student_first_name || "",
      student_last_name: allocation?.student_last_name || "",
      student_email: allocation?.student_email || "",
      student_phone: allocation?.student_phone || "",
      comms_workflow_consent: allocation?.comms_workflow_consent ?? false,
    });
    setEditMode(true);
  };

  const handleSave = () => { if (formData) updateMutation.mutate(formData); };

  const handleInputChange = (field: keyof UpdateAllocationPayload, value: string | boolean) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  return (
    <Dialog open={open} onOpenChange={() => { setEditMode(false); onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-3">
              Licence Details
              {licenseNumber && (
                <Badge variant="outline" className="font-mono text-xs px-2.5 py-1">{licenseNumber}</Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Quick status badges */}
          {detail && (
            <div className="flex items-center gap-2 mt-3">
              <Badge className={detail.license.activation_status === "started" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : ""} variant={detail.license.activation_status === "started" ? undefined : "outline"}>
                {detail.license.activation_status === "started" ? "Activated" : "Not Activated"}
              </Badge>
              <Badge className={detail.license.usage_status === "started" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : ""} variant={detail.license.usage_status === "started" ? undefined : "outline"}>
                {detail.license.usage_status === "started" ? "In Use" : "Not Used"}
              </Badge>
              {performance && performance.total_sessions > 0 && (
                <Badge variant="outline">{performance.total_sessions} mock interview{performance.total_sessions > 1 ? "s" : ""}</Badge>
              )}
            </div>
          )}
        </div>

        {loadingDetails ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : !detail ? (
          <div className="text-center py-12 text-muted-foreground">Licence not found</div>
        ) : (
          <Tabs defaultValue="details" className="w-full">
            <div className="px-6 pt-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="sessions">Mock Interviews ({sessions.length})</TabsTrigger>
              </TabsList>
            </div>

            {/* Details Tab */}
            <TabsContent value="details" className="px-6 pb-6 space-y-5 mt-2">
              {editMode && formData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input value={formData.student_first_name || ""} onChange={(e) => handleInputChange("student_first_name", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input value={formData.student_last_name || ""} onChange={(e) => handleInputChange("student_last_name", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={formData.student_email || ""} onChange={(e) => handleInputChange("student_email", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input value={formData.student_phone || ""} onChange={(e) => handleInputChange("student_phone", e.target.value)} />
                    </div>
                  </div>
                  <div className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Communication Consent</Label>
                      <Switch checked={formData.comms_workflow_consent || false} onCheckedChange={(v) => handleInputChange("comms_workflow_consent", v)} />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      I consent to the student receiving emails and messages regarding the AI Visa Tutor platform only. No other kind of communication will be sent to the student.
                    </p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={updateMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      {updateMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* License Info */}
                  <div>
                    <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                      <GraduationCap className="h-4 w-4" /> Licence Information
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 border rounded-lg px-4">
                      <InfoRow label="Start Date" value={detail.license.start_date} icon={<Calendar className="h-3.5 w-3.5" />} />
                      <InfoRow label="Activation Date" value={detail.license.activation_start_date || "—"} icon={<Calendar className="h-3.5 w-3.5" />} />
                      <InfoRow label="End Date" value={detail.license.end_date} icon={<Calendar className="h-3.5 w-3.5" />} />
                    </div>
                  </div>

                  {/* Allocation */}
                  {allocation ? (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <User className="h-4 w-4" /> Allocated Student
                        </h3>
                        <Button variant="outline" size="sm" onClick={handleEdit}>Edit</Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 border rounded-lg px-4">
                        <InfoRow label="Name" value={`${allocation.student_first_name} ${allocation.student_last_name}`} icon={<User className="h-3.5 w-3.5" />} />
                        <InfoRow label="Email" value={allocation.student_email} icon={<Mail className="h-3.5 w-3.5" />} />
                        <InfoRow label="Phone" value={allocation.student_phone || "—"} icon={<Phone className="h-3.5 w-3.5" />} />
                        <InfoRow label="Consent" value={allocation.comms_workflow_consent ? <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Yes</span> : <span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5 text-red-500" /> No</span>} />
                        <InfoRow label="Allocated On" value={allocation.allocated_at} icon={<Calendar className="h-3.5 w-3.5" />} />
                      </div>
                    </div>
                  ) : (
                    <Card className="border-dashed border-2 border-muted-foreground/25">
                      <CardContent className="py-6 text-center text-muted-foreground text-sm">
                        Not yet allocated via this portal.
                      </CardContent>
                    </Card>
                  )}

                  {/* API Student */}
                  {apiStudent && (
                    <div>
                      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                        <Globe className="h-4 w-4" /> VisaMonk Student Data
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 border rounded-lg px-4">
                        <InfoRow label="Name" value={`${apiStudent.first_name} ${apiStudent.last_name}`} />
                        <InfoRow label="Email" value={apiStudent.email} />
                        <InfoRow label="University" value={apiStudent.university} />
                        <InfoRow label="Target Country" value={apiStudent.target_country} />
                        <InfoRow label="Degree" value={apiStudent.target_degree} />
                        <InfoRow label="Intake" value={apiStudent.target_intake} />
                        <InfoRow label="Visa Status" value={apiStudent.visa_status ? <Badge variant="outline">{apiStudent.visa_status}</Badge> : "—"} icon={<Shield className="h-3.5 w-3.5" />} />
                        <InfoRow label="Interview Date" value={apiStudent.visa_interview_date} icon={<Calendar className="h-3.5 w-3.5" />} />
                        <InfoRow label="Interview Status" value={apiStudent.visa_interview_status ? <Badge variant="outline">{apiStudent.visa_interview_status}</Badge> : "—"} />
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="px-6 pb-6 space-y-5 mt-2">
              {performance && performance.total_sessions > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <ScoreCard label="Avg Overall" value={performance.avg_overall_score} large />
                    <ScoreCard label="Best Overall" value={performance.best_overall_score} large />
                    <ScoreCard label="Communication" value={performance.avg_communication_score} />
                    <ScoreCard label="Body Language" value={performance.avg_body_language_score} />
                  </div>

                  {improvements.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                        <TrendingUp className="h-4 w-4" /> Score Improvements
                      </h3>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Metric</TableHead>
                              <TableHead className="text-center">First</TableHead>
                              <TableHead className="text-center">Latest</TableHead>
                              <TableHead className="text-center">Best</TableHead>
                              <TableHead className="text-center">Change</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {improvements.map((imp) => (
                              <TableRow key={imp.metric}>
                                <TableCell className="capitalize font-medium">{imp.metric === "visa" ? "Visa Readiness" : imp.metric.replace(/_/g, " ")}</TableCell>
                                <TableCell className="text-center">{imp.first_score}</TableCell>
                                <TableCell className="text-center">{imp.latest_score}</TableCell>
                                <TableCell className="text-center font-medium">{imp.best_score}</TableCell>
                                <TableCell className="text-center">
                                  <Badge className={imp.improvement_pct > 0 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : ""}>
                                    {imp.improvement_pct > 0 ? "+" : ""}{imp.improvement_pct.toFixed(1)}%
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No performance data yet</p>
                  <p className="text-sm mt-1">Student needs to complete mock interviews first.</p>
                </div>
              )}
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions" className="px-6 pb-6 mt-2">
              {loadingSessions ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No mock interviews found</div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Round</TableHead>
                        <TableHead className="text-center">Overall</TableHead>
                        <TableHead className="text-center">Communication</TableHead>
                        <TableHead className="text-center">Body Language</TableHead>
                        <TableHead className="text-center">Visa Readiness</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((session: SessionData) => {
                        const getColor = (s: number | null | undefined) =>
                          s == null ? "text-muted-foreground" : s >= 80 ? "text-green-600" : s >= 60 ? "text-yellow-600" : "text-red-600";
                        return (
                          <TableRow key={session.session_id}>
                            <TableCell className="whitespace-nowrap">
                              {session.session_date ? format(new Date(session.session_date), "MMM dd, yyyy") : "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{session.round || "—"}</TableCell>
                            <TableCell className={`text-center font-medium ${getColor(session.scores?.overall)}`}>
                              {session.scores?.overall ?? "—"}
                            </TableCell>
                            <TableCell className={`text-center ${getColor(session.scores?.communication)}`}>
                              {session.scores?.communication ?? "—"}
                            </TableCell>
                            <TableCell className={`text-center ${getColor(session.scores?.body_language)}`}>
                              {session.scores?.body_language ?? "—"}
                            </TableCell>
                            <TableCell className={`text-center ${getColor(session.scores?.visa)}`}>
                              {session.scores?.visa ?? "—"}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={session.status === "pass" ? "default" : "outline"}>
                                {session.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
