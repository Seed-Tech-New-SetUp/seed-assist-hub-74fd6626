// ===========================================
// USER MANAGEMENT API
// ===========================================

import { supabase } from "@/integrations/supabase/client";
import { decodeUTF8, decodeObjectStrings } from "@/lib/utils/decode-utf8";

export interface ActiveUser {
  client_id: string;
  client_name: string;
  email: string;
  role: string;
  designation: string;
  schools: string;
  status: string;
}

export interface PendingInvitation {
  pending_client_id: number;
  email: string;
  client_name: string;
  role: string;
  designation: string;
  invited_at: string;
  status: string;
  request_type: string;
  invited_by_name: string | null;
}

export interface SchoolInfo {
  school_id: string;
  school_name: string;
  university: string;
}

export interface UsersResponse {
  success: boolean;
  data: {
    active_users: ActiveUser[];
    pending_invitations: PendingInvitation[];
    meta: {
      active_users_count: number;
      pending_invitations_count: number;
    };
    school: SchoolInfo;
  };
}

export interface InviteUserPayload {
  email: string;
  client_name: string;
  role: string;
  designation: string;
}

export interface InviteUserResponse {
  success: boolean;
  data?: {
    message: string;
    email_sent: boolean;
    data: {
      pending_client_id: string;
      email: string;
      client_name: string;
      role: string;
      designation: string;
      school_id: string;
      school_name: string;
      invited_by_name: string;
      invited_at: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface DeleteInvitationResponse {
  success: boolean;
  data?: {
    message: string;
    details: {
      pending_client_id: string;
      email: string;
      name: string;
      action: string;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

export async function fetchUsers(authToken: string): Promise<UsersResponse> {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/users-proxy?action=list`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    console.error("Error fetching users:", data);
    throw new Error(data.error || data.message || "Failed to fetch users");
  }

  // Decode UTF-8 strings in the response
  return decodeObjectStrings(data) as UsersResponse;
}

export async function inviteUser(
  authToken: string,
  payload: InviteUserPayload
): Promise<InviteUserResponse> {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/users-proxy?action=invite`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify(payload),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    const errorMessage = result.error?.message || result.message || "Failed to send invitation";
    throw new Error(errorMessage);
  }

  return decodeObjectStrings(result) as InviteUserResponse;
}

export async function deleteInvitation(
  authToken: string,
  invitationId: number
): Promise<DeleteInvitationResponse> {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/users-proxy?action=delete-invitation&id=${invitationId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    const errorMessage = result.error?.message || result.message || "Failed to delete invitation";
    throw new Error(errorMessage);
  }

  return result as DeleteInvitationResponse;
}
