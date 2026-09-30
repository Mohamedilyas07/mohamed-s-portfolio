function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { senderName, senderEmail, senderMessage } = req.body || {};
    if (!senderName?.trim()) return res.status(400).json({ success: false, error: 'Name is required.' });
    if (!senderMessage?.trim()) return res.status(400).json({ success: false, error: 'Message is required.' });

    const cleanEmail = senderEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail.trim()) ? senderEmail.trim() : null;
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, error: 'RESEND_API_KEY is not configured.' });

    const safeName = escapeHtml(senderName.trim());
    const safeEmail = cleanEmail ? escapeHtml(cleanEmail) : 'Not provided';
    const safeMessage = escapeHtml(senderMessage.trim());
    const emailHtml = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#08080c;color:#f8fafc;padding:24px"><div style="max-width:600px;margin:auto;background:#0e0e16;border:1px solid #333;border-radius:16px;padding:32px"><h2>New Message from Portfolio</h2><p><b>Sender:</b> ${safeName}</p><p><b>Email:</b> ${safeEmail}</p><p><b>Message:</b></p><div style="white-space:pre-wrap">${safeMessage}</div></div></body></html>`;

    const payload = {
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: ['mohamedilyas1730@gmail.com'],
      subject: `[Portfolio Inquiry] ${senderName.trim()}`,
      html: emailHtml,
      text: `Name: ${senderName}\nEmail: ${cleanEmail || 'Not provided'}\n\nMessage:\n${senderMessage}`,
    };
    if (cleanEmail) payload.reply_to = cleanEmail;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey.trim()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ success: false, error: data?.message || 'Resend request failed.' });
    return res.status(200).json({ success: true, message: 'Email dispatched successfully.', id: data?.id });
  } catch (error) {
    return res.status(500).json({ success: false, error: error?.message || 'Internal server error.' });
  }
}
