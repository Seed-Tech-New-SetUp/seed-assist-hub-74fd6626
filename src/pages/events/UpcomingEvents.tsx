import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, MapPin, Check, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const upcomingEvents = [
  {
    id: "1",
    name: "Business School Festival - Singapore",
    type: "BUSINESS_SCHOOL_FESTIVAL",
    date: "2024-05-20",
    time: "10:00 AM - 6:00 PM",
    location: "Marina Bay Sands Convention Centre",
    isParticipating: true,
    hasShownInterest: false,
  },
  {
    id: "2",
    name: "Campus Tour - NUS Business School",
    type: "CAMPUS_TOUR",
    date: "2024-05-25",
    time: "2:00 PM - 5:00 PM",
    location: "National University of Singapore",
    isParticipating: false,
    hasShownInterest: false,
  },
  {
    id: "3",
    name: "Business School Festival - Hong Kong",
    type: "BUSINESS_SCHOOL_FESTIVAL",
    date: "2024-06-05",
    time: "10:00 AM - 6:00 PM",
    location: "Hong Kong Convention Centre",
    isParticipating: false,
    hasShownInterest: true,
  },
  {
    id: "4",
    name: "Campus Tour - HKUST",
    type: "CAMPUS_TOUR",
    date: "2024-06-10",
    time: "3:00 PM - 6:00 PM",
    location: "Hong Kong University of Science and Technology",
    isParticipating: false,
    hasShownInterest: false,
  },
];

export default function UpcomingEvents() {
  const [events, setEvents] = useState(upcomingEvents);
  const [selectedEvent, setSelectedEvent] = useState<typeof upcomingEvents[0] | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  const handleShowInterest = (event: typeof upcomingEvents[0]) => {
    setSelectedEvent(event);
    setShowConfirmDialog(true);
  };

  const confirmInterest = () => {
    if (selectedEvent) {
      setEvents(prev =>
        prev.map(e =>
          e.id === selectedEvent.id ? { ...e, hasShownInterest: true } : e
        )
      );
      toast({
        title: "Interest Submitted",
        description: `Your interest in "${selectedEvent.name}" has been recorded. We'll be in touch soon.`,
      });
    }
    setShowConfirmDialog(false);
    setSelectedEvent(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Upcoming Events</h1>
          <p className="text-muted-foreground mt-1">Browse and express interest in upcoming in-person events</p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold leading-tight">
                    {event.name}
                  </CardTitle>
                  {event.isParticipating && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 shrink-0">
                      <Check className="h-3 w-3 mr-1" />
                      Participating
                    </Badge>
                  )}
                  {event.hasShownInterest && !event.isParticipating && (
                    <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 shrink-0">
                      <Clock className="h-3 w-3 mr-1" />
                      Interest Submitted
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.date).toLocaleDateString("en-US", { 
                      weekday: "long", 
                      year: "numeric", 
                      month: "long", 
                      day: "numeric" 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>{event.location}</span>
                  </div>
                </div>
                
                <Badge variant="outline" className="text-xs">
                  {event.type === "BUSINESS_SCHOOL_FESTIVAL" ? "Business School Festival" : "Campus Tour"}
                </Badge>

                {!event.isParticipating && !event.hasShownInterest && (
                  <Button
                    className="w-full mt-2"
                    onClick={() => handleShowInterest(event)}
                  >
                    Showcase Interest
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Interest</DialogTitle>
              <DialogDescription>
                You're about to express interest in participating in:
              </DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <div className="py-4">
                <p className="font-semibold">{selectedEvent.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(selectedEvent.date).toLocaleDateString("en-US", { 
                    weekday: "long", 
                    year: "numeric", 
                    month: "long", 
                    day: "numeric" 
                  })}
                </p>
                <p className="text-sm text-muted-foreground">{selectedEvent.location}</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmInterest}>
                Confirm Interest
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
