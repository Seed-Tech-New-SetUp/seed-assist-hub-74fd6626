import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Download, ArrowLeft, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Mock data for reports - in production, this would come from the database
const reportsData: Record<string, {
  title: string;
  date: string;
  venue: string;
  season: string;
  image: string;
  type: string;
}> = {
  "bsf-nairobi-2025": {
    title: "Business School Festival - Nairobi",
    date: "22 October, 2025",
    venue: "Hyatt Regency Nairobi Westlands",
    season: "Fall - 2025",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
    type: "Festival",
  },
  "bsf-lagos-2025": {
    title: "Business School Festival - Lagos",
    date: "15 November, 2025",
    venue: "Eko Hotels & Suites",
    season: "Fall - 2025",
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&h=400&fit=crop",
    type: "Festival",
  },
  "meetup-mumbai-2025": {
    title: "MBA Meetup - Mumbai",
    date: "10 September, 2025",
    venue: "The Taj Mahal Palace",
    season: "Fall - 2025",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop",
    type: "Meetup",
  },
  "virtual-asia-2025": {
    title: "Virtual MBA Fair - Asia Pacific",
    date: "5 August, 2025",
    venue: "Online Event",
    season: "Summer - 2025",
    image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=400&fit=crop",
    type: "Virtual",
  },
};

export default function ReportDetail() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  
  const report = reportId ? reportsData[reportId] : null;

  if (!report) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Report Not Found</h2>
          <p className="text-muted-foreground mb-6">The report you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/10 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-4">
        <Card className="overflow-hidden shadow-lg">
          {/* Event Image */}
          <div className="relative">
            <img 
              src={report.image} 
              alt={report.title}
              className="w-full h-48 sm:h-64 object-cover"
            />
            <div className="absolute top-4 right-4">
              <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-full">
                {report.type}
              </span>
            </div>
          </div>

          {/* Event Details */}
          <div className="p-6 sm:p-8">
            <h1 className="text-xl sm:text-2xl font-display font-semibold text-foreground text-center mb-4">
              {report.title}
            </h1>
            
            <Separator className="mb-6" />

            {/* Info Box */}
            <div className="bg-muted rounded-lg p-5 mb-6 space-y-3">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{report.date}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{report.venue}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Tag className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{report.season}</span>
              </div>
            </div>

            {/* Download Button */}
            <Button className="w-full" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-sm mt-8 mb-8">
          Copyright © 2025 SEED Global Education
        </p>
      </div>
    </div>
  );
}
