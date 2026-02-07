import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, Upload } from "lucide-react";

interface AssignOptionsModalProps {
  open: boolean;
  onClose: () => void;
  onSingleAssign: () => void;
  onBulkAssign: () => void;
}

export function AssignOptionsModal({ open, onClose, onSingleAssign, onBulkAssign }: AssignOptionsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Licences</DialogTitle>
          <DialogDescription>
            Choose how you'd like to assign licences to students.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 pt-2">
          <Button
            variant="outline"
            className="h-auto py-4 px-5 justify-start gap-4 text-left"
            onClick={() => { onClose(); onSingleAssign(); }}
          >
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Single Assign</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assign one licence to a student manually
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 px-5 justify-start gap-4 text-left"
            onClick={() => { onClose(); onBulkAssign(); }}
          >
            <div className="p-2 rounded-lg bg-green-600/10 text-green-600 shrink-0">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Bulk Assign</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Download template, fill in student details, and upload to assign multiple licences at once
              </p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
