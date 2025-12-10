import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Video, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  type: "virtual" | "in-person";
  date: string;
  time: string;
  location: string;
  attendees: number;
}

const upcomingEvents: Event[] = [
  {
    id: "1",
    title: "MBA Virtual Fair - Europe",
    type: "virtual",
    date: "Dec 15, 2024",
    time: "2:00 PM EST",
    location: "Zoom Webinar",
    attendees: 250,
  },
  {
    id: "2",
    title: "Business School Festival NYC",
    type: "in-person",
    date: "Dec 18, 2024",
    time: "10:00 AM EST",
    location: "Manhattan Convention Center",
    attendees: 500,
  },
  {
    id: "3",
    title: "Alumni Meetup - San Francisco",
    type: "in-person",
    date: "Dec 20, 2024",
    time: "6:00 PM PST",
    location: "The Ritz-Carlton",
    attendees: 80,
  },
];

export function UpcomingEvents() {
  return (
    <Card variant="default" className="animate-fade-in-up opacity-0" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Upcoming Events</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs text-primary h-8">
          View Calendar <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-secondary/30 transition-colors cursor-pointer"
          >
            <div className={cn(
              "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0",
              event.type === "virtual" ? "bg-info/10 text-info" : "bg-accent/10 text-accent"
            )}>
              {event.type === "virtual" ? (
                <Video className="h-4 w-4" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">{event.title}</h4>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {event.type === "virtual" ? "Virtual" : "In-Person"}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {event.date}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {event.attendees}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
