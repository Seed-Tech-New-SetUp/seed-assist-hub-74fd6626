import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { User, Calendar, GraduationCap, Globe, Save } from "lucide-react";
import {
  fetchLicenseDetails,
  fetchSessionDetails,
  reassignLicense,
  ReassignPayload,
  SessionDetails,
} from "@/lib/api/visa-tutor";

interface LicenseDetailModalProps {
  licenseNumber: string | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function LicenseDetailModal({
  licenseNumber,
  open,
  onClose,
  onUpdate,
}: LicenseDetailModalProps) {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<ReassignPayload | null>(null);

  const { data: licenseData, isLoading: loadingDetails } = useQuery({
    queryKey: ["license-details", licenseNumber],
    queryFn: () => fetchLicenseDetails(licenseNumber!),
    enabled: !!licenseNumber && open,
  });

  const { data: sessionsData, isLoading: loadingSessions } = useQuery({
    queryKey: ["session-details", licenseNumber],
    queryFn: () => fetchSessionDetails(licenseNumber!),
    enabled: !!licenseNumber && open,
  });

  const reassignMutation = useMutation({
    mutationFn: reassignLicense,
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "Success", description: "License updated successfully" });
        setEditMode(false);
        onUpdate();
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update license", variant: "destructive" });
    },
  });

  const license = licenseData?.data;
  const sessions = sessionsData?.data || [];
  
  // Check if license is unassigned (no student data)
  const isUnassigned = !license?.student_name && !license?.email;

  const handleEdit = () => {
    if (license) {
      setFormData({
        license_number: license.license_number,
        first_name: license.first_name || "",
        last_name: license.last_name || "",
        email: license.email || "",
        mobile: license.mobile || "",
        target_degree: license.target_degree || "",
        visa_status: license.visa_status || "",
        visa_interview_date: license.visa_interview_date || "",
        university: license.university || "",
        target_country: license.target_country || "",
        target_intake: license.target_intake || "",
      });
      setEditMode(true);
    }
  };

  const handleSave = () => {
    if (formData) {
      reassignMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof ReassignPayload, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const getSessionStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case "no_show":
        return <Badge className="bg-yellow-100 text-yellow-800">No Show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            License Details
            {licenseNumber && (
              <Badge variant="outline" className="font-mono">
                {licenseNumber}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {loadingDetails ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : !license ? (
          <div className="text-center py-8 text-muted-foreground">
            License not found
          </div>
        ) : (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Student Details</TabsTrigger>
              <TabsTrigger value="sessions">
                Sessions ({sessions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              {editMode && formData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        value={formData.first_name || ""}
                        onChange={(e) => handleInputChange("first_name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        value={formData.last_name || ""}
                        onChange={(e) => handleInputChange("last_name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mobile</Label>
                      <Input
                        value={formData.mobile || ""}
                        onChange={(e) => handleInputChange("mobile", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Target Degree</Label>
                      <Input
                        value={formData.target_degree || ""}
                        onChange={(e) => handleInputChange("target_degree", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Visa Status</Label>
                      <Select
                        value={formData.visa_status || ""}
                        onValueChange={(v) => handleInputChange("visa_status", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_applied">Not Applied</SelectItem>
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Visa Interview Date</Label>
                      <Input
                        type="date"
                        value={formData.visa_interview_date || ""}
                        onChange={(e) => handleInputChange("visa_interview_date", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>University</Label>
                      <Input
                        value={formData.university || ""}
                        onChange={(e) => handleInputChange("university", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Target Country</Label>
                      <Input
                        value={formData.target_country || ""}
                        onChange={(e) => handleInputChange("target_country", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Target Intake</Label>
                      <Input
                        value={formData.target_intake || ""}
                        onChange={(e) => handleInputChange("target_intake", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={reassignMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      {reassignMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              ) : isUnassigned ? (
                // Unassigned license - show prominent assign CTA
                <Card className="border-dashed border-2 border-muted-foreground/25">
                  <CardContent className="py-8 text-center space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">No Student Assigned</h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        This license is currently unassigned. Click below to assign it to a student.
                      </p>
                    </div>
                    <Button onClick={handleEdit} size="lg">
                      <User className="h-4 w-4 mr-2" />
                      Assign Student
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                // Assigned license - show student details
                <>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Student Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span>{" "}
                        {license.student_name || "—"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>{" "}
                        {license.email || "—"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mobile:</span>{" "}
                        {license.mobile || "—"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Target Degree:</span>{" "}
                        {license.target_degree || "—"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Academic Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">University:</span>{" "}
                        {license.university || "—"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Target Country:</span>{" "}
                        {license.target_country || "—"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Target Intake:</span>{" "}
                        {license.target_intake || "—"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Visa Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Visa Status:</span>{" "}
                        {license.visa_status || "—"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Interview Date:</span>{" "}
                        {license.visa_interview_date || "—"}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button onClick={handleEdit}>Edit Details</Button>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="sessions" className="mt-4">
              {loadingSessions ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sessions found for this license
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Tutor</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session: SessionDetails) => (
                      <TableRow key={session.session_id}>
                        <TableCell>
                          {session.session_date
                            ? format(new Date(session.session_date), "MMM dd, yyyy")
                            : "—"}
                        </TableCell>
                        <TableCell>{session.session_type || "—"}</TableCell>
                        <TableCell>
                          {session.duration_minutes
                            ? `${session.duration_minutes} min`
                            : "—"}
                        </TableCell>
                        <TableCell>{session.tutor_name || "—"}</TableCell>
                        <TableCell className="text-center">
                          {getSessionStatusBadge(session.status)}
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
