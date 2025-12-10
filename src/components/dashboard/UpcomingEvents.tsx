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
    <Card variant="elevated" className="animate-fade-in-up opacity-0" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Events</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          View Calendar <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingEvents.map((event, index) => (
          <div
            key={event.id}
            className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:shadow-soft transition-all duration-200 cursor-pointer animate-fade-in opacity-0"
            style={{ animationDelay: `${900 + index * 50}ms`, animationFillMode: 'forwards' }}
          >
            <div className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
              event.type === "virtual" ? "bg-info/10 text-info" : "bg-accent/10 text-accent"
            )}>
              {event.type === "virtual" ? (
                <Video className="h-6 w-6" />
              ) : (
                <Calendar className="h-6 w-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">{event.title}</h4>
                <Badge variant={event.type === "virtual" ? "secondary" : "default"} className="text-xs">
                  {event.type === "virtual" ? "Virtual" : "In-Person"}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {event.date} • {event.time}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {event.attendees} expected
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
