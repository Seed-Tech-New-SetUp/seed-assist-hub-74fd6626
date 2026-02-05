import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Download, Loader2, Mail, Lock, AlertCircle, Calendar, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { extractFilenameFromHeader, buildMasterclassFallbackFilename } from "@/lib/utils/download-filename";
import { decodeObjectStrings, decodeUTF8 } from "@/lib/utils/decode-utf8";
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

interface MeetupSchoolLogo {
  school_id: string;
  school_logo: string;
  school_name: string;
}

interface DownloadInfo {
  client_name: string;
  timestamp: string;
}

interface MeetupEventData {
  id: number;
  header: string;
  slug: string;
  date: string;
  time: string;
  timezone: string;
  hs_event_record_id: string;
  reports_published: boolean;
  academic_season: string;
  banner_url?: string;
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

interface MeetupReportApiResponse {
  success: boolean;
  data: {
    meetup: MeetupEventData;
    last_download?: DownloadInfo;
    school_logos?: MeetupSchoolLogo[];
  };
}

type ReportApiResponse = InPersonReportApiResponse | VirtualReportApiResponse | MeetupReportApiResponse;

interface SecureReportDownloadProps {
  reportType: "virtual" | "in-person" | "meetup";
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
    if (reportType === "in-person") {
      return `${API_BASE}/in-person-event/report_info.php`;
    }
    if (reportType === "meetup") {
      return `${API_BASE}/virtual-event/meetup_report_info.php`;
    }
    return `${API_BASE}/virtual-event/report_info.php`;
  };

  useEffect(() => {
    const fetchReportInfo = async () => {
      if (!hashId) return;
      
      try {
        const url = `${getInfoEndpointUrl()}?id=${hashId}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          // Decode UTF-8 and HTML entities from the API response
          const decodedData = decodeObjectStrings(data);
          setReportData(decodedData);
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
    if (reportType === "in-person") {
      return `${API_BASE}/in-person-event/report_download.php`;
    }
    if (reportType === "meetup") {
      return `${API_BASE}/virtual-event/meetup_report_download.php`;
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
      
      if (contentType.includes("application/vnd.openxmlformats") || 
          contentType.includes("application/octet-stream") ||
          contentType.includes("application/vnd.ms-excel")) {
        const blob = await response.blob();
        
        // Build proper fallback filename based on report type
        let fallbackFilename = "report.xlsx";
        if (reportType === "virtual" && eventDetails?.date) {
          fallbackFilename = buildMasterclassFallbackFilename(eventDetails.date);
        } else if (reportType === "meetup" && eventDetails?.date && eventDetails?.name) {
          const date = new Date(eventDetails.date);
          const month = date.toLocaleString("en-US", { month: "long" });
          const day = date.getDate();
          const year = date.getFullYear();
          fallbackFilename = `SEED_Meetup_${month}_${day}_${year}.xlsx`;
        } else if (reportType === "in-person" && eventDetails?.date && eventDetails?.name) {
          const date = new Date(eventDetails.date);
          const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
          const sanitizedName = eventDetails.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
          fallbackFilename = `${sanitizedName}_${formattedDate}.xlsx`;
        }
        
        const filename = extractFilenameFromHeader(response, fallbackFilename);
        
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
        
        if (errorCode === "FORBIDDEN") {
          setErrorMessage("You do not have access to this event report.");
        } else if (errorCode === "UNAUTHORIZED" || errorCode === "INVALID_CREDENTIALS" || response.status === 401) {
          setErrorMessage("Invalid email or password. Please check your credentials.");
        } else {
          const errorMsg = data.error?.message || data.message || "Verification failed. Please try again.";
          setErrorMessage(decodeUTF8(errorMsg));
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
      <div className="min-h-screen bg-gradient-to-br from-[#0f2744] via-[#1e3a5f] to-[#0f2744] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-white/10 blur-xl animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin text-white/80 relative z-10" />
          </div>
          <p className="text-white/60 text-sm font-medium tracking-wide">Loading report...</p>
        </div>
      </div>
    );
  }

  // Helper to check if this is a virtual event response (masterclass)
  const isVirtualEvent = (data: ReportApiResponse | null): data is VirtualReportApiResponse => {
    return data !== null && reportType === "virtual";
  };

  // Helper to check if this is a meetup event response
  const isMeetupEvent = (data: ReportApiResponse | null): data is MeetupReportApiResponse => {
    return data !== null && reportType === "meetup";
  };

  // Extract data based on report type
  const getEventDetails = () => {
    if (!reportData) return null;

    if (isMeetupEvent(reportData)) {
      // Meetup-specific response structure - data is nested under 'data'
      const meetupData = reportData.data?.meetup;
      const schoolLogos = reportData.data?.school_logos || [];
      const lastDownload = reportData.data?.last_download || null;
      return {
        name: meetupData?.header || '',
        date: meetupData?.date || '',
        bannerUrl: meetupData?.banner_url 
          ? `https://admin.seedglobaleducation.com/assets/assets/meetup-images/banners/${meetupData.banner_url}`
          : null,
        youtubeUrl: null,
        schools: schoolLogos.map(s => ({ school_logo: s.school_logo })),
        meetupSchools: schoolLogos,
        downloadInfo: lastDownload,
        academicSeason: meetupData?.academic_season || null,
        venue: null,
        eventType: 'meetup',
      };
    }

    if (isVirtualEvent(reportData)) {
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
        eventType: eventData?.type || null,
      };
    } else {
      const eventData = (reportData as InPersonReportApiResponse).data?.[0];
      const assets = (reportData as InPersonReportApiResponse).data?.assets;
      return {
        name: eventData?.name || '',
        date: eventData?.date || '',
        bannerUrl: assets?.banner?.url || null,
        youtubeUrl: null,
        schools: [],
        downloadInfo: null,
        venue: eventData?.venue_name || null,
        academicSeason: (reportData as InPersonReportApiResponse).data?.academic_season || null,
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
    <div className="min-h-screen bg-gradient-to-br from-[#0f2744] via-[#1e3a5f] to-[#0f2744] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Watermarks */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] opacity-[0.03]"
          style={{
            backgroundImage: `url("https://admin.seedglobaleducation.com/assets/img/seed-watermark.png")`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        />
        <div 
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[400px] h-[400px] opacity-[0.03]"
          style={{
            backgroundImage: `url("https://admin.seedglobaleducation.com/assets/img/seed-watermark.png")`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        />
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-xl">
        {/* Glow effect behind card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-50" />
        
        <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          {/* Premium Header */}
          <div className="relative bg-gradient-to-r from-[#1e3a5f] via-[#2a4a73] to-[#1e3a5f] py-6 px-6">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            
            <div className="relative flex justify-center items-center gap-4">
              <img 
                src={seedAssistLogoWhite} 
                alt="SEED Assist" 
                className="h-12 w-auto object-contain drop-shadow-lg"
              />
              {reportType === "in-person" && eventDetails?.name && (
                <>
                  <div className="w-px h-10 bg-white/20" />
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span className="text-amber-400 font-bold text-sm uppercase tracking-wider">
                      Event Report
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Banner Image with elegant frame (for virtual/in-person) */}
            {eventDetails?.bannerUrl && (
              <div className="mb-6 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/30 to-blue-500/30 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={eventDetails.bannerUrl} 
                    alt={eventDetails.name || "Event Banner"} 
                    className="w-full h-auto transform transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  {/* School Logos Overlay */}
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
                          className="bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-lg"
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
              </div>
            )}

            {/* School Logos for Meetups (displayed standalone without banner) */}
            {reportType === "meetup" && eventDetails?.meetupSchools && eventDetails.meetupSchools.length > 0 && (
              <div className="mb-6 flex justify-center">
                <div className="flex flex-wrap justify-center gap-4">
                  {eventDetails.meetupSchools.map((school, index) => (
                    <div 
                      key={index} 
                      className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm"
                      style={{ width: eventDetails.meetupSchools.length > 1 ? '140px' : '180px' }}
                    >
                      <img 
                        src={`https://admin.seedglobaleducation.com/assets/img/school_logos/${school.school_logo}`}
                        alt={school.school_name || "School Logo"}
                        className="w-full h-auto"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event Title with elegant typography */}
            <div className="text-center mb-4">
              <h1 className="text-slate-800 text-xl md:text-2xl font-bold leading-tight">
                {eventDetails?.name}
                {eventDetails && 'locationDisplay' in eventDetails && eventDetails.locationDisplay && (
                  <span className="text-emerald-600"> — {eventDetails.locationDisplay}</span>
                )}
              </h1>
            </div>

            {/* Event Meta Info */}
            {(formattedDate || eventDetails?.venue) && (
              <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
                {formattedDate && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">{formattedDate}</span>
                  </div>
                )}
                {eventDetails?.venue && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">{eventDetails.venue}</span>
                  </div>
                )}
              </div>
            )}

            {/* Academic Season Badge */}
            {eventDetails?.academicSeason && (
              <div className="flex justify-center mb-4">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-sm">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  {eventDetails.academicSeason}
                </span>
              </div>
            )}

            {/* Last Downloaded Info */}
            {eventDetails?.downloadInfo && (
              <div className="bg-slate-50 rounded-lg px-4 py-3 mb-4 border border-slate-100">
                <p className="text-slate-500 text-xs text-center italic">
                  Last downloaded by <span className="font-medium text-slate-600">{eventDetails.downloadInfo.client_name}</span> on {formattedDownloadDate}
                </p>
              </div>
            )}

            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-5" />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => setShowModal(true)}
                size="lg"
                className="flex-1 h-12 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
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
                    size="lg"
                    className="w-full h-12 text-sm font-semibold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    Watch Recording
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="py-4 text-center border-t border-slate-100 bg-slate-50/50">
            <p className="text-slate-400 text-xs font-medium">
              © {new Date().getFullYear()} SEED Global Education
            </p>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md bg-white border-0 rounded-2xl shadow-2xl">
          <DialogHeader className="pb-2">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-inner">
                <Lock className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 text-center">
              Verify Your Identity
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 text-sm">
              Enter your credentials to access and download the report
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleDownload} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 text-sm font-medium">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 focus:bg-white transition-all"
                  disabled={isDownloading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 text-sm font-medium">
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 focus:bg-white transition-all"
                  disabled={isDownloading}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300"
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

          <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 mt-2">
            <Lock className="h-3 w-3" />
            Your credentials are encrypted and secure
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
