import {
  buildEventHighlightEmailHtml,
  buildLojaProductEmailHtml,
  notifyApprovedMembersBulk,
} from "../email/send";
import { getEventsInHighlightWindow } from "../events/highlight";
import { getLojaProducts } from "../loja/products";
import { listApprovedMembers } from "../members/repository";
import {
  listSentReferences,
  markNotificationSent,
  wasNotificationSent,
} from "./repository";

export type NotificationRunResult = {
  eventHighlights: { key: string; sent: number }[];
  lojaProducts: { id: string; sent: number }[];
  errors: string[];
};

export async function runScheduledMemberNotifications(): Promise<NotificationRunResult> {
  const result: NotificationRunResult = {
    eventHighlights: [],
    lojaProducts: [],
    errors: [],
  };

  const members = await listApprovedMembers();
  const recipients = members.map((m) => ({ name: m.name, email: m.email }));

  if (recipients.length === 0) {
    return result;
  }

  const base = process.env.SITE_URL?.replace(/\/$/, "") ?? "https://www.ocarrista.cc";

  for (const event of getEventsInHighlightWindow()) {
    const already = await wasNotificationSent("event_highlight", event.key);
    if (already) continue;

    const eventUrl = `${base}${event.href}`;
    const bulk = await notifyApprovedMembersBulk({
      subject: `Destaque: ${event.edition}`,
      recipients,
      buildHtml: (memberName) =>
        buildEventHighlightEmailHtml({
          memberName,
          edition: event.edition,
          title: event.title,
          dateDisplay: event.dateDisplay,
          location: event.location,
          daysRemaining: event.daysRemaining,
          eventUrl,
        }),
    });

    if (bulk.reason) {
      result.errors.push(`event_highlight:${event.key}:${bulk.reason}`);
      continue;
    }

    if (bulk.sent > 0) {
      await markNotificationSent("event_highlight", event.key);
    }
    result.eventHighlights.push({ key: event.key, sent: bulk.sent });
  }

  const sentProductIds = new Set(await listSentReferences("loja_product"));
  const products = getLojaProducts();

  for (const product of products) {
    if (sentProductIds.has(product.id)) continue;

    const bulk = await notifyApprovedMembersBulk({
      subject: `Novo artigo na Loja: ${product.name}`,
      recipients,
      buildHtml: (memberName) =>
        buildLojaProductEmailHtml({
          memberName,
          productName: product.name,
          productNote: product.note,
        }),
    });

    if (bulk.reason) {
      result.errors.push(`loja_product:${product.id}:${bulk.reason}`);
      continue;
    }

    if (bulk.sent > 0) {
      await markNotificationSent("loja_product", product.id);
    }
    result.lojaProducts.push({ id: product.id, sent: bulk.sent });
  }

  return result;
}
