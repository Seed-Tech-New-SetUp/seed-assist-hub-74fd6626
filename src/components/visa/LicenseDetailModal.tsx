import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { User, GraduationCap, Globe, Save, TrendingUp, BarChart3 } from "lucide-react";
import {
  fetchAllocationDetail,
  fetchSessionDetails,
  updateAllocation,
  type UpdateAllocationPayload,
  type SessionData,
  type AllocationDetailResponse,
} from "@/lib/api/visa-tutor";

interface LicenseDetailModalProps {
  licenseNumber: string | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function LicenseDetailModal({
  licenseNumber, open, onClose, onUpdate,
}: LicenseDetailModalProps) {
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

  const handleSave = () => {
    if (formData) updateMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof UpdateAllocationPayload, value: string | boolean) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const getScoreColor = (score: number | null | undefined) => {
    if (score == null) return "text-muted-foreground";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Dialog open={open} onOpenChange={() => { setEditMode(false); onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            License Details
            {licenseNumber && (
              <Badge variant="outline" className="font-mono">{licenseNumber}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {loadingDetails ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : !detail ? (
          <div className="text-center py-8 text-muted-foreground">License not found</div>
        ) : (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="sessions">Sessions ({sessions.length})</TabsTrigger>
            </TabsList>

            {/* ─── Details Tab ─── */}
            <TabsContent value="details" className="space-y-4 mt-4">
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
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label>Communication Consent</Label>
                    <Switch
                      checked={formData.comms_workflow_consent || false}
                      onCheckedChange={(v) => handleInputChange("comms_workflow_consent", v)}
                    />
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
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" /> License Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Sub Partner:</span> {detail.license.sub_partner_id}</div>
                      <div><span className="text-muted-foreground">Activation:</span> <Badge variant="outline">{detail.license.activation_status}</Badge></div>
                      <div><span className="text-muted-foreground">Usage:</span> <Badge variant="outline">{detail.license.usage_status}</Badge></div>
                      <div><span className="text-muted-foreground">Start:</span> {detail.license.start_date}</div>
                      <div><span className="text-muted-foreground">End:</span> {detail.license.end_date}</div>
                      <div><span className="text-muted-foreground">Alloted To:</span> {detail.license.alloted_to || "—"}</div>
                    </CardContent>
                  </Card>

                  {/* Allocation (partner-side) */}
                  {allocation ? (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <User className="h-4 w-4" /> Allocated Student
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-muted-foreground">Name:</span> {allocation.student_first_name} {allocation.student_last_name}</div>
                        <div><span className="text-muted-foreground">Email:</span> {allocation.student_email}</div>
                        <div><span className="text-muted-foreground">Phone:</span> {allocation.student_phone || "—"}</div>
                        <div><span className="text-muted-foreground">Consent:</span> {allocation.comms_workflow_consent ? "Yes" : "No"}</div>
                        <div><span className="text-muted-foreground">Allocated:</span> {allocation.allocated_at}</div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-dashed border-2 border-muted-foreground/25">
                      <CardContent className="py-6 text-center text-muted-foreground text-sm">
                        Not yet allocated via this portal.
                      </CardContent>
                    </Card>
                  )}

                  {/* API Student (VisaMonk registration data) */}
                  {apiStudent && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Globe className="h-4 w-4" /> VisaMonk Student Data
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-muted-foreground">Name:</span> {apiStudent.first_name} {apiStudent.last_name}</div>
                        <div><span className="text-muted-foreground">Email:</span> {apiStudent.email}</div>
                        <div><span className="text-muted-foreground">University:</span> {apiStudent.university || "—"}</div>
                        <div><span className="text-muted-foreground">Country:</span> {apiStudent.target_country || "—"}</div>
                        <div><span className="text-muted-foreground">Degree:</span> {apiStudent.target_degree || "—"}</div>
                        <div><span className="text-muted-foreground">Intake:</span> {apiStudent.target_intake || "—"}</div>
                        <div><span className="text-muted-foreground">Visa Status:</span> {apiStudent.visa_status || "—"}</div>
                        <div><span className="text-muted-foreground">Interview:</span> {apiStudent.visa_interview_date || "—"}</div>
                      </CardContent>
                    </Card>
                  )}

                  {allocation && (
                    <div className="flex justify-end">
                      <Button onClick={handleEdit}>Edit Allocation</Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* ─── Performance Tab ─── */}
            <TabsContent value="performance" className="space-y-4 mt-4">
              {performance && performance.total_sessions > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <p className="text-xs text-muted-foreground">Avg Overall</p>
                        <p className={`text-2xl font-bold ${getScoreColor(performance.avg_overall_score)}`}>
                          {performance.avg_overall_score?.toFixed(1) ?? "—"}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <p className="text-xs text-muted-foreground">Best Overall</p>
                        <p className={`text-2xl font-bold ${getScoreColor(performance.best_overall_score)}`}>
                          {performance.best_overall_score ?? "—"}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <p className="text-xs text-muted-foreground">Communication</p>
                        <p className={`text-2xl font-bold ${getScoreColor(performance.avg_communication_score)}`}>
                          {performance.avg_communication_score?.toFixed(1) ?? "—"}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <p className="text-xs text-muted-foreground">Body Language</p>
                        <p className={`text-2xl font-bold ${getScoreColor(performance.avg_body_language_score)}`}>
                          {performance.avg_body_language_score?.toFixed(1) ?? "—"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {improvements.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" /> Score Improvements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Metric</TableHead>
                              <TableHead className="text-center">First</TableHead>
                              <TableHead className="text-center">Latest</TableHead>
                              <TableHead className="text-center">Best</TableHead>
                              <TableHead className="text-center">Improvement</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {improvements.map((imp) => (
                              <TableRow key={imp.metric}>
                                <TableCell className="capitalize font-medium">{imp.metric.replace(/_/g, " ")}</TableCell>
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
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>No performance data yet.</p>
                  <p className="text-sm mt-1">Student needs to complete mock interviews first.</p>
                </div>
              )}
            </TabsContent>

            {/* ─── Sessions Tab ─── */}
            <TabsContent value="sessions" className="mt-4">
              {loadingSessions ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No sessions found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Round</TableHead>
                      <TableHead className="text-center">Overall</TableHead>
                      <TableHead className="text-center">Communication</TableHead>
                      <TableHead className="text-center">Body Language</TableHead>
                      <TableHead className="text-center">Visa</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session: SessionData) => (
                      <TableRow key={session.session_id}>
                        <TableCell className="whitespace-nowrap">
                          {session.session_date ? format(new Date(session.session_date), "MMM dd, yyyy") : "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{session.round || "—"}</TableCell>
                        <TableCell className={`text-center font-medium ${getScoreColor(session.scores?.overall)}`}>
                          {session.scores?.overall ?? "—"}
                        </TableCell>
                        <TableCell className={`text-center ${getScoreColor(session.scores?.communication)}`}>
                          {session.scores?.communication ?? "—"}
                        </TableCell>
                        <TableCell className={`text-center ${getScoreColor(session.scores?.body_language)}`}>
                          {session.scores?.body_language ?? "—"}
                        </TableCell>
                        <TableCell className={`text-center ${getScoreColor(session.scores?.visa)}`}>
                          {session.scores?.visa ?? "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={session.status === "pass" ? "default" : "outline"}>
                            {session.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
