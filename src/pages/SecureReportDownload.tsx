import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Download, Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { extractFilenameFromHeader } from "@/lib/utils/download-filename";
import { format } from "date-fns";

interface EventData {
  event_id: string;
  name: string;
  city: string;
  date: string;
  venue_name: string;
  campus_event: number;
  campus_name: string | null;
  academic_season: string;
}

interface ReportApiResponse {
  success: boolean;
  data: {
    0: EventData;
    academic_season: string;
    assets: {
      logo_white: { filename: string; url: string };
      logo_dark: { filename: string | null; url: string };
      banner: { filename: string; url: string };
    };
  };
}

interface SecureReportDownloadProps {
  reportType: "virtual" | "in-person";
}

const API_BASE = "https://seedglobaleducation.com/api/assist";

export default function SecureReportDownload({ reportType }: SecureReportDownloadProps) {
  const { hashId } = useParams<{ hashId: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [reportData, setReportData] = useState<ReportApiResponse | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  const getInfoEndpointUrl = () => {
    return reportType === "in-person"
      ? `${API_BASE}/in-person-event/report_info.php`
      : `${API_BASE}/virtual-event/report_info.php`;
  };

  useEffect(() => {
    const fetchReportInfo = async () => {
      if (!hashId) return;
      
      try {
        const url = `${getInfoEndpointUrl()}?id=${hashId}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          setReportData(data);
        }
      } catch (error) {
        console.error("Error fetching report info:", error);
      } finally {
        setLoadingInfo(false);
      }
    };

    fetchReportInfo();
  }, [hashId, reportType]);

  const getEndpointUrl = () => {
    return reportType === "in-person"
      ? `${API_BASE}/in-person-event/report_download.php`
      : `${API_BASE}/virtual-event/report_download.php`;
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsDownloading(true);
    setErrorMessage("");

    try {
      const response = await fetch(getEndpointUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hash_id: hashId,
          email: email.trim(),
          password: password.trim(),
          report_type: reportType,
        }),
      });

      const contentType = response.headers.get("Content-Type") || "";
      
      if (contentType.includes("application/vnd.openxmlformats") || 
          contentType.includes("application/octet-stream") ||
          contentType.includes("application/vnd.ms-excel")) {
        const blob = await response.blob();
        const filename = extractFilenameFromHeader(response, "report.xlsx");
        
        toast.success("Download starting...");
        setShowModal(false);
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        setErrorMessage(data.message || "Verification failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Download error:", error);
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loadingInfo) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-white/60" />
          <p className="text-white/60 text-sm">Loading report...</p>
        </div>
      </div>
    );
  }

  const eventData = reportData?.data?.[0];
  const assets = reportData?.data?.assets;
  const academicSeason = reportData?.data?.academic_season;

  const formattedDate = eventData?.date 
    ? format(new Date(eventData.date), "d MMMM, yyyy")
    : "";

  const locationDisplay = eventData?.campus_event === 1 && eventData?.campus_name 
    ? eventData.campus_name 
    : eventData?.city;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Logo Header */}
      <header className="py-8 flex justify-center">
        {assets?.logo_white?.url && assets.logo_white.filename && (
          <img 
            src={assets.logo_white.url} 
            alt="Event Logo" 
            className="h-12 md:h-16 w-auto object-contain"
          />
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 pb-12">
        {/* Banner Image - Centered, 50% width, ~30vh height */}
        {assets?.banner?.url && assets.banner.filename && (
          <div className="w-full max-w-3xl mx-auto mb-8">
            <div className="w-[50%] mx-auto">
              <img 
                src={assets.banner.url} 
                alt={eventData?.name || "Event Banner"} 
                className="w-full h-[30vh] object-cover rounded-xl shadow-2xl shadow-black/50"
              />
            </div>
          </div>
        )}

        {/* Event Details - Clean Typography */}
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-white text-2xl md:text-3xl font-semibold tracking-tight">
            {eventData?.name}
            {locationDisplay && (
              <span className="text-white/70"> — {locationDisplay}</span>
            )}
          </h1>
          
          <div className="flex items-center justify-center gap-3 text-white/60 text-sm md:text-base">
            {formattedDate && <span>{formattedDate}</span>}
            {formattedDate && academicSeason && <span className="text-white/30">•</span>}
            {academicSeason && <span>{academicSeason}</span>}
          </div>

          {eventData?.venue_name && (
            <p className="text-white/40 text-sm">{eventData.venue_name}</p>
          )}
        </div>

        {/* Download Button */}
        <Button 
          onClick={() => setShowModal(true)}
          size="lg"
          className="h-14 px-10 text-base font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition-all duration-200"
        >
          <Download className="h-5 w-5 mr-3" />
          Download Report
        </Button>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-white/5">
        <p className="text-white/30 text-xs tracking-wider uppercase">
          © 2025 SEED Global Education
        </p>
      </footer>

      {/* Login Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white text-center">
              Verify Your Identity
            </DialogTitle>
            <DialogDescription className="text-center text-slate-400">
              Enter your credentials to download the report
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleDownload} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                  disabled={isDownloading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                  disabled={isDownloading}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-500"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Verify & Download
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Your credentials are encrypted and secure.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
