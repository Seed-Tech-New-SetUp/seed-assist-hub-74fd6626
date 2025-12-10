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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { UserPlus, Shield, Users, Mail, Calendar, ShieldAlert, Clock, Trash2 } from "lucide-react";
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
  created_at: string;
}

export default function UserManagement() {
  const { currentSchool } = useSchool();
  const { user } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminStatus();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");

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
    mutationFn: async (email: string) => {
      // First check if user already exists in profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.toLowerCase().trim())
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
            role: "user",
            is_primary: false,
          });

        if (error) throw error;
        return { type: "added" as const };
      } else {
        // User doesn't exist - check for existing invitation
        const { data: existingInvite } = await supabase
          .from("school_invitations")
          .select("id")
          .eq("email", email.toLowerCase().trim())
          .eq("school_id", currentSchool?.id)
          .maybeSingle();

        if (existingInvite) throw new Error("An invitation has already been sent to this email.");

        // Create invitation
        const { error } = await supabase
          .from("school_invitations")
          .insert({
            school_id: currentSchool?.id,
            email: email.toLowerCase().trim(),
            role: "user",
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
      setNewUserEmail("");
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
      toast.success("Invitation cancelled");
      queryClient.invalidateQueries({ queryKey: ["pending-invitations", currentSchool?.id] });
    },
    onError: () => {
      toast.error("Failed to cancel invitation");
    },
  });

  const handleAddUser = () => {
    const email = newUserEmail.trim();
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    addUserMutation.mutate(email);
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage users associated with {currentSchool?.name}
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add User to School</DialogTitle>
                <DialogDescription>
                  Enter the user's email address. If they haven't signed up yet, they'll be added automatically when they do.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
                  />
                </div>
                <Button
                  onClick={handleAddUser}
                  disabled={addUserMutation.isPending}
                  className="w-full"
                >
                  {addUserMutation.isPending ? "Adding..." : "Add User"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{schoolUsers?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Admins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">
                  {schoolUsers?.filter((u) => u.role === "admin").length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Invitations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{pendingInvitations?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Invitations */}
        {pendingInvitations && pendingInvitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Invitations
              </CardTitle>
              <CardDescription>
                Users who will be added when they sign up
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Invited</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {invitation.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(invitation.created_at), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelInvitationMutation.mutate(invitation.id)}
                          disabled={cancelInvitationMutation.isPending}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Active Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>
              All users with access to {currentSchool?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {schoolUsers && schoolUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(user.profile?.full_name || null, user.profile?.email || null)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {user.profile?.full_name || "Unknown User"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {user.profile?.email || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(user.created_at), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No users found for this school.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
