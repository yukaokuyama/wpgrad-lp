const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = 'yuka.1218o@gmail.com';
const FROM_EMAIL = 'onboarding@resend.dev';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ status: 'error', message: 'Method Not Allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ status: 'error', message: 'リクエストが不正です' }) };
  }

  const { name, company, email, url, message } = body;

  if (!name) return { statusCode: 400, body: JSON.stringify({ status: 'error', message: 'お名前を入力してください' }) };
  if (!email) return { statusCode: 400, body: JSON.stringify({ status: 'error', message: 'メールアドレスを入力してください' }) };
  if (!validateEmail(email)) return { statusCode: 400, body: JSON.stringify({ status: 'error', message: 'メールアドレスの形式が正しくありません' }) };
  if (!message) return { statusCode: 400, body: JSON.stringify({ status: 'error', message: 'ご相談内容を入力してください' }) };

  // 1. 運営者宛メール
  const adminResult = await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    replyTo: email,
    subject: `【お問い合わせ】${name}様よりお問い合わせが届きました`,
    html: `
      <h2>新しいお問い合わせが届きました</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px;">
        <tr><th style="text-align:left;padding:8px;background:#f5f5f5;border:1px solid #ddd;width:30%;">お名前</th><td style="padding:8px;border:1px solid #ddd;">${name}</td></tr>
        <tr><th style="text-align:left;padding:8px;background:#f5f5f5;border:1px solid #ddd;">会社名</th><td style="padding:8px;border:1px solid #ddd;">${company || '—'}</td></tr>
        <tr><th style="text-align:left;padding:8px;background:#f5f5f5;border:1px solid #ddd;">メールアドレス</th><td style="padding:8px;border:1px solid #ddd;"><a href="mailto:${email}">${email}</a></td></tr>
        ${url ? `<tr><th style="text-align:left;padding:8px;background:#f5f5f5;border:1px solid #ddd;">WebサイトURL</th><td style="padding:8px;border:1px solid #ddd;"><a href="${url}">${url}</a></td></tr>` : ''}
        <tr><th style="text-align:left;padding:8px;background:#f5f5f5;border:1px solid #ddd;">ご相談内容</th><td style="padding:8px;border:1px solid #ddd;white-space:pre-wrap;">${message}</td></tr>
      </table>
      <p style="color:#888;font-size:12px;margin-top:16px;">このメールはWebサイトの問い合わせフォームから自動送信されました。</p>
    `,
  });

  if (adminResult.error) {
    console.error('Admin email error:', adminResult.error);
    return { statusCode: 500, body: JSON.stringify({ status: 'error', message: 'メール送信に失敗しました。しばらく経ってから再度お試しください。' }) };
  }

  // 2. お客様への自動返信
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    replyTo: ADMIN_EMAIL,
    subject: 'お問い合わせを受け付けました',
    html: `
      <p>${name} 様</p>
      <p>この度はお問い合わせいただき、誠にありがとうございます。<br>
      以下の内容でお問い合わせを受け付けました。<br>
      内容確認後、担当者より通常3営業日以内にご連絡いたします。</p>
      <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;" />
      <h3 style="font-size:14px;color:#555;">■ お問い合わせ内容</h3>
      <table style="border-collapse:collapse;width:100%;max-width:600px;">
        <tr><th style="text-align:left;padding:8px;background:#f5f5f5;border:1px solid #ddd;width:30%;">お名前</th><td style="padding:8px;border:1px solid #ddd;">${name}</td></tr>
        <tr><th style="text-align:left;padding:8px;background:#f5f5f5;border:1px solid #ddd;">会社名</th><td style="padding:8px;border:1px solid #ddd;">${company || '—'}</td></tr>
        <tr><th style="text-align:left;padding:8px;background:#f5f5f5;border:1px solid #ddd;">メールアドレス</th><td style="padding:8px;border:1px solid #ddd;">${email}</td></tr>
        ${url ? `<tr><th style="text-align:left;padding:8px;background:#f5f5f5;border:1px solid #ddd;">WebサイトURL</th><td style="padding:8px;border:1px solid #ddd;">${url}</td></tr>` : ''}
        <tr><th style="text-align:left;padding:8px;background:#f5f5f5;border:1px solid #ddd;">ご相談内容</th><td style="padding:8px;border:1px solid #ddd;white-space:pre-wrap;">${message}</td></tr>
      </table>
      <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;" />
      <p style="color:#888;font-size:12px;">※ このメールは自動送信です。返信はお受けできません。<br>
      お問い合わせは <a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a> までお願いいたします。</p>
    `,
  });

  return { statusCode: 200, body: JSON.stringify({ status: 'ok' }) };
};
