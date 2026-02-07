import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, RefreshCcw } from "lucide-react";
import { createAllocation, updateAllocation, CreateAllocationPayload } from "@/lib/api/visa-tutor";

interface AssignLicenseModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prefillLicenseNo?: string;
  isReassign?: boolean;
  existingData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    consent?: boolean;
  };
}

export function AssignLicenseModal({ open, onClose, onSuccess, prefillLicenseNo, isReassign, existingData }: AssignLicenseModalProps) {
  const { toast } = useToast();
  const [form, setForm] = useState<CreateAllocationPayload>({
    license_no: "",
    student_first_name: "",
    student_last_name: "",
    student_email: "",
    student_phone: "",
    comms_workflow_consent: true,
  });

  const mutation = useMutation({
    mutationFn: async (payload: CreateAllocationPayload) => {
      if (isReassign) {
        // Directly use PUT for reassignment
        return updateAllocation({
          license_no: payload.license_no,
          student_first_name: payload.student_first_name,
          student_last_name: payload.student_last_name,
          student_email: payload.student_email,
          student_phone: payload.student_phone,
          comms_workflow_consent: payload.comms_workflow_consent,
        });
      }
      const result = await createAllocation(payload);
      // Fallback: if already allocated, auto-retry with PUT
      if (!result.success && typeof result.error === "string" && result.error.toLowerCase().includes("already allocated")) {
        return updateAllocation({
          license_no: payload.license_no,
          student_first_name: payload.student_first_name,
          student_last_name: payload.student_last_name,
          student_email: payload.student_email,
          student_phone: payload.student_phone,
          comms_workflow_consent: payload.comms_workflow_consent,
        });
      }
      return result;
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "Success", description: result.message || (isReassign ? "Licence reassigned successfully" : "Licence allocated successfully") });
        resetForm();
        onSuccess();
      } else {
        toast({ title: isReassign ? "Reassignment Failed" : "Allocation Failed", description: result.error || "Failed to allocate licence", variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to allocate licence", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm({
      license_no: "",
      student_first_name: "",
      student_last_name: "",
      student_email: "",
      student_phone: "",
      comms_workflow_consent: true,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.license_no.trim() || !form.student_first_name.trim() || !form.student_email.trim()) {
      toast({ title: "Validation Error", description: "Licence number, first name, and email are required.", variant: "destructive" });
      return;
    }
    mutation.mutate({
      ...form,
      license_no: form.license_no.trim(),
      student_first_name: form.student_first_name.trim(),
      student_last_name: form.student_last_name?.trim(),
      student_email: form.student_email.trim(),
      student_phone: form.student_phone?.trim(),
    });
  };

  const updateField = (field: keyof CreateAllocationPayload, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Sync prefill data when modal opens
  useEffect(() => {
    if (open && prefillLicenseNo) {
      setForm((prev) => ({
        ...prev,
        license_no: prefillLicenseNo,
        student_first_name: existingData?.firstName || "",
        student_last_name: existingData?.lastName || "",
        student_email: existingData?.email || "",
        student_phone: existingData?.phone || "",
        comms_workflow_consent: existingData?.consent ?? true,
      }));
    }
  }, [open, prefillLicenseNo, existingData]);

  const Icon = isReassign ? RefreshCcw : UserPlus;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {isReassign ? "Reassign Licence" : "Assign Licence"}
          </DialogTitle>
          <DialogDescription>
            {isReassign
              ? "Update the student assigned to this licence. The previous allocation will be replaced."
              : "Assign a licence to a student. Already-allocated but not-yet-activated licences can be reassigned."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="license_no">Licence Number *</Label>
            <Input
              id="license_no"
              value={form.license_no}
              onChange={(e) => updateField("license_no", e.target.value)}
              placeholder="e.g. 258W7YYBZ9LT8WJS"
              disabled={!!prefillLicenseNo}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={form.student_first_name}
                onChange={(e) => updateField("student_first_name", e.target.value)}
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={form.student_last_name || ""}
                onChange={(e) => updateField("student_last_name", e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.student_email}
                onChange={(e) => updateField("student_email", e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.student_phone || ""}
                onChange={(e) => updateField("student_phone", e.target.value)}
                placeholder="+919876543210"
              />
            </div>
          </div>

          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="consent" className="text-sm font-medium">Communication Consent</Label>
              <Switch
                id="consent"
                checked={form.comms_workflow_consent || false}
                onCheckedChange={(checked) => updateField("comms_workflow_consent", checked)}
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              I consent to the student receiving emails and messages regarding the AI Visa Tutor platform, including practice reminders, performance updates, and related follow-up communications. No other kind of communication will be sent to the student. This consent may be withdrawn at any time by updating this setting.
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (isReassign ? "Reassigning..." : "Assigning...") : (isReassign ? "Reassign Licence" : "Assign Licence")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
