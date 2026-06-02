import { Resend } from "resend";

/** Destino de adesões, pedidos de loja e avisos admin (sobreposto por ADMIN_NOTIFY_EMAIL). */
export const DEFAULT_ADMIN_NOTIFY_EMAIL = "ocarrista.cc@gmail.com";

function adminNotifyEmail(): string {
  return process.env.ADMIN_NOTIFY_EMAIL?.trim() || DEFAULT_ADMIN_NOTIFY_EMAIL;
}

function siteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) {
    const host = process.env.VERCEL_URL.replace(/\/$/, "");
    return host.startsWith("http") ? host : `https://${host}`;
  }
  return "http://localhost:3000";
}

function fromAddress(): string | null {
  return process.env.EMAIL_FROM?.trim() || null;
}

function resendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export async function notifyAdminNewMember(params: {
  memberName: string;
  memberEmail: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const to = adminNotifyEmail();
  const from = fromAddress();
  const resend = resendClient();

  if (!to || !from || !resend) {
    console.info("[email] Nova adesão (email não enviado — falta RESEND/EMAIL_FROM):", params);
    return { sent: false, reason: "email_nao_configurado" };
  }

  const adminUrl = `${siteUrl()}/admin/membros?filtro=pending`;

  await resend.emails.send({
    from,
    to,
    subject: `O Carrista — Nova adesão: ${params.memberName}`,
    html: `
      <p>Foi pedida uma nova adesão à comunidade O Carrista.</p>
      <p><strong>Nome:</strong> ${params.memberName}<br/>
      <strong>Email:</strong> ${params.memberEmail}</p>
      <p><a href="${adminUrl}">Abrir pedidos de adesão</a> (entrada com a password de administração).</p>
    `,
  });

  return { sent: true };
}

export async function notifyMemberApproved(params: {
  memberName: string;
  memberEmail: string;
  setupToken: string;
}): Promise<{ sent: boolean; reason?: string; setupUrl?: string }> {
  const from = fromAddress();
  const resend = resendClient();
  const setupUrl = `${siteUrl()}/conta/definir-password?token=${encodeURIComponent(params.setupToken)}`;

  if (!from || !resend) {
    console.info("[email] Aprovação (email não enviado):", params.memberEmail, setupUrl);
    return { sent: false, reason: "email_nao_configurado", setupUrl };
  }

  await resend.emails.send({
    from,
    to: params.memberEmail,
    subject: "O Carrista — Adesão aprovada",
    html: `
      <p>Olá ${params.memberName},</p>
      <p>A sua adesão à comunidade <strong>O Carrista</strong> foi aprovada.</p>
      <p>Defina a sua password de membro (válida 7 dias):</p>
      <p><a href="${setupUrl}">${setupUrl}</a></p>
      <p>Depois pode entrar em <a href="${siteUrl()}/entrar">${siteUrl()}/entrar</a>.</p>
    `,
  });

  return { sent: true, setupUrl };
}

export async function notifyMemberRejected(params: {
  memberName: string;
  memberEmail: string;
}): Promise<{ sent: boolean }> {
  const from = fromAddress();
  const resend = resendClient();
  if (!from || !resend) {
    console.info("[email] Rejeição (não enviado):", params.memberEmail);
    return { sent: false };
  }

  await resend.emails.send({
    from,
    to: params.memberEmail,
    subject: "O Carrista — Pedido de adesão",
    html: `
      <p>Olá ${params.memberName},</p>
      <p>O seu pedido de adesão à comunidade O Carrista não foi autorizado nesta fase.
      Para esclarecimentos, contacte a organização do QCav / O Carrista.</p>
    `,
  });

  return { sent: true };
}

export async function notifyShopRequest(params: {
  memberName: string;
  memberEmail: string;
  productName: string;
  note?: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const to = adminNotifyEmail();
  const from = fromAddress();
  const resend = resendClient();

  if (!to || !from || !resend) {
    console.info("[email] Pedido loja (não enviado):", params);
    return { sent: false, reason: "email_nao_configurado" };
  }

  const noteBlock = params.note?.trim()
    ? `<p><strong>Nota do membro:</strong> ${params.note.trim()}</p>`
    : "";

  await resend.emails.send({
    from,
    to,
    replyTo: params.memberEmail,
    subject: `O Carrista — Pedido Loja: ${params.productName}`,
    html: `
      <p>Pedido de artigo na Loja do Carrista (sem pagamento online).</p>
      <p><strong>Artigo:</strong> ${params.productName}<br/>
      <strong>Membro:</strong> ${params.memberName}<br/>
      <strong>Email:</strong> ${params.memberEmail}</p>
      ${noteBlock}
      <p>Responda ao membro por email para combinar entrega e valor.</p>
    `,
  });

  return { sent: true };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendAdminMessageToMember(params: {
  memberName: string;
  memberEmail: string;
  subject: string;
  message: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const from = fromAddress();
  const resend = resendClient();
  const subject = params.subject.trim().slice(0, 200);
  const body = params.message.trim();

  if (!subject || !body) {
    return { sent: false, reason: "mensagem_invalida" };
  }

  if (!from || !resend) {
    console.info("[email] Mensagem admin (não enviado):", params.memberEmail, subject);
    return { sent: false, reason: "email_nao_configurado" };
  }

  const htmlBody = escapeHtml(body).replace(/\n/g, "<br/>");

  await resend.emails.send({
    from,
    to: params.memberEmail,
    subject: `O Carrista — ${subject}`,
    html: `
      <p>Olá ${escapeHtml(params.memberName)},</p>
      <div style="margin:1.25em 0;line-height:1.6">${htmlBody}</div>
      <p style="color:#666;font-size:0.9em">Mensagem da administração O Carrista · <a href="${siteUrl()}">${siteUrl()}</a></p>
    `,
  });

  return { sent: true };
}

export type MemberEmailRecipient = {
  name: string;
  email: string;
};

async function sendEmailToMember(
  recipient: MemberEmailRecipient,
  subject: string,
  html: string,
): Promise<boolean> {
  const from = fromAddress();
  const resend = resendClient();
  if (!from || !resend) return false;

  await resend.emails.send({
    from,
    to: recipient.email,
    subject: `O Carrista — ${subject}`,
    html,
  });
  return true;
}

/** Envia o mesmo alerta a todos os membros aprovados (um email por membro). */
export async function notifyApprovedMembersBulk(params: {
  subject: string;
  buildHtml: (memberName: string) => string;
  recipients: MemberEmailRecipient[];
}): Promise<{ sent: number; skipped: number; reason?: string }> {
  const from = fromAddress();
  const resend = resendClient();
  if (!from || !resend) {
    console.info("[email] Alerta membros (não enviado):", params.subject);
    return { sent: 0, skipped: params.recipients.length, reason: "email_nao_configurado" };
  }

  let sent = 0;
  for (const member of params.recipients) {
    try {
      const ok = await sendEmailToMember(
        member,
        params.subject,
        params.buildHtml(member.name),
      );
      if (ok) sent += 1;
    } catch (err) {
      console.error("[email] Falha ao enviar para", member.email, err);
    }
  }

  return {
    sent,
    skipped: params.recipients.length - sent,
  };
}

export function buildEventHighlightEmailHtml(params: {
  memberName: string;
  edition: string;
  title: string;
  dateDisplay: string;
  location: string;
  daysRemaining: number;
  eventUrl: string;
}): string {
  const dias = params.daysRemaining === 1 ? "1 dia" : `${params.daysRemaining} dias`;
  return `
    <p>Olá ${escapeHtml(params.memberName)},</p>
    <p>O evento <strong>${escapeHtml(params.edition)}</strong> (${escapeHtml(params.title)}) entrou em <strong>destaque</strong> na página inicial do O Carrista — faltam <strong>${dias}</strong> para a data prevista.</p>
    <p><strong>Data:</strong> ${escapeHtml(params.dateDisplay)}<br/>
    <strong>Local:</strong> ${escapeHtml(params.location)}</p>
    <p><a href="${params.eventUrl}">Ver o evento no site</a> · <a href="${siteUrl()}">${siteUrl()}</a></p>
    <p style="color:#666;font-size:0.9em">Recebeu este aviso por ser membro da comunidade O Carrista.</p>
  `;
}

export function buildLojaProductEmailHtml(params: {
  memberName: string;
  productName: string;
  productNote: string;
}): string {
  return `
    <p>Olá ${escapeHtml(params.memberName)},</p>
    <p>Foi adicionado um novo artigo à <strong>Loja do Carrista</strong>:</p>
    <p><strong>${escapeHtml(params.productName)}</strong><br/>
    <span style="color:#666">${escapeHtml(params.productNote)}</span></p>
    <p>Entre na sua conta e visite a secção Loja para solicitar o artigo por email (sem pagamento no site).</p>
    <p><a href="${siteUrl()}/?section=loja">Abrir Loja</a></p>
    <p style="color:#666;font-size:0.9em">Apenas para membros aprovados.</p>
  `;
}
