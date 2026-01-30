import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Download, Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { extractFilenameFromHeader } from "@/lib/utils/download-filename";
import { format } from "date-fns";

interface EventData {
  event_id: string;
  in_person_event_type_id?: string;
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

  const getDownloadEndpointUrl = () => {
    const eventTypeId = reportData?.data?.[0]?.in_person_event_type_id;
    // Use in-person endpoint for B001 (Campus Tour) and B004 (BSF)
    if (eventTypeId === "B001" || eventTypeId === "B004") {
      return `${API_BASE}/in-person-event/report_download.php`;
    }
    return `${API_BASE}/virtual-event/report_download.php`;
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
      const response = await fetch(getDownloadEndpointUrl(), {
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
      <div className="min-h-screen bg-[#1e3a5f] flex items-center justify-center">
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
    ? format(new Date(eventData.date), "dd MMMM, yyyy")
    : "";

  const locationDisplay = eventData?.campus_event === 1 && eventData?.campus_name 
    ? eventData.campus_name 
    : eventData?.city;

  return (
    <div className="min-h-screen bg-[#1e3a5f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Watermark - Left */}
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/4 w-[300px] h-[300px] opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("https://admin.seedglobaleducation.com/assets/img/seed-watermark.png")`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Background Watermark - Right */}
      <div 
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[300px] h-[300px] opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("https://admin.seedglobaleducation.com/assets/img/seed-watermark.png")`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      />

      {/* Main Card */}
      <Card className="relative z-10 bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header with Logo */}
        <div className="bg-[#1e3a5f] py-4 px-6 flex justify-center items-center gap-3">
          {assets?.logo_white?.url && assets.logo_white.filename && (
            <img 
              src={assets.logo_white.url} 
              alt="Event Logo" 
              className="h-10 w-auto object-contain"
            />
          )}
          {eventData?.name && (
            <>
              <div className="w-px h-8 bg-white/30" />
              <span className="text-[#f97316] font-bold text-sm uppercase tracking-tight">
                {eventData.name}
              </span>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Banner Image */}
          {assets?.banner?.url && assets.banner.filename && (
            <div className="mb-4">
              <img 
                src={assets.banner.url} 
                alt={eventData?.name || "Event Banner"} 
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Event Title */}
          <h2 className="text-slate-800 text-lg font-medium text-center mb-4">
            {eventData?.name}
            {locationDisplay && ` - ${locationDisplay}`}
          </h2>

          {/* Event Details Card */}
          <div className="bg-[#475569] rounded-lg px-6 py-4 mb-5 text-center">
            {formattedDate && (
              <p className="text-white text-sm font-medium">{formattedDate}</p>
            )}
            {eventData?.venue_name && (
              <p className="text-white text-sm font-medium">{eventData.venue_name}</p>
            )}
            {academicSeason && (
              <p className="text-white text-sm font-medium">{academicSeason}</p>
            )}
          </div>

          {/* Download Button */}
          <Button 
            onClick={() => setShowModal(true)}
            size="default"
            className="w-full h-11 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white rounded-md shadow-md transition-all duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>

        {/* Footer */}
        <div className="py-3 text-center border-t border-slate-100">
          <p className="text-slate-400 text-xs">
            © 2025 SEED Global Education
          </p>
        </div>
      </Card>

      {/* Login Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md bg-white border-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900 text-center">
              Verify Your Identity
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500">
              Enter your credentials to download the report
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleDownload} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                  disabled={isDownloading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                  disabled={isDownloading}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-semibold bg-emerald-500 hover:bg-emerald-400"
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

          <p className="text-center text-xs text-slate-400">
            Your credentials are encrypted and secure.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
