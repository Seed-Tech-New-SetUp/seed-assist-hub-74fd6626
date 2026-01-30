import { useState } from "react";
import { useParams } from "react-router-dom";
import { Download, Loader2, Mail, Lock, ShieldCheck, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type VerificationStatus = "idle" | "verifying" | "success" | "error";

export default function SecureReportDownload() {
  const { hashId } = useParams<{ hashId: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password");
      return;
    }

    setStatus("verifying");
    setErrorMessage("");

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch(`/api/reports/verify-download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hashId,
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (data.success && data.downloadUrl) {
        setStatus("success");
        toast.success("Verification successful! Your download will start shortly.");
        
        // Trigger auto-download
        setTimeout(() => {
          const link = document.createElement("a");
          link.href = data.downloadUrl;
          link.download = data.fileName || "report.xlsx";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, 1000);
      } else {
        setStatus("error");
        setErrorMessage(data.message || "Verification failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("error");
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col">
      {/* Branded Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
        
        {/* Logo/Brand Area */}
        <div className="relative z-10 flex flex-col items-center py-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary-foreground/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-primary-foreground/20">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-primary-foreground font-display font-bold text-xl tracking-tight">Secure Download</h2>
              <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-widest">SEED Global Education</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8 shadow-2xl border-0 bg-card">
          {status === "success" ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-2xl font-display font-semibold text-foreground mb-3">
                Verification Successful
              </h2>
              <p className="text-muted-foreground mb-6">
                Your download should start automatically. If it doesn't, click the button below.
              </p>
              <Button 
                size="lg" 
                className="gap-2"
                onClick={() => {
                  // Retry download
                  toast.info("Retrying download...");
                }}
              >
                <Download className="h-5 w-5" />
                Download Report
              </Button>
            </div>
          ) : (
            <>
              {/* Icon & Title */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                  Verify Your Identity
                </h1>
                <p className="text-muted-foreground text-sm">
                  Please enter your credentials to download the report
                </p>
              </div>

              {/* Error Message */}
              {status === "error" && errorMessage && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{errorMessage}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={status === "verifying"}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      disabled={status === "verifying"}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base font-semibold"
                  disabled={status === "verifying"}
                >
                  {status === "verifying" ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Verify & Download
                    </>
                  )}
                </Button>
              </form>

              {/* Security Note */}
              <p className="text-center text-xs text-muted-foreground mt-6">
                This is a secure download. Your credentials are encrypted.
              </p>
            </>
          )}
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-muted-foreground/70 text-xs font-medium uppercase tracking-widest">
          © 2025 SEED Global Education
        </p>
      </footer>
    </div>
  );
}
