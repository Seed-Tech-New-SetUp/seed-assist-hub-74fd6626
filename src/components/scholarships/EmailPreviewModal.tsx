 import { useState } from "react";
 import { useEffect } from "react";
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Badge } from "@/components/ui/badge";
 import { Mail, Send, X, RotateCcw } from "lucide-react";
 import { RichTextEditor } from "@/components/ui/rich-text-editor";
 
 export type EmailStatus = "shortlisted" | "rejected" | "onHold" | "selected";
 
 export interface EmailTemplateData {
   studentName: string;
   scholarshipName: string;
   schoolName: string;
   clientName: string;
   awardName?: string;
  universityName?: string;
 }
 
 interface EmailTemplate {
   subject: string;
   body: string;
 }
 
 function getEmailTemplate(status: EmailStatus, data: EmailTemplateData): EmailTemplate | null {
  const fullSchoolName = data.universityName
    ? `${data.universityName} - ${data.schoolName}`
    : data.schoolName;

   const templates: Record<EmailStatus, EmailTemplate> = {
     shortlisted: {
       subject: `Congratulations! You Have Been Shortlisted for the ${data.scholarshipName}`,
       body: `Dear ${data.studentName},
 
Congratulations! We're pleased to inform you that you have been shortlisted for the ${data.scholarshipName} offered by ${fullSchoolName}.

**What's Next?**
• Submit Your Application: Please apply to ${fullSchoolName} before the application deadline. Ensure you use the same email address as your scholarship application.
• Already Applied? If you have already submitted your application, please get in touch with your Dedicated SEED Relationship Manager and share your program application details.

**Award Announcement:**
Scholarship recipients will be announced by ${fullSchoolName} after all applications have been evaluated.

**Important Note:**
Being shortlisted is an important milestone, but it does not guarantee a final award. The final decision rests solely with ${fullSchoolName}.

All scholarship amounts will be directly deducted from your tuition fee by the university.

Congratulations once again! If you have any questions, please contact us at scholarships@seedglobaleducation.com

Best regards,
**${data.clientName}**
**${fullSchoolName}**`,
     },
     rejected: {
       subject: `Update on Your Scholarship Application`,
       body: `Dear ${data.studentName},
 
Thank you for applying for the ${data.scholarshipName} offered by ${fullSchoolName}. We truly appreciate the time and effort you invested in your application.

After a thorough review, we regret to inform you that you have not been selected for a scholarship award in this cycle.

While this news may be disappointing, please know that your interest in ${fullSchoolName} is highly valued, and we encourage you to continue exploring future opportunities.

**Important Note:** If you've already received an admission offer and/or a scholarship directly from the university, those awards are separate from the SEED scholarship and shall remain unchanged.

If you have any questions, please contact us at scholarships@seedglobaleducation.com.

Thank you once again for your interest in ${fullSchoolName}. We wish you the very best in your academic journey.

Best regards,
**${data.clientName}**
**${fullSchoolName}**`,
     },
     onHold: {
       subject: `Update on Your Scholarship Application Status`,
       body: `Dear ${data.studentName},
 
Thank you for applying for the ${data.scholarshipName} offered by ${fullSchoolName}.

Your application is being carefully reviewed, and we are pleased to inform you that your profile remains under consideration.

**Here's what this means for you:**
• You do not need to reapply or take any additional action at this time.
• Final decisions will be communicated once the next round is completed.

We appreciate your patience during this process and your continued interest in ${fullSchoolName}.

If you have any questions, please reach out to us at scholarships@seedglobaleducation.com.

Thank you, and best of luck!

Best regards,
**${data.clientName}**
**${fullSchoolName}**`,
     },
     selected: {
       subject: `Congratulations on Winning the ${data.awardName || "Scholarship Award"}`,
       body: `Dear ${data.studentName},
 
Congratulations! We're delighted to inform you that you have been awarded the ${data.awardName || "Scholarship Award"}.

Your achievement marks an important step toward your academic journey, and we're thrilled to see the impact you will create.

**Important Notes:**
• This award has been granted by ${fullSchoolName}.
• The scholarship amount will be directly deducted from your tuition fees by the university.
• ${fullSchoolName} will reach out to you with further details.

Congratulations once again on this well-deserved recognition!

Best regards,
**${data.clientName}**
**${fullSchoolName}**`,
     },
   };
 
   return templates[status] ?? null;
 }

 // Convert plain text to HTML for the rich text editor
 function textToHtml(text: string): string {
   return text
     .split("\n\n")
     .map((paragraph) => {
       // Check if it's a bullet point section
       if (paragraph.includes("• ")) {
         const lines = paragraph.split("\n");
         const listItems = lines
           .filter((line) => line.startsWith("• "))
           .map((line) => {
             let content = line.replace("• ", "");
             // Handle bold markers **text**
             content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
             return `<li>${content}</li>`;
           })
           .join("");
         const nonListLines = lines.filter((line) => !line.startsWith("• "));
         const prefix = nonListLines.length > 0 ? `<p>${nonListLines.join("<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>` : "";
         return `${prefix}<ul>${listItems}</ul>`;
       }
       // Handle bold markers **text**
       const withBold = paragraph.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
       return `<p>${withBold.replace(/\n/g, "<br>")}</p>`;
     })
     .join("");
 }
 
 // Map workflow status to email status
 export function mapWorkflowToEmailStatus(workflowStatus: string): EmailStatus | null {
  // Normalize the status by removing spaces, underscores, and converting to lowercase
  const normalized = workflowStatus.toLowerCase().replace(/[_\s-]/g, "");
  
  // Map all possible variations to email template statuses
  const statusMap: Record<string, EmailStatus> = {
    // Shortlisted variations
    shortlisted: "shortlisted",
    shortlist: "shortlisted",
    
    // Rejected variations
    rejected: "rejected",
    reject: "rejected",
    
    // On Hold variations
    onhold: "onHold",
    hold: "onHold",
    
    // Winner/Selected variations
    winner: "selected",
    selected: "selected",
    awarded: "selected",
    award: "selected",
  };
  
  return statusMap[normalized] || null;
 }
 
 const statusColors: Record<EmailStatus, string> = {
   shortlisted: "bg-green-500/10 text-green-600 border-green-500/20",
   rejected: "bg-red-500/10 text-red-600 border-red-500/20",
   onHold: "bg-orange-500/10 text-orange-600 border-orange-500/20",
   selected: "bg-purple-500/10 text-purple-600 border-purple-500/20",
 };
 
 const statusLabels: Record<EmailStatus, string> = {
   shortlisted: "Shortlisted",
   rejected: "Rejected",
   onHold: "On Hold",
   selected: "Winner",
 };
 
 interface EmailPreviewModalProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   status: EmailStatus | null;
   selectedCount: number;
   templateData: EmailTemplateData;
   isLoading?: boolean;
   onConfirmSend: (subject: string, body: string) => void;
   onSkipEmail: () => void;
 }
 
 export function EmailPreviewModal({
   open,
   onOpenChange,
   status,
   selectedCount,
   templateData,
   isLoading = false,
   onConfirmSend,
   onSkipEmail,
 }: EmailPreviewModalProps) {
   const [subject, setSubject] = useState("");
   const [bodyHtml, setBodyHtml] = useState("");
   const [originalSubject, setOriginalSubject] = useState("");
   const [originalBodyHtml, setOriginalBodyHtml] = useState("");

   // Initialize email content when modal opens or status changes
   useEffect(() => {
     if (open && status) {
       const template = getEmailTemplate(status, templateData);
       if (template) {
         const htmlBody = textToHtml(template.body);
         setSubject(template.subject);
         setBodyHtml(htmlBody);
         setOriginalSubject(template.subject);
         setOriginalBodyHtml(htmlBody);
       }
     }
   }, [open, status, templateData]);

   const handleReset = () => {
     setSubject(originalSubject);
     setBodyHtml(originalBodyHtml);
   };

   const hasChanges = subject !== originalSubject || bodyHtml !== originalBodyHtml;

   if (!status) return null;
 
   return (
     <Dialog open={open} onOpenChange={(open) => !isLoading && onOpenChange(open)}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
           <DialogTitle className="flex items-center gap-2">
             <Mail className="h-5 w-5 text-primary" />
             Compose Email
           </DialogTitle>
          <DialogDescription className="flex items-center gap-2 mt-1">
             Edit and send email to{" "}
             <span className="font-semibold">{selectedCount} applicant(s)</span>
             <Badge variant="outline" className={statusColors[status]}>
               {statusLabels[status]}
             </Badge>
           </DialogDescription>
         </DialogHeader>
 
        <div className="flex-1 overflow-hidden px-6 py-5">
          <div className="space-y-5 overflow-y-auto max-h-[calc(90vh-220px)] pr-1">
             {/* Subject Line */}
            <div className="space-y-2.5">
               <Label htmlFor="email-subject" className="text-sm font-medium">
                 Subject Line
               </Label>
               <Input
                 id="email-subject"
                 value={subject}
                 onChange={(e) => setSubject(e.target.value)}
                 placeholder="Enter email subject..."
                className="font-medium h-11"
               />
             </div>
 
             {/* Email Body */}
            <div className="space-y-2.5">
               <Label className="text-sm font-medium">Email Body</Label>
               <RichTextEditor
                 value={bodyHtml}
                 onChange={setBodyHtml}
                className="min-h-[320px] [&_.ProseMirror]:min-h-[280px] [&_.ProseMirror]:p-4"
               />
             </div>
 
             {/* Note */}
            <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground">
               <p className="font-medium mb-1">Personalization Note:</p>
               <p>
                 [Student Name], [Award Name], and other placeholders will be automatically
                 replaced with each recipient's actual details when the email is sent.
               </p>
             </div>
           </div>
         </div>
 
        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-2 px-6 py-4 border-t bg-muted/30">
           {hasChanges && (
             <Button
               variant="ghost"
               onClick={handleReset}
               disabled={isLoading}
               className="mr-auto"
             >
               <RotateCcw className="h-4 w-4 mr-2" />
               Reset
             </Button>
           )}
           <Button
             variant="outline"
             onClick={onSkipEmail}
             disabled={isLoading}
           >
             <X className="h-4 w-4 mr-2" />
             Don't Send Email
           </Button>
           <Button
             onClick={() => onConfirmSend(subject, bodyHtml)}
             disabled={isLoading || !subject.trim()}
           >
             <Send className="h-4 w-4 mr-2" />
             {isLoading ? "Sending..." : "Send Email"}
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 }