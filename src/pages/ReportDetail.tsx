import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Download, ArrowLeft, Tag, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface EventReport {
  id: string;
  title: string;
  event_date: string;
  venue: string;
  season: string;
  image_url: string | null;
  type: string;
  share_token: string;
}

export default function ReportDetail() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  
  const { data: report, isLoading, error } = useQuery({
    queryKey: ['report', reportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_reports')
        .select('*')
        .eq('share_token', reportId)
        .maybeSingle();
      
      if (error) throw error;
      return data as EventReport | null;
    },
    enabled: !!reportId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin text-primary relative" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-10 text-center shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
          <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-display font-semibold text-foreground mb-3">Report Not Found</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">The report you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate(-1)} variant="outline" size="lg" className="px-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const typeColors: Record<string, string> = {
    Festival: "bg-emerald-500 text-white",
    Meetup: "bg-amber-500 text-white",
    Virtual: "bg-violet-500 text-white",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Branded Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        {/* Logo/Brand Area */}
        <div className="relative z-10 flex flex-col items-center pb-8 pt-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-primary-foreground/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-primary-foreground/20">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-primary-foreground font-display font-bold text-xl tracking-tight">Event Report</h2>
              <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-widest">Official Document</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 -mt-2 pb-12">
        <Card className="overflow-hidden shadow-2xl border-0 bg-card">
          {/* Event Image with Overlay */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
            <img 
              src={report.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'} 
              alt={report.title}
              className="w-full h-56 sm:h-72 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Type Badge */}
            <div className="absolute top-4 right-4 z-20">
              <span className={`${typeColors[report.type] || 'bg-primary text-primary-foreground'} text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg backdrop-blur-sm`}>
                {report.type}
              </span>
            </div>

            {/* Decorative Corner Pattern */}
            <div className="absolute bottom-0 left-0 w-20 h-20 z-20">
              <svg viewBox="0 0 80 80" className="w-full h-full text-card">
                <path d="M0 80 L0 0 Q40 0 80 40 L80 80 Z" fill="currentColor" />
              </svg>
            </div>
            <div className="absolute bottom-0 right-0 w-20 h-20 z-20">
              <svg viewBox="0 0 80 80" className="w-full h-full text-card">
                <path d="M80 80 L80 0 Q40 0 0 40 L0 80 Z" fill="currentColor" />
              </svg>
            </div>
          </div>

          {/* Event Details */}
          <div className="p-6 sm:p-8 pt-4">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground text-center mb-1 leading-tight">
              {report.title}
            </h1>
            
            <div className="flex justify-center mb-6">
              <div className="h-1 w-16 bg-gradient-to-r from-primary/0 via-primary to-primary/0 rounded-full" />
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-br from-muted/80 to-muted rounded-2xl p-6 mb-6 border border-border/50">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Date</p>
                    <p className="text-sm font-semibold text-foreground">{format(new Date(report.event_date), 'd MMMM, yyyy')}</p>
                  </div>
                </div>
                
                <Separator className="bg-border/50" />
                
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Venue</p>
                    <p className="text-sm font-semibold text-foreground">{report.venue}</p>
                  </div>
                </div>
                
                <Separator className="bg-border/50" />
                
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Tag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Season</p>
                    <p className="text-sm font-semibold text-foreground">{report.season}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <Button 
              className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary" 
              size="lg"
            >
              <Download className="h-5 w-5 mr-3" />
              Download Report
            </Button>
          </div>
        </Card>

        {/* Footer */}
        <footer className="mt-10 text-center">
          <p className="text-muted-foreground/70 text-xs font-medium uppercase tracking-widest">
            © 2025 SEED Global Education
          </p>
        </footer>
      </main>
    </div>
  );
}
