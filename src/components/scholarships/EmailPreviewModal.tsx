 import { useState } from "react";
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { Badge } from "@/components/ui/badge";
 import { Mail, Send, X } from "lucide-react";
 
 export type EmailStatus = "shortlisted" | "rejected" | "onHold" | "selected";
 
 export interface EmailTemplateData {
   studentName: string;
   scholarshipName: string;
   schoolName: string;
   clientName: string;
   awardName?: string;
 }
 
 interface EmailTemplate {
   subject: string;
   body: string;
 }
 
 function getEmailTemplate(status: EmailStatus, data: EmailTemplateData): EmailTemplate | null {
   const templates: Record<EmailStatus, EmailTemplate> = {
     shortlisted: {
       subject: `Congratulations! You Have Been Shortlisted for the ${data.scholarshipName}`,
       body: `Dear ${data.studentName},
 
 Congratulations! We're pleased to inform you that you have been shortlisted for the ${data.scholarshipName} offered by ${data.schoolName}.
 
 What's Next?
 
 • Submit Your Application: Please apply to ${data.schoolName} before the application deadline. Ensure you use the same email address as your scholarship application.
 
 • Already Applied? If you have already submitted your application, please get in touch with your Dedicated SEED Relationship Manager and share your program application details.
 
 Award Announcement:
 Scholarship recipients will be announced by ${data.schoolName} after all applications have been evaluated.
 
 Important Note:
 Being shortlisted is an important milestone, but it does not guarantee a final award. The final decision rests solely with ${data.schoolName}.
 
 All scholarship amounts will be directly deducted from your tuition fee by the university.
 
 Congratulations once again! If you have any questions, please contact us at scholarships@seedglobaleducation.com
 
 Best regards,
 ${data.clientName}
 ${data.schoolName}`,
     },
     rejected: {
       subject: `Update on Your Scholarship Application`,
       body: `Dear ${data.studentName},
 
 Thank you for applying for the ${data.scholarshipName} offered by ${data.schoolName}. We truly appreciate the time and effort you invested in your application.
 
 After a thorough review, we regret to inform you that you have not been selected for a scholarship award in this cycle.
 
 While this news may be disappointing, please know that your interest in ${data.schoolName} is highly valued, and we encourage you to continue exploring future opportunities.
 
 Important Note: If you've already received an admission offer and/or a scholarship directly from the university, those awards are separate from the SEED scholarship and shall remain unchanged.
 
 If you have any questions, please contact us at scholarships@seedglobaleducation.com.
 
 Thank you once again for your interest in ${data.schoolName}. We wish you the very best in your academic journey.
 
 Best regards,
 ${data.clientName}
 ${data.schoolName}`,
     },
     onHold: {
       subject: `Update on Your Scholarship Application Status`,
       body: `Dear ${data.studentName},
 
 Thank you for applying for the ${data.scholarshipName} offered by ${data.schoolName}.
 
 Your application is being carefully reviewed, and we are pleased to inform you that your profile remains under consideration.
 
 Here's what this means for you:
 
 • You do not need to reapply or take any additional action at this time.
 
 • Final decisions will be communicated once the next round is completed.
 
 We appreciate your patience during this process and your continued interest in ${data.schoolName}.
 
 If you have any questions, please reach out to us at scholarships@seedglobaleducation.com.
 
 Thank you, and best of luck!
 
 Best regards,
 ${data.clientName}
 ${data.schoolName}`,
     },
     selected: {
       subject: `Congratulations on Winning the ${data.awardName || "Scholarship Award"}`,
       body: `Dear ${data.studentName},
 
 Congratulations! We're delighted to inform you that you have been awarded the ${data.awardName || "Scholarship Award"}.
 
 Your achievement marks an important step toward your academic journey, and we're thrilled to see the impact you will create.
 
 Important Notes:
 
 • This award has been granted by ${data.schoolName}.
 
 • The scholarship amount will be directly deducted from your tuition fees by the university.
 
 • ${data.schoolName} will reach out to you with further details.
 
 Congratulations once again on this well-deserved recognition!
 
 Best regards,
 ${data.clientName}
 ${data.schoolName}`,
     },
   };
 
   return templates[status] || null;
 }
 
 // Map workflow status to email status
 export function mapWorkflowToEmailStatus(workflowStatus: string): EmailStatus | null {
   const statusMap: Record<string, EmailStatus> = {
     shortlisted: "shortlisted",
     rejected: "rejected",
     onhold: "onHold",
     winner: "selected",
   };
   return statusMap[workflowStatus.toLowerCase()] || null;
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
   onConfirmSend: () => void;
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
   if (!status) return null;
 
   const template = getEmailTemplate(status, templateData);
 
   if (!template) return null;
 
   return (
     <Dialog open={open} onOpenChange={(open) => !isLoading && onOpenChange(open)}>
       <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
         <DialogHeader className="flex-shrink-0">
           <DialogTitle className="flex items-center gap-2">
             <Mail className="h-5 w-5 text-primary" />
             Email Preview
           </DialogTitle>
           <DialogDescription className="flex items-center gap-2">
             Review the email that will be sent to{" "}
             <span className="font-semibold">{selectedCount} applicant(s)</span>
             <Badge variant="outline" className={statusColors[status]}>
               {statusLabels[status]}
             </Badge>
           </DialogDescription>
         </DialogHeader>
 
         <div className="flex-1 overflow-hidden">
           <div className="space-y-4">
             {/* Subject Line */}
             <div className="rounded-lg border bg-muted/30 p-4">
               <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                 Subject
               </p>
               <p className="font-medium text-foreground">{template.subject}</p>
             </div>
 
             {/* Email Body */}
             <div className="rounded-lg border bg-muted/30">
               <div className="p-3 border-b bg-muted/50">
                 <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                   Email Body
                 </p>
               </div>
               <ScrollArea className="h-[300px]">
                 <div className="p-4">
                   <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                     {template.body}
                   </pre>
                 </div>
               </ScrollArea>
             </div>
 
             {/* Note */}
             <p className="text-xs text-muted-foreground text-center">
               Student names and details will be personalized for each recipient.
             </p>
           </div>
         </div>
 
         <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0">
           <Button
             variant="outline"
             onClick={onSkipEmail}
             disabled={isLoading}
           >
             <X className="h-4 w-4 mr-2" />
             Don't Send Email
           </Button>
           <Button onClick={onConfirmSend} disabled={isLoading}>
             <Send className="h-4 w-4 mr-2" />
             {isLoading ? "Sending..." : "Send Email"}
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 }