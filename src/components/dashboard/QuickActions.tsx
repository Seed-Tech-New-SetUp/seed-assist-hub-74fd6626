import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  FileText,
  Users,
  Building2,
  Target,
  GraduationCap,
  Plus,
  Upload,
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
    <Card variant="elevated" className="animate-fade-in-up opacity-0" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {actions.map((action, index) => (
          <Button
            key={action.title}
            variant={action.variant}
            className="h-auto py-3 px-4 justify-start animate-fade-in opacity-0"
            style={{ animationDelay: `${800 + index * 50}ms`, animationFillMode: 'forwards' }}
          >
            <action.icon className="h-5 w-5 mr-3 flex-shrink-0" />
            <div className="text-left">
              <p className="font-medium text-sm">{action.title}</p>
              <p className="text-xs opacity-70">{action.description}</p>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
