import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

interface RecaptchaVerifyResponse {
  success: boolean
  challenge_ts?: string
  hostname?: string
  "error-codes"?: string[]
}

function buildNotificationHtml(
  name: string,
  email: string,
  phone: string,
  message: string,
) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Georgia, serif; background: #fdf6ef; margin: 0; padding: 0; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.08); }
    .header { background: #c8622d; padding: 28px 32px; }
    .header h1 { margin: 0; color: #fff; font-size: 22px; letter-spacing: .5px; }
    .header p { margin: 4px 0 0; color: rgba(255,255,255,.8); font-size: 13px; font-family: sans-serif; }
    .body { padding: 32px; }
    .field { margin-bottom: 20px; }
    .label { font-size: 11px; font-family: sans-serif; text-transform: uppercase; letter-spacing: .8px; color: #999; margin-bottom: 4px; }
    .value { font-size: 15px; color: #2a2a2a; line-height: 1.6; }
    .message-box { background: #fdf6ef; border-left: 4px solid #c8622d; border-radius: 4px; padding: 16px; margin-top: 4px; white-space: pre-wrap; }
    .footer { padding: 20px 32px; border-top: 1px solid #eee; font-size: 12px; font-family: sans-serif; color: #aaa; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>ॐ OurMithla — New Message</h1>
      <p>A visitor has submitted the contact form.</p>
    </div>
    <div class="body">
      <div class="field">
        <div class="label">Name</div>
        <div class="value">${name}</div>
      </div>
      <div class="field">
        <div class="label">Email</div>
        <div class="value"><a href="mailto:${email}" style="color:#c8622d;">${email}</a></div>
      </div>
      ${phone ? `<div class="field"><div class="label">Phone</div><div class="value">${phone}</div></div>` : ""}
      <div class="field">
        <div class="label">Message</div>
        <div class="value message-box">${message}</div>
      </div>
    </div>
    <div class="footer">OurMithla · Culture, Almanac &amp; Community of Mithila</div>
  </div>
</body>
</html>`
}

function buildConfirmationHtml(name: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Georgia, serif; background: #fdf6ef; margin: 0; padding: 0; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.08); }
    .header { background: #c8622d; padding: 32px; text-align: center; }
    .header h1 { margin: 0; color: #fff; font-size: 26px; }
    .header p { margin: 8px 0 0; color: rgba(255,255,255,.85); font-family: sans-serif; font-size: 13px; }
    .body { padding: 36px 32px; text-align: center; }
    .om { font-size: 48px; color: #c8622d; }
    .body p { font-size: 15px; color: #444; line-height: 1.7; margin: 16px 0; }
    .footer { padding: 20px 32px; border-top: 1px solid #eee; font-size: 12px; font-family: sans-serif; color: #aaa; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>ॐ OurMithla</h1>
      <p>Culture, Almanac &amp; Community of Mithila</p>
    </div>
    <div class="body">
      <div class="om">ॐ</div>
      <p>Namaste <strong>${name}</strong>,</p>
      <p>Thank you for reaching out to us. We have received your message and will get back to you within <strong>2–3 business days</strong>.</p>
      <p>In the meantime, explore our blog for stories, traditions, and the daily Panchang of Mithila.</p>
    </div>
    <div class="footer">OurMithla · Culture, Almanac &amp; Community of Mithila<br/>This is an automated response — please do not reply to this email.</div>
  </div>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone = "", message, captchaToken } = body as {
      name: string
      email: string
      phone?: string
      message: string
      captchaToken: string
    }

    // ── Field validation ───────────────────────────────────
    if (!name?.trim() || !email?.trim() || !phone?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      )
    }

    // ── reCAPTCHA (only when secret is configured) ─────────
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY
    if (recaptchaSecret) {
      if (!captchaToken) {
        return NextResponse.json(
          { error: "Captcha token missing." },
          { status: 400 },
        )
      }

      const verifyRes = await fetch(
        "https://www.google.com/recaptcha/api/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: recaptchaSecret,
            response: captchaToken,
          }),
        },
      )
      const verifyData: RecaptchaVerifyResponse = await verifyRes.json()

      if (!verifyData.success) {
        console.warn("[contact] reCAPTCHA failed:", verifyData["error-codes"])
        return NextResponse.json(
          { error: "Captcha verification failed. Please try again." },
          { status: 400 },
        )
      }
    }

    // ── Build nodemailer transporter ───────────────────────
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false, // STARTTLS (port 587)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    const fromDisplay = `"${process.env.SMTP_FROM_NAME ?? "OurMithla"}" <${process.env.SMTP_FROM_EMAIL}>`
    const notificationTo = process.env.NOTIFICATION_EMAIL ?? process.env.SMTP_USER

    // ── 1. Notification email → site admin ────────────────
    await transporter.sendMail({
      from: fromDisplay,
      to: notificationTo,
      replyTo: email,
      subject: `📩 New Contact Form Message — ${name}`,
      html: buildNotificationHtml(name, email, phone, message),
    })

    // ── 2. Auto-reply → visitor ────────────────────────────
    await transporter.sendMail({
      from: fromDisplay,
      to: email,
      subject: "We received your message — OurMithla",
      html: buildConfirmationHtml(name),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[contact] Unexpected error:", err)
    return NextResponse.json(
      { error: "Server error. Please try again later." },
      { status: 500 },
    )
  }
}
