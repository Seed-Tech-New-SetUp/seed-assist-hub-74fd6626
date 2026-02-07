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
import { UserPlus } from "lucide-react";
import { createAllocation, updateAllocation, CreateAllocationPayload } from "@/lib/api/visa-tutor";

interface AssignLicenseModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prefillLicenseNo?: string;
}

export function AssignLicenseModal({ open, onClose, onSuccess, prefillLicenseNo }: AssignLicenseModalProps) {
  const { toast } = useToast();
  const [form, setForm] = useState<CreateAllocationPayload>({
    license_no: prefillLicenseNo || "",
    student_first_name: "",
    student_last_name: "",
    student_email: "",
    student_phone: "",
    comms_workflow_consent: false,
  });

  const mutation = useMutation({
    mutationFn: async (payload: CreateAllocationPayload) => {
      const result = await createAllocation(payload);
      // If already allocated but not activated, auto-retry with PUT
      if (!result.success && typeof result.error === "string" && result.error.toLowerCase().includes("already allocated")) {
        const updateResult = await updateAllocation({
          license_no: payload.license_no,
          student_first_name: payload.student_first_name,
          student_last_name: payload.student_last_name,
          student_email: payload.student_email,
          student_phone: payload.student_phone,
          comms_workflow_consent: payload.comms_workflow_consent,
        });
        return updateResult;
      }
      return result;
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "Success", description: result.message || "License allocated successfully" });
        resetForm();
        onSuccess();
      } else {
        toast({ title: "Allocation Failed", description: result.error || "Failed to allocate license", variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to allocate license", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm({
      license_no: "",
      student_first_name: "",
      student_last_name: "",
      student_email: "",
      student_phone: "",
      comms_workflow_consent: false,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.license_no.trim() || !form.student_first_name.trim() || !form.student_email.trim()) {
      toast({ title: "Validation Error", description: "License number, first name, and email are required.", variant: "destructive" });
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

  useEffect(() => {
    if (prefillLicenseNo) {
      setForm((prev) => ({ ...prev, license_no: prefillLicenseNo }));
    }
  }, [prefillLicenseNo]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign License
          </DialogTitle>
          <DialogDescription>
            Assign a license to a student. Already-allocated but not-yet-activated licenses can be reassigned.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="license_no">License Number *</Label>
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

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="consent" className="text-sm font-medium">Communication Consent</Label>
              <p className="text-xs text-muted-foreground">Allow sending notifications to the student</p>
            </div>
            <Switch
              id="consent"
              checked={form.comms_workflow_consent || false}
              onCheckedChange={(checked) => updateField("comms_workflow_consent", checked)}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Assigning..." : "Assign License"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
