import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  MapPin,
  Users,
  Download,
  Eye,
  Edit,
  Compass,
  Calendar,
  Building2,
  Star,
} from "lucide-react";

const campusTours = [
  {
    id: "1",
    schoolName: "Harvard Business School",
    tourDate: "Dec 10, 2024",
    location: "Boston, MA",
    participants: 24,
    rating: 4.9,
    status: "completed",
    guide: "Prof. Michael Chen",
    highlights: ["Baker Library Tour", "Case Study Classroom", "Alumni Panel"],
  },
  {
    id: "2",
    schoolName: "Stanford GSB",
    tourDate: "Dec 18, 2024",
    location: "Stanford, CA",
    participants: 0,
    rating: 0,
    status: "upcoming",
    guide: "Sarah Williams",
    highlights: ["Knight Management Center", "Innovation Lab", "Networking Lunch"],
  },
  {
    id: "3",
    schoolName: "Wharton School",
    tourDate: "Dec 5, 2024",
    location: "Philadelphia, PA",
    participants: 32,
    rating: 4.7,
    status: "completed",
    guide: "Dr. James Rodriguez",
    highlights: ["Huntsman Hall", "Financial Lab", "Dean's Welcome"],
  },
  {
    id: "4",
    schoolName: "MIT Sloan",
    tourDate: "Dec 8, 2024",
    location: "Cambridge, MA",
    participants: 28,
    rating: 4.8,
    status: "completed",
    guide: "Emily Watson",
    highlights: ["E62 Building Tour", "Tech Innovation Center", "Student Q&A"],
  },
  {
    id: "5",
    schoolName: "INSEAD",
    tourDate: "Dec 22, 2024",
    location: "Fontainebleau, France",
    participants: 0,
    rating: 0,
    status: "upcoming",
    guide: "Pierre Dubois",
    highlights: ["Château Tour", "Global MBA Overview", "Campus Life Experience"],
  },
];

const statusColors = {
  upcoming: "bg-info/10 text-info border-info/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function CampusTours() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Campus Tour Reports</h1>
          <p className="text-muted-foreground">
            Track organized campus visits and university tours for prospects.
          </p>
        </div>
        <Button variant="gradient">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Tour
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tours</p>
                <p className="text-2xl font-bold font-display">36</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Compass className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Participants</p>
                <p className="text-2xl font-bold font-display">842</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Schools Visited</p>
                <p className="text-2xl font-bold font-display">28</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
                <p className="text-2xl font-bold font-display">4.8</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tour Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campusTours.map((tour, index) => (
          <Card
            key={tour.id}
            variant="interactive"
            className="animate-fade-in-up opacity-0"
            style={{ animationDelay: `${300 + index * 50}ms`, animationFillMode: 'forwards' }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{tour.schoolName}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {tour.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusColors[tour.status as keyof typeof statusColors]}>
                    {tour.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Report
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-y border-border/50">
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                    <Calendar className="h-3 w-3" />
                    Tour Date
                  </div>
                  <p className="font-medium text-sm">{tour.tourDate}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                    <Users className="h-3 w-3" />
                    Participants
                  </div>
                  <p className="font-medium text-sm">{tour.participants || "—"}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                    <Star className="h-3 w-3" />
                    Rating
                  </div>
                  <p className="font-medium text-sm">{tour.rating || "—"}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-muted text-xs">
                      {tour.guide.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">Guide: {tour.guide}</span>
                </div>
                <div className="flex gap-1.5">
                  {tour.highlights.slice(0, 2).map((highlight) => (
                    <Badge key={highlight} variant="secondary" className="text-xs">
                      {highlight}
                    </Badge>
                  ))}
                  {tour.highlights.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{tour.highlights.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
