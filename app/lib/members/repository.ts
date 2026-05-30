import { getSql, dbConfigured } from "../db/client";
import type { Member, MemberStatus } from "./types";

type MemberRow = Member;

function rowToMember(row: MemberRow): Member {
  return row;
}

export async function findMemberByEmail(email: string): Promise<Member | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql`SELECT * FROM members WHERE LOWER(email) = LOWER(${email.trim()}) LIMIT 1`;
  const row = rows[0] as MemberRow | undefined;
  return row ? rowToMember(row) : null;
}

export async function findMemberById(id: string): Promise<Member | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql`SELECT * FROM members WHERE id = ${id} LIMIT 1`;
  const row = rows[0] as MemberRow | undefined;
  return row ? rowToMember(row) : null;
}

export async function findMemberBySetupToken(token: string): Promise<Member | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql`
    SELECT * FROM members
    WHERE setup_token = ${token}
      AND setup_token_expires > NOW()
    LIMIT 1
  `;
  const row = rows[0] as MemberRow | undefined;
  return row ? rowToMember(row) : null;
}

export async function createPendingMember(
  email: string,
  name: string,
): Promise<Member> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL em falta");
  const id = crypto.randomUUID();
  const rows = await sql`
    INSERT INTO members (id, email, name, role, status)
    VALUES (${id}, ${email.trim().toLowerCase()}, ${name.trim()}, 'user', 'pending')
    RETURNING *
  `;
  return rowToMember(rows[0] as MemberRow);
}

export async function listMembersByStatus(status: MemberStatus): Promise<Member[]> {
  const sql = getSql();
  if (!sql) return [];
  const rows = await sql`
    SELECT * FROM members WHERE status = ${status} ORDER BY created_at ASC
  `;
  return (rows as MemberRow[]).map(rowToMember);
}

export async function approveMemberForSetup(
  id: string,
  setupToken: string,
  expiresAt: Date,
): Promise<Member | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql`
    UPDATE members
    SET status = 'approved',
        setup_token = ${setupToken},
        setup_token_expires = ${expiresAt.toISOString()},
        updated_at = NOW()
    WHERE id = ${id} AND status = 'pending'
    RETURNING *
  `;
  const row = rows[0] as MemberRow | undefined;
  return row ? rowToMember(row) : null;
}

export async function rejectMember(id: string): Promise<Member | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql`
    UPDATE members SET status = 'rejected', updated_at = NOW()
    WHERE id = ${id} AND status = 'pending'
    RETURNING *
  `;
  const row = rows[0] as MemberRow | undefined;
  return row ? rowToMember(row) : null;
}

export async function setMemberPassword(
  id: string,
  passwordHash: string,
): Promise<Member | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql`
    UPDATE members
    SET password_hash = ${passwordHash},
        setup_token = NULL,
        setup_token_expires = NULL,
        status = 'approved',
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  const row = rows[0] as MemberRow | undefined;
  return row ? rowToMember(row) : null;
}

export { dbConfigured };
