import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSchool } from "@/contexts/SchoolContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { UserPlus, Shield, Users, Mail, Calendar, ShieldAlert, Clock, Trash2, User, Inbox } from "lucide-react";
import { format } from "date-fns";

interface SchoolUser {
  id: string;
  user_id: string;
  role: string;
  is_primary: boolean;
  created_at: string;
  profile?: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

interface PendingInvitation {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  designation?: string;
  invited_by_name?: string;
  created_at: string;
}

interface InviteFormData {
  email: string;
  fullName: string;
  role: string;
  designation: string;
}

export default function UserManagement() {
  const { currentSchool } = useSchool();
  const { user } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminStatus();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<InviteFormData>({
    email: "",
    fullName: "",
    role: "user",
    designation: "",
  });

  // Fetch active users
  const { data: schoolUsers, isLoading } = useQuery({
    queryKey: ["school-users", currentSchool?.id],
    queryFn: async () => {
      if (!currentSchool?.id) return [];

      const { data: userSchools, error } = await supabase
        .from("user_schools")
        .select("id, user_id, role, is_primary, created_at")
        .eq("school_id", currentSchool.id);

      if (error) throw error;
      if (!userSchools || userSchools.length === 0) return [];

      const userIds = userSchools.map((us) => us.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", userIds);

      if (profileError) throw profileError;

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
      return userSchools.map((us) => ({
        ...us,
        profile: profileMap.get(us.user_id),
      })) as SchoolUser[];
    },
    enabled: !!currentSchool?.id,
  });

  // Fetch pending invitations
  const { data: pendingInvitations } = useQuery({
    queryKey: ["pending-invitations", currentSchool?.id],
    queryFn: async () => {
      if (!currentSchool?.id) return [];

      const { data, error } = await supabase
        .from("school_invitations")
        .select("id, email, created_at")
        .eq("school_id", currentSchool.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PendingInvitation[];
    },
    enabled: !!currentSchool?.id && isAdmin,
  });

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: async (data: InviteFormData) => {
      // First check if user already exists in profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", data.email.toLowerCase().trim())
        .maybeSingle();

      if (profile) {
        // User exists - check if already associated
        const { data: existing } = await supabase
          .from("user_schools")
          .select("id")
          .eq("user_id", profile.id)
          .eq("school_id", currentSchool?.id)
          .maybeSingle();

        if (existing) throw new Error("User is already associated with this school.");

        // Add user directly
        const { error } = await supabase
          .from("user_schools")
          .insert({
            user_id: profile.id,
            school_id: currentSchool?.id,
            role: data.role,
            is_primary: false,
          });

        if (error) throw error;
        return { type: "added" as const };
      } else {
        // User doesn't exist - check for existing invitation
        const { data: existingInvite } = await supabase
          .from("school_invitations")
          .select("id")
          .eq("email", data.email.toLowerCase().trim())
          .eq("school_id", currentSchool?.id)
          .maybeSingle();

        if (existingInvite) throw new Error("An invitation has already been sent to this email.");

        // Create invitation
        const { error } = await supabase
          .from("school_invitations")
          .insert({
            school_id: currentSchool?.id,
            email: data.email.toLowerCase().trim(),
            role: data.role,
            invited_by: user?.id,
          });

        if (error) throw error;
        return { type: "invited" as const };
      }
    },
    onSuccess: (result) => {
      if (result.type === "added") {
        toast.success("User added successfully");
      } else {
        toast.success("Invitation sent. User will be added when they sign up.");
      }
      setIsAddDialogOpen(false);
      setFormData({ email: "", fullName: "", role: "user", designation: "" });
      queryClient.invalidateQueries({ queryKey: ["school-users", currentSchool?.id] });
      queryClient.invalidateQueries({ queryKey: ["pending-invitations", currentSchool?.id] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Cancel invitation mutation
  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("school_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invitation deleted");
      queryClient.invalidateQueries({ queryKey: ["pending-invitations", currentSchool?.id] });
    },
    onError: () => {
      toast.error("Failed to delete invitation");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!formData.fullName.trim()) {
      toast.error("Please enter the full name");
      return;
    }
    if (!formData.designation.trim()) {
      toast.error("Please enter a designation");
      return;
    }
    
    addUserMutation.mutate(formData);
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.charAt(0).toUpperCase() || "U";
  };

  const getRoleBadgeVariant = (role: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (role) {
      case "admin":
      case "super_admin":
        return "destructive";
      case "user":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (adminLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground text-center max-w-md">
            You don't have permission to access this page. Only administrators can manage users.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const activeUsersCount = schoolUsers?.length || 0;
  const adminCount = schoolUsers?.filter((u) => u.role === "admin").length || 0;
  const pendingCount = pendingInvitations?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Manage Users</h1>
            <p className="text-muted-foreground mt-1">
              {currentSchool?.name}
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Invite New User
                </DialogTitle>
                <DialogDescription>
                  Send an invitation to add a new user to your school.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                    disabled
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation *</Label>
                  <Input
                    id="designation"
                    type="text"
                    placeholder="e.g., Admissions Director"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addUserMutation.isPending}
                    className="gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    {addUserMutation.isPending ? "Sending..." : "Send Invitation"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{activeUsersCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Invitations</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Users Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Active Users ({activeUsersCount})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs h-10">User</TableHead>
                  <TableHead className="text-xs h-10">Role</TableHead>
                  <TableHead className="text-xs h-10">Designation</TableHead>
                  <TableHead className="text-xs h-10 text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schoolUsers && schoolUsers.length > 0 ? (
                  schoolUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(user.profile?.full_name || null, user.profile?.email || null)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {user.profile?.full_name || "Unknown User"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.profile?.email || "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-medium">—</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0">
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Users className="h-10 w-10 opacity-50" />
                        <p>No users found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pending Invitations Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Pending Invitations ({pendingCount})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs h-10">User</TableHead>
                  <TableHead className="text-xs h-10">Role</TableHead>
                  <TableHead className="text-xs h-10">Designation</TableHead>
                  <TableHead className="text-xs h-10">Invited By</TableHead>
                  <TableHead className="text-xs h-10">Invited At</TableHead>
                  <TableHead className="text-xs h-10 text-center">Status</TableHead>
                  <TableHead className="text-xs h-10 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvitations && pendingInvitations.length > 0 ? (
                  pendingInvitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {invitation.full_name || "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {invitation.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {invitation.role || "user"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-medium">{invitation.designation || "—"}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-muted-foreground">
                          {invitation.invited_by_name || "—"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(invitation.created_at), "MMM d, yyyy HH:mm")}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
                          Pending
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this invitation?")) {
                              cancelInvitationMutation.mutate(invitation.id);
                            }
                          }}
                          disabled={cancelInvitationMutation.isPending}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Inbox className="h-10 w-10 opacity-50" />
                        <p>No pending invitations</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
