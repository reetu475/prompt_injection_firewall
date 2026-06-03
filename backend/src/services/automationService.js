export async function notifyAutomation(event) {
  if (!process.env.N8N_WEBHOOK_URL) return { sent: false };

  try {
    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "prompt_firewall_attack",
        event
      })
    });

    return { sent: response.ok };
  } catch {
    return { sent: false };
  }
}
