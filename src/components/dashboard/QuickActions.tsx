import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Plus,
  Upload,
  Building2,
} from "lucide-react";

const actions = [
  {
    title: "Submit Event Report",
    description: "Virtual event or meetup",
    icon: Calendar,
    variant: "default" as const,
  },
  {
    title: "Add New Lead",
    description: "From recent activities",
    icon: Plus,
    variant: "accent" as const,
  },
  {
    title: "Upload Applicant Data",
    description: "Bulk scholarship import",
    icon: Upload,
    variant: "outline" as const,
  },
  {
    title: "Update School Profile",
    description: "Programs & deadlines",
    icon: Building2,
    variant: "outline" as const,
  },
];

export function QuickActions() {
  return (
    <Card variant="default" className="animate-fade-in-up opacity-0" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {actions.map((action) => (
          <Button
            key={action.title}
            variant={action.variant}
            className="h-auto py-2.5 px-3 justify-start"
          >
            <action.icon className="h-4 w-4 mr-2.5 flex-shrink-0" />
            <div className="text-left">
              <p className="font-medium text-sm">{action.title}</p>
              <p className="text-[11px] opacity-70 font-normal">{action.description}</p>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
