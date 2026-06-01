import type { Member } from "./types";

export type MemberPublic = Omit<Member, "password_hash" | "setup_token" | "setup_token_expires"> & {
  hasPassword: boolean;
};

export function toMemberPublic(member: Member): MemberPublic {
  const { password_hash, setup_token, setup_token_expires, ...rest } = member;
  return {
    ...rest,
    hasPassword: Boolean(password_hash),
  };
}
