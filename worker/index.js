export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = env.ALLOWED_ORIGIN || "https://srijan-t0d0.github.io";

    const corsHeaders = {
      "Access-Control-Allow-Origin": allowed,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return Response.json(
        { error: "Method not allowed" },
        { status: 405, headers: corsHeaders }
      );
    }

    try {
      const { name, email, message } = await request.json();

      if (!name || !email || !message) {
        return Response.json(
          { error: "All fields are required" },
          { status: 400, headers: corsHeaders }
        );
      }

      // Basic email format check
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return Response.json(
          { error: "Invalid email" },
          { status: 400, headers: corsHeaders }
        );
      }

      // Forward to your email via Cloudflare Email Workers or a webhook.
      // For now, we log and store. You can add MailChannels or a webhook later.
      // Example: forward to a Discord webhook, Telegram bot, or email service.

      console.log(`Contact form: ${name} <${email}> — ${message}`);

      // If you set a DISCORD_WEBHOOK secret, send there too
      if (env.DISCORD_WEBHOOK) {
        await fetch(env.DISCORD_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `**New contact form submission**\n**Name:** ${name}\n**Email:** ${email}\n**Message:** ${message}`,
          }),
        });
      }

      return Response.json(
        { ok: true, message: "Message sent" },
        { status: 200, headers: corsHeaders }
      );
    } catch (err) {
      return Response.json(
        { error: "Invalid request body" },
        { status: 400, headers: corsHeaders }
      );
    }
  },
};
