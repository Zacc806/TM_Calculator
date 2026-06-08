import type { LeadPayload } from "../src/core/lead";
import { normalizeKzPhone } from "../src/core/phone";
import { formatTenge } from "../src/core/money";

/**
 * Sends a new-lead notification to Telegram if a bot token + chat id are set.
 * No-op until configured — the site keeps working without it.
 */
export async function notifyTelegram(lead: LeadPayload): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const phone = normalizeKzPhone(lead.phone) ?? lead.phone;
  const text = [
    "🏠 Новая заявка с калькулятора Atamura",
    `Имя: ${lead.name.trim()}`,
    `Телефон: +${phone}`,
    `Стоимость: ${formatTenge(lead.cost)}`,
    `Первоначальный взнос: ${formatTenge(lead.downPayment)}`,
    `Программа: ${lead.programName}`,
    `Ежемесячный платёж: ${formatTenge(lead.monthlyPayment)}`,
    `Источник: ${lead.source}`,
  ].join("\n");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Telegram sendMessage failed: ${res.status}`);
}
