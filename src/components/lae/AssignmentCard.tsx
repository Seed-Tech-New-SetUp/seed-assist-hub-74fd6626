import { BarChart3, Calendar, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LAEAssignment } from "@/lib/api/lae";
import { format } from "date-fns";

interface AssignmentCardProps {
  assignment: LAEAssignment;
  onViewAnalytics: (assignmentId: string, assignmentType: string) => void;
  onViewContacts: (assignmentId: string, assignmentType: string) => void;
}

function getStatusBadge(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "active" || normalized === "in_progress") {
    return {
      label: "Active",
      className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    };
  }
  if (normalized === "completed") {
    return {
      label: "Completed",
      className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    };
  }
  return {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  };
}

export function AssignmentCard({ assignment, onViewAnalytics, onViewContacts }: AssignmentCardProps) {
  const statusBadge = getStatusBadge(assignment.status);

  return (
    <div className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-foreground truncate">
              {assignment.assignment_type || "Unnamed Assignment"}
            </h3>
            <Badge variant="outline" className={statusBadge.className}>
              {statusBadge.label}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {assignment.cycle && (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                {assignment.cycle}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {assignment.start_date
                ? format(new Date(assignment.start_date), "MMM d, yyyy")
                : "Not set"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => onViewContacts(assignment.assignment_id, assignment.assignment_type)}
          >
            <Users className="h-4 w-4 mr-2" />
            View Applications Generated
          </Button>
          <Button
            onClick={() => onViewAnalytics(assignment.assignment_id, assignment.assignment_type)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
