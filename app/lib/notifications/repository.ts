import { getSql } from "../db/client";

export type NotificationKind = "event_highlight" | "loja_product";

export async function wasNotificationSent(
  kind: NotificationKind,
  reference: string,
): Promise<boolean> {
  const sql = getSql();
  if (!sql) return true;
  const rows = await sql`
    SELECT 1 FROM notification_sent
    WHERE kind = ${kind} AND reference = ${reference}
    LIMIT 1
  `;
  return rows.length > 0;
}

export async function markNotificationSent(
  kind: NotificationKind,
  reference: string,
): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await sql`
    INSERT INTO notification_sent (kind, reference)
    VALUES (${kind}, ${reference})
    ON CONFLICT (kind, reference) DO NOTHING
  `;
}

export async function listSentReferences(kind: NotificationKind): Promise<string[]> {
  const sql = getSql();
  if (!sql) return [];
  const rows = await sql`
    SELECT reference FROM notification_sent WHERE kind = ${kind}
  `;
  return (rows as { reference: string }[]).map((r) => r.reference);
}
