export type MemberRole = "admin" | "user";
export type MemberStatus = "pending" | "approved" | "rejected";

export type Member = {
  id: string;
  email: string;
  name: string;
  role: MemberRole;
  status: MemberStatus;
  password_hash: string | null;
  setup_token: string | null;
  setup_token_expires: string | null;
  gesco_access: boolean;
  created_at: string;
  updated_at: string;
};
