/**
 * Oracular contact-form Worker (Cloudflare Workers, ES module syntax).
 *
 * Flow: the website POSTs JSON here, and this Worker forwards the message to
 * Resend, which emails support@sface.no. The Resend API key is read from the
 * Worker secret RESEND_API_KEY (never exposed to the browser).
 *
 * Deploy: Cloudflare dashboard -> Workers & Pages -> oracular-mail
 *   -> Edit code -> paste this file -> Deploy.
 * Then: Settings -> Variables and Secrets -> add secret RESEND_API_KEY.
 */

const ALLOWED_ORIGINS = [
  'https://oracular.no',
  'https://www.oracular.no',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
];

const TO_EMAIL = 'support@sface.no';
const FROM_EMAIL = 'Oracular Website <website@oracular.no>';

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.indexOf(origin) !== -1 ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

function clean(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'Method not allowed' }, 405, origin);
    }

    let data;
    try {
      data = await request.json();
    } catch (err) {
      return jsonResponse({ ok: false, error: 'Invalid JSON body' }, 400, origin);
    }

    // Honeypot: real users leave this hidden field empty. Bots fill it in.
    if (clean(data.botcheck, 200)) {
      return jsonResponse({ ok: true }, 200, origin);
    }

    const name = clean(data.name, 200);
    const email = clean(data.email, 200);
    const company = clean(data.company, 200);
    const message = clean(data.message, 5000);

    if (!name || !email || !message) {
      return jsonResponse({ ok: false, error: 'Name, email and message are required' }, 400, origin);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ ok: false, error: 'Invalid email address' }, 400, origin);
    }
    if (!env.RESEND_API_KEY) {
      return jsonResponse({ ok: false, error: 'Email is not configured' }, 500, origin);
    }

    const text =
      'New enquiry from the Oracular website\n\n' +
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Company: ' + (company || '-') + '\n\n' +
      'Message:\n' + message + '\n';

    const resend = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: email,
        subject: 'Oracular website enquiry from ' + name,
        text: text,
      }),
    });

    if (!resend.ok) {
      return jsonResponse({ ok: false, error: 'Email send failed' }, 502, origin);
    }
    return jsonResponse({ ok: true }, 200, origin);
  },
};
