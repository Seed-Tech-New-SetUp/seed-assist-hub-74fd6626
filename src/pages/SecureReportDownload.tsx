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
import seedAssistLogoWhite from "@/assets/seed-assist-logo-white.png";

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

interface VirtualEventData {
  header: string;
  date: string;
  desktop_banner_url: string;
  youtube_url?: string;
  academic_season?: string;
  type?: string; // 'masterclass' or 'meetup'
}

interface SchoolLogo {
  school_logo: string;
}

interface DownloadInfo {
  client_name: string;
  timestamp: string;
}

interface InPersonReportApiResponse {
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

interface VirtualReportApiResponse {
  success: boolean;
  data: {
    0: VirtualEventData;
    academic_season: string;
  };
  schools?: SchoolLogo[];
  download_info?: DownloadInfo;
}

type ReportApiResponse = InPersonReportApiResponse | VirtualReportApiResponse;

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
    // Use in-person endpoint if reportType is in-person, otherwise use virtual endpoint
    if (reportType === "in-person") {
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
      const formData = new URLSearchParams();
      formData.append("hash_id", hashId || "");
      formData.append("email", email.trim());
      formData.append("password", password.trim());
      formData.append("report_type", reportType);
      
      // For virtual events, include the event type (masterclass/meetup)
      if (reportType === "virtual" && eventDetails?.eventType) {
        formData.append("event_type", eventDetails.eventType);
      }

      const response = await fetch(getDownloadEndpointUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const contentType = response.headers.get("Content-Type") || "";
      const contentDisposition = response.headers.get("Content-Disposition");
      
      // Debug: Log headers to verify CORS exposure
      console.log("Content-Disposition header:", contentDisposition);
      console.log("All exposed headers:", [...response.headers.entries()]);
      
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
        const errorCode = data.error?.code || "";
        
        // Handle specific error codes with user-friendly messages
        if (errorCode === "FORBIDDEN") {
          setErrorMessage("You do not have access to this event report.");
        } else if (errorCode === "UNAUTHORIZED" || errorCode === "INVALID_CREDENTIALS" || response.status === 401) {
          setErrorMessage("Invalid email or password. Please check your credentials.");
        } else {
          // Fallback to API message or generic error
          const errorMsg = data.error?.message || data.message || "Verification failed. Please try again.";
          setErrorMessage(errorMsg);
        }
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

  // Helper to check if this is a virtual event response (no assets property means virtual)
  const isVirtualEvent = (data: ReportApiResponse | null): data is VirtualReportApiResponse => {
    return data !== null && reportType === "virtual";
  };

  // Extract data based on report type
  const getEventDetails = () => {
    if (!reportData) return null;

    if (isVirtualEvent(reportData)) {
      // Virtual event (mreports) - data is at data.0
      const eventData = reportData.data?.[0] as VirtualEventData;
      return {
        name: eventData?.header || '',
        date: eventData?.date || '',
        bannerUrl: eventData?.desktop_banner_url 
          ? `https://admin.seedglobaleducation.com/assets/masterclass-images/main-banner/${eventData.desktop_banner_url}`
          : null,
        youtubeUrl: eventData?.youtube_url || null,
        schools: reportData.schools || [],
        downloadInfo: reportData.download_info || null,
        academicSeason: reportData.data?.academic_season || null,
        venue: null,
        eventType: eventData?.type || null, // 'masterclass' or 'meetup'
      };
    } else {
      // In-person event (reports)
      const eventData = reportData.data?.[0];
      const assets = reportData.data?.assets;
      return {
        name: eventData?.name || '',
        date: eventData?.date || '',
        bannerUrl: assets?.banner?.url || null,
        youtubeUrl: null,
        schools: [],
        downloadInfo: null,
        venue: eventData?.venue_name || null,
        academicSeason: reportData.data?.academic_season || null,
        locationDisplay: eventData?.campus_event === 1 && eventData?.campus_name 
          ? eventData.campus_name 
          : eventData?.city,
        eventType: null,
      };
    }
  };

  const eventDetails = getEventDetails();
  const formattedDate = eventDetails?.date 
    ? format(new Date(eventDetails.date), "dd MMMM, yyyy")
    : "";

  const formattedDownloadDate = eventDetails?.downloadInfo?.timestamp
    ? format(new Date(eventDetails.downloadInfo.timestamp), "EEEE, dd MMM yyyy")
    : "";

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
        <div className="bg-[#1e3a5f] py-5 px-6 flex justify-center items-center gap-4">
          <img 
            src={seedAssistLogoWhite} 
            alt="SEED Assist" 
            className="h-12 w-auto object-contain"
          />
          {reportType === "in-person" && eventDetails?.name && (
            <>
              <div className="w-px h-10 bg-white/30" />
              <span className="text-[#f97316] font-bold text-base uppercase tracking-tight">
                {eventDetails.name}
              </span>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Banner Image with School Logos Overlay (Virtual Events) */}
          {eventDetails?.bannerUrl && (
            <div className="mb-4 relative">
              <img 
                src={eventDetails.bannerUrl} 
                alt={eventDetails.name || "Event Banner"} 
                className="w-full h-auto rounded-lg shadow-md"
              />
              {/* School Logos Overlay for Virtual Events */}
              {eventDetails.schools && eventDetails.schools.length > 0 && (
                <div 
                  className={`absolute flex flex-wrap gap-2 ${
                    eventDetails.schools.length > 1 
                      ? 'top-[20%] left-[15%]' 
                      : 'top-[25%] left-[25%] md:top-[34%] md:left-[34%]'
                  }`}
                >
                  {eventDetails.schools.map((school, index) => (
                    <div 
                      key={index} 
                      className="bg-white p-2 rounded-lg"
                      style={{ width: eventDetails.schools.length > 1 ? '120px' : '160px' }}
                    >
                      <img 
                        src={`https://admin.seedglobaleducation.com/assets/img/school_logos/${school.school_logo}`}
                        alt="School Logo"
                        className="w-full h-auto"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Event Title */}
          <h4 className="text-slate-800 text-xl font-semibold text-center mb-2">
            {eventDetails?.name}
            {eventDetails && 'locationDisplay' in eventDetails && eventDetails.locationDisplay && 
              ` - ${eventDetails.locationDisplay}`
            }
          </h4>

          {/* Event Date */}
          {formattedDate && (
            <h5 className="text-slate-600 text-base font-medium text-center my-2">
              {formattedDate}
            </h5>
          )}

          {/* Last Downloaded Info (Virtual Events) */}
          {eventDetails?.downloadInfo && (
            <p className="text-slate-500 text-sm italic text-center mt-3">
              Report was last downloaded by {eventDetails.downloadInfo.client_name} on {formattedDownloadDate}
            </p>
          )}

          {/* Event Details Card (In-Person Events Only) */}
          {reportType === "in-person" && (eventDetails?.venue || eventDetails?.academicSeason) && (
            <div className="bg-[#475569] rounded-lg px-6 py-4 my-4 text-center">
              {eventDetails.venue && (
                <p className="text-white text-sm font-medium">{eventDetails.venue}</p>
              )}
              {eventDetails.academicSeason && (
                <p className="text-white text-sm font-medium">{eventDetails.academicSeason}</p>
              )}
            </div>
          )}

          <hr className="border-slate-200 mb-5" />

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-3 justify-center">
            <Button 
              onClick={() => setShowModal(true)}
              size="default"
              className="flex-1 h-11 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white rounded-md shadow-md transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>

            {eventDetails?.youtubeUrl && (
              <a 
                href={eventDetails.youtubeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button 
                  variant="destructive"
                  size="default"
                  className="w-full h-11 text-sm font-semibold"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  Youtube Link
                </Button>
              </a>
            )}
          </div>
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
