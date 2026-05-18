// Cloudflare Worker — receives form submissions from secondopt.com.ua
// and forwards them to a Telegram chat via the Bot API.
//
// Required environment variables (set as Secrets in Cloudflare dashboard):
//   TELEGRAM_BOT_TOKEN  — bot token from @BotFather (e.g. 1234567890:ABCdef...)
//   TELEGRAM_CHAT_ID    — chat id (positive number for private, negative for groups)
//
// Optional:
//   ALLOWED_ORIGIN      — domain allowed to POST here (default: https://secondopt.com.ua)

const DEFAULT_ALLOWED_ORIGIN = 'https://secondopt.com.ua';

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildMessage(data) {
  const lines = ['🔔 <b>Нова заявка з secondopt.com.ua</b>'];
  if (data.subject) lines.push('', '📋 ' + escapeHtml(data.subject));
  lines.push('');
  if (data.name)     lines.push('👤 <b>Імʼя:</b> '       + escapeHtml(data.name));
  if (data.phone)    lines.push('📞 <b>Телефон:</b> <code>' + escapeHtml(data.phone) + '</code>');
  if (data.region)   lines.push('📍 <b>Регіон:</b> '     + escapeHtml(data.region));
  if (data.category) lines.push('📦 <b>Категорія:</b> '  + escapeHtml(data.category));
  if (data.source)   lines.push('🌐 <b>Джерело:</b> '    + escapeHtml(data.source));
  if (data.email)    lines.push('✉️ <b>Email:</b> '      + escapeHtml(data.email));
  lines.push('');
  if (data._form) lines.push('<i>Форма: ' + escapeHtml(data._form) + '</i>');
  lines.push('<i>Час: ' + new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' }) + '</i>');
  return lines.join('\n');
}

export default {
  async fetch(request, env) {
    const allowedOrigin = env.ALLOWED_ORIGIN || DEFAULT_ALLOWED_ORIGIN;
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), { status: 405, headers: jsonHeaders });
    }

    let data = {};
    try {
      const ct = request.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        data = await request.json();
      } else {
        const fd = await request.formData();
        for (const [k, v] of fd.entries()) data[k] = v;
      }
    } catch (e) {
      return new Response(JSON.stringify({ success: false, message: 'Bad request body' }), { status: 400, headers: jsonHeaders });
    }

    // Honeypot — silently accept bot submissions without forwarding to Telegram
    if (data.botcheck) {
      return new Response(JSON.stringify({ success: true, message: 'OK' }), { headers: jsonHeaders });
    }

    if (!data.name || !data.phone) {
      return new Response(JSON.stringify({ success: false, message: 'Missing required fields (name, phone)' }), { status: 400, headers: jsonHeaders });
    }

    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return new Response(JSON.stringify({ success: false, message: 'Worker not configured: missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID' }), { status: 500, headers: jsonHeaders });
    }

    const tgUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const tgBody = {
      chat_id: env.TELEGRAM_CHAT_ID,
      text: buildMessage(data),
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    };

    try {
      const tgResp = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tgBody),
      });
      const tgJson = await tgResp.json();
      if (!tgJson.ok) {
        return new Response(JSON.stringify({ success: false, message: 'Telegram API error: ' + (tgJson.description || tgResp.status) }), { status: 502, headers: jsonHeaders });
      }
      return new Response(JSON.stringify({ success: true, message: 'Sent' }), { headers: jsonHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ success: false, message: 'Network error: ' + e.message }), { status: 502, headers: jsonHeaders });
    }
  },
};
