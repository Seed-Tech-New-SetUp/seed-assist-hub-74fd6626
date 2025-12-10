import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Filter,
  Building2,
  MapPin,
  GraduationCap,
  Calendar,
  ExternalLink,
  Edit,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const schools = [
  {
    id: "1",
    name: "Harvard Business School",
    location: "Boston, MA",
    programs: 4,
    leads: 245,
    lastUpdated: "2 days ago",
    status: "active",
    ranking: "#1",
  },
  {
    id: "2",
    name: "Stanford Graduate School of Business",
    location: "Stanford, CA",
    programs: 3,
    leads: 198,
    lastUpdated: "5 days ago",
    status: "active",
    ranking: "#2",
  },
  {
    id: "3",
    name: "Wharton School of Business",
    location: "Philadelphia, PA",
    programs: 5,
    leads: 312,
    lastUpdated: "1 week ago",
    status: "active",
    ranking: "#3",
  },
  {
    id: "4",
    name: "MIT Sloan School of Management",
    location: "Cambridge, MA",
    programs: 4,
    leads: 156,
    lastUpdated: "3 days ago",
    status: "active",
    ranking: "#4",
  },
  {
    id: "5",
    name: "Columbia Business School",
    location: "New York, NY",
    programs: 6,
    leads: 287,
    lastUpdated: "1 day ago",
    status: "pending",
    ranking: "#5",
  },
  {
    id: "6",
    name: "Chicago Booth School of Business",
    location: "Chicago, IL",
    programs: 4,
    leads: 178,
    lastUpdated: "4 days ago",
    status: "active",
    ranking: "#6",
  },
];

const statusColors = {
  active: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  inactive: "bg-muted text-muted-foreground border-border",
};

export default function SchoolProfiles() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">School Profiles</h1>
          <p className="text-muted-foreground">
            Manage school data, programs, and track lead generation performance.
          </p>
        </div>
        <Button variant="gradient">
          <Plus className="h-4 w-4 mr-2" />
          Add New School
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Schools</p>
                <p className="text-2xl font-bold font-display">110+</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Programs</p>
                <p className="text-2xl font-bold font-display">450</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Regions Covered</p>
                <p className="text-2xl font-bold font-display">8+</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Updates This Week</p>
                <p className="text-2xl font-bold font-display">24</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card variant="elevated" className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Partner Schools</CardTitle>
              <CardDescription>Manage and update school profiles and programs</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search schools..." className="pl-9 w-64" variant="ghost" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Schools</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="pending">Pending Updates</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools.map((school, index) => (
                  <Card 
                    key={school.id} 
                    variant="interactive"
                    className="animate-fade-in-up opacity-0"
                    style={{ animationDelay: `${400 + index * 50}ms`, animationFillMode: 'forwards' }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={statusColors[school.status as keyof typeof statusColors]}>
                            {school.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Public Page
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{school.name}</h3>
                            <Badge variant="secondary" className="text-xs">{school.ranking}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {school.location}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground">Programs</p>
                            <p className="font-semibold">{school.programs}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Leads</p>
                            <p className="font-semibold text-primary">{school.leads}</p>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground pt-2">
                          Last updated: {school.lastUpdated}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="active">
              <p className="text-muted-foreground text-center py-8">Showing active schools only</p>
            </TabsContent>
            <TabsContent value="pending">
              <p className="text-muted-foreground text-center py-8">Schools pending updates will appear here</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
