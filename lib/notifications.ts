import type { AppRole } from "@/lib/roles";
import { getRoleLabel } from "@/lib/roles";
import { listNotifiableUsers } from "@/lib/users";
import { escapeHtml } from "@/lib/utils";

type NotificationActor = {
  name: string;
  email: string;
  role: AppRole;
};

type NotificationUserTarget = {
  name: string;
  email: string;
  role: AppRole;
};

type UserCreatedNotificationInput = {
  actor: NotificationActor;
  target: NotificationUserTarget;
};

type SubmissionCreatedNotificationInput = {
  actor: NotificationActor;
  flowType: "admissao" | "movimentacoes";
  status: "draft" | "submitted";
  submissionId: string;
  employerName?: string;
  employeeName?: string;
};

type NotificationRecipient = {
  email: string;
  name?: string;
};

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const senderEmail = process.env.RESEND_SENDER_EMAIL;
  const senderName = process.env.RESEND_SENDER_NAME || "RH Flow";

  if (!apiKey || !senderEmail) {
    return null;
  }

  return {
    apiKey,
    senderEmail,
    senderName,
  };
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

async function getNotificationRecipients() {
  const configuredRecipients = (process.env.RESEND_NOTIFICATION_EMAILS || "")
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean);

  const privilegedUsers = await listNotifiableUsers();
  const uniqueRecipients = new Map<string, NotificationRecipient>();

  for (const email of configuredRecipients) {
    uniqueRecipients.set(email, { email });
  }

  for (const user of privilegedUsers) {
    if (user.status !== "approved") {
      continue;
    }

    const normalizedEmail = normalizeEmail(user.email);
    if (!normalizedEmail) {
      continue;
    }

    uniqueRecipients.set(normalizedEmail, {
      email: normalizedEmail,
      name: user.name,
    });
  }

  return Array.from(uniqueRecipients.values());
}

async function sendResendEmail(input: {
  subject: string;
  htmlContent: string;
  textContent: string;
  recipients: NotificationRecipient[];
}) {
  const config = getResendConfig();
  if (!config || input.recipients.length === 0) {
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      Accept: "application/json",
      "User-Agent": "rh-flow-notifications",
    },
    body: JSON.stringify({
      from: `${config.senderName} <${config.senderEmail}>`,
      to: input.recipients.map((recipient) => recipient.email),
      subject: input.subject,
      html: input.htmlContent,
      text: input.textContent,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend error ${response.status}: ${errorBody}`);
  }
}

export async function notifyUserCreated(input: UserCreatedNotificationInput) {
  const recipients = await getNotificationRecipients();
  if (recipients.length === 0) {
    return;
  }

  const subject = `RH Flow: novo usuario criado (${getRoleLabel(input.target.role)})`;
  const safeTargetName = escapeHtml(input.target.name);
  const safeTargetEmail = escapeHtml(input.target.email);
  const safeActorName = escapeHtml(input.actor.name);
  const safeActorEmail = escapeHtml(input.actor.email);
  const textContent = [
    "Um novo usuario foi criado no RH Flow.",
    `Nome: ${input.target.name}`,
    `E-mail: ${input.target.email}`,
    `Perfil: ${getRoleLabel(input.target.role)}`,
    `Criado por: ${input.actor.name} (${input.actor.email}) - ${getRoleLabel(input.actor.role)}`,
  ].join("\n");

  const htmlContent = `
    <h2>Novo usuario criado no RH Flow</h2>
    <p><strong>Nome:</strong> ${safeTargetName}</p>
    <p><strong>E-mail:</strong> ${safeTargetEmail}</p>
    <p><strong>Perfil:</strong> ${getRoleLabel(input.target.role)}</p>
    <p><strong>Criado por:</strong> ${safeActorName} (${safeActorEmail}) - ${getRoleLabel(input.actor.role)}</p>
  `;

  await sendResendEmail({
    subject,
    htmlContent,
    textContent,
    recipients,
  });
}

export async function notifySubmissionCreated(input: SubmissionCreatedNotificationInput) {
  const recipients = await getNotificationRecipients();
  if (recipients.length === 0) {
    return;
  }

  const flowLabel = input.flowType === "admissao" ? "Admissao" : "Movimentacoes";
  const subject = `RH Flow: novo formulario registrado (${flowLabel})`;
  const safeEmployerName = escapeHtml(input.employerName || "Nao informado");
  const safeEmployeeName = escapeHtml(input.employeeName || "Nao informado");
  const safeActorName = escapeHtml(input.actor.name);
  const safeActorEmail = escapeHtml(input.actor.email);
  const textContent = [
    "Um novo formulario foi registrado no RH Flow.",
    `Fluxo: ${flowLabel}`,
    `Status: ${input.status}`,
    `Empresa: ${input.employerName || "Nao informado"}`,
    `Colaborador: ${input.employeeName || "Nao informado"}`,
    `ID do registro: ${input.submissionId}`,
    `Responsavel: ${input.actor.name} (${input.actor.email}) - ${getRoleLabel(input.actor.role)}`,
  ].join("\n");

  const htmlContent = `
    <h2>Novo formulario registrado no RH Flow</h2>
    <p><strong>Fluxo:</strong> ${flowLabel}</p>
    <p><strong>Status:</strong> ${input.status}</p>
    <p><strong>Empresa:</strong> ${safeEmployerName}</p>
    <p><strong>Colaborador:</strong> ${safeEmployeeName}</p>
    <p><strong>ID do registro:</strong> ${input.submissionId}</p>
    <p><strong>Responsavel:</strong> ${safeActorName} (${safeActorEmail}) - ${getRoleLabel(input.actor.role)}</p>
  `;

  await sendResendEmail({
    subject,
    htmlContent,
    textContent,
    recipients,
  });
}
