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
      <DialogContent className="max-w-md bg-background border shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">Assign Licences</DialogTitle>
          <DialogDescription>
            Choose how you'd like to assign licences to students.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 pt-2 pb-2">
          <button
            className="flex items-center gap-4 w-full rounded-lg border border-border bg-background p-4 text-left transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={() => { onClose(); onSingleAssign(); }}
          >
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Single Assign</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assign one licence to a student manually
              </p>
            </div>
          </button>

          <button
            className="flex items-center gap-4 w-full rounded-lg border border-border bg-background p-4 text-left transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={() => { onClose(); onBulkAssign(); }}
          >
            <div className="p-2.5 rounded-lg bg-green-600/10 text-green-600 shrink-0">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Bulk Assign</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Download template, fill in student details, and upload to assign multiple licences at once
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
