import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { bulkAllocations, type CreateAllocationPayload, type BulkAllocationResponse } from "@/lib/api/visa-tutor";
import * as XLSX from "xlsx";

interface LicenceForTemplate {
  license_number: string;
  isAllocated: boolean;
  isActivated: boolean;
  studentFirstName?: string;
  studentLastName?: string;
  studentEmail?: string;
  studentPhone?: string;
  commsConsent?: boolean;
}

interface BulkAssignModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  licences: LicenceForTemplate[];
}

export function BulkAssignModal({ open, onClose, onSuccess, licences }: BulkAssignModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadResult, setUploadResult] = useState<BulkAllocationResponse | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const mutation = useMutation({
    mutationFn: (allocations: CreateAllocationPayload[]) =>
      bulkAllocations({ allocations, on_conflict: "update" }),
    onSuccess: (result) => {
      console.log("[BulkAssign] API response:", JSON.stringify(result));
      setUploadResult(result);
      if (result.success) {
        toast({ title: "Bulk Assignment Complete", description: result.message || "Licences assigned successfully" });
        onSuccess();
      } else {
        toast({ title: "Bulk Assignment Failed", description: typeof result.error === "string" ? result.error : "Some assignments failed", variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to process bulk assignment", variant: "destructive" });
    },
  });

  const handleDownloadTemplate = () => {
    // Filter: all licences that are NOT activated
    const templateLicences = licences
      .filter(l => !l.isActivated)
      // Sort: allocated (but not activated) first, then unallocated
      .sort((a, b) => {
        if (a.isAllocated && !b.isAllocated) return -1;
        if (!a.isAllocated && b.isAllocated) return 1;
        return 0;
      });

    const instructionRows = [
      ["SEED AI Visa Tutor — Bulk Licence Assignment Template"],
      [""],
      ["INSTRUCTIONS:"],
      ["1. Fill in student details for each licence you want to assign."],
      ["2. Licences already allocated (but not activated) have existing student data pre-filled. Update these to reassign."],
      ["3. Leave rows blank (no email) to skip assignment for that licence."],
      ["4. Communication Consent: Enter YES or NO. Default is YES if left blank."],
      ["5. Save this file and upload it back in the Bulk Assign modal."],
      ["6. Email is required for each assignment. First Name is required."],
      [""],
    ];

    const headerRow = ["Licence Number", "First Name", "Last Name", "Email", "Phone", "Communication Consent"];

    const dataRows = templateLicences.map(l => [
      l.license_number,
      l.isAllocated ? (l.studentFirstName || "") : "",
      l.isAllocated ? (l.studentLastName || "") : "",
      l.isAllocated ? (l.studentEmail || "") : "",
      l.isAllocated ? (l.studentPhone || "") : "",
      "YES",
    ]);

    const ws = XLSX.utils.aoa_to_sheet([...instructionRows, headerRow, ...dataRows]);

    // Style column widths
    ws["!cols"] = [
      { wch: 22 }, // Licence Number
      { wch: 18 }, // First Name
      { wch: 18 }, // Last Name
      { wch: 30 }, // Email
      { wch: 18 }, // Phone
      { wch: 24 }, // Communication Consent
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Licence Assignments");
    XLSX.writeFile(wb, "SEED_Visa_Tutor_Bulk_Assign_Template.xlsx");

    toast({ title: "Template Downloaded", description: `${templateLicences.length} non-activated licences included in template` });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Find header row (look for "Licence Number" in first column)
        const headerIdx = rows.findIndex(r => r[0]?.toString().trim().toLowerCase().includes("licence number"));
        if (headerIdx === -1) {
          toast({ title: "Invalid Template", description: "Could not find the header row with 'Licence Number'. Please use the downloaded template.", variant: "destructive" });
          return;
        }

        const dataRows = rows.slice(headerIdx + 1);
        const allocations: CreateAllocationPayload[] = [];

        for (const row of dataRows) {
          const licenseNo = row[0]?.toString().trim();
          const firstName = row[1]?.toString().trim();
          const email = row[3]?.toString().trim();

          // Skip empty rows
          if (!licenseNo || !email) continue;

          if (!firstName) {
            toast({ title: "Validation Error", description: `Row with licence ${licenseNo}: First Name is required`, variant: "destructive" });
            return;
          }

          const consentVal = (row[5]?.toString().trim().toUpperCase() || "YES");
          const consent = consentVal !== "NO";

          // Sanitize phone: strip spaces, +, dashes, parentheses, dots
          const rawPhone = row[4]?.toString().trim() || "";
          const cleanPhone = rawPhone.replace(/[\s+\-().]/g, "");

          allocations.push({
            license_no: licenseNo,
            student_first_name: firstName,
            student_last_name: row[2]?.toString().trim() || "",
            student_email: email,
            student_phone: cleanPhone,
            comms_workflow_consent: consent,
          });
        }

        if (allocations.length === 0) {
          toast({ title: "No Data", description: "No valid rows found in the uploaded file. Ensure email is filled for rows you want to assign.", variant: "destructive" });
          return;
        }

        mutation.mutate(allocations);
      } catch {
        toast({ title: "Parse Error", description: "Could not read the uploaded file. Please use the XLSX template.", variant: "destructive" });
      }
    };
    reader.readAsArrayBuffer(file);

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    setUploadResult(null);
    setFileName("");
    onClose();
  };

  const nonActivatedCount = licences.filter(l => !l.isActivated).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Assign Licences
          </DialogTitle>
          <DialogDescription>
            Download the template with {nonActivatedCount} non-activated licences, fill in student details, and upload to assign in bulk.
            Already-allocated licences will have existing student data pre-filled for easy reassignment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Step 1: Download */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
              <p className="font-medium text-sm">Download Template</p>
            </div>
            <p className="text-xs text-muted-foreground pl-8">
              Get the Excel template with all non-activated licences. Allocated licences include existing student data.
            </p>
            <div className="pl-8">
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2">
                <Download className="h-4 w-4" /> Download Template ({nonActivatedCount} licences)
              </Button>
            </div>
          </div>

          {/* Step 2: Upload */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
              <p className="font-medium text-sm">Upload Filled Template</p>
            </div>
            <p className="text-xs text-muted-foreground pl-8">
              Fill in student details and upload the completed file. Rows without an email will be skipped.
            </p>
            <div className="pl-8">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={mutation.isPending}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {mutation.isPending ? "Processing..." : fileName ? `Re-upload` : "Upload Excel"}
              </Button>
              {fileName && !mutation.isPending && (
                <span className="text-xs text-muted-foreground ml-2">{fileName}</span>
              )}
            </div>
          </div>

          {/* Results */}
          {uploadResult && uploadResult.summary && (
            <div className="rounded-lg border p-4 space-y-2">
              <p className="font-medium text-sm">Results</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Created: {uploadResult.summary.created}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span>Updated: {uploadResult.summary.updated}</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Skipped: {uploadResult.summary.skipped}</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span>Failed: {uploadResult.summary.failed}</span>
                </div>
              </div>
              {uploadResult.results?.failed && uploadResult.results.failed.length > 0 && (
                <div className="text-xs text-destructive mt-2 space-y-1">
                  {uploadResult.results.failed.map((f: any, i: number) => {
                    const reason = f.reason
                      || (Array.isArray(f.errors) ? f.errors.map((e: any) => e.message || e.field).join("; ") : null)
                      || "Unknown error";
                    return (
                      <p key={i}>Row {f.row} ({f.license_no}): {reason}</p>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={handleClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
