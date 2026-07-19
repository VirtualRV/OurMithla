"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Script from "next/script"
import { Mail, MapPin, Send, CheckCircle2, AlertCircle, Loader2, Phone, ShieldCheck } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

// ── grecaptcha global type declaration ─────────────────
declare global {
  interface Window {
    grecaptcha: {
      render: (
        container: HTMLElement | string,
        parameters: {
          sitekey: string
          callback?: (token: string) => void
          "expired-callback"?: () => void
          "error-callback"?: () => void
          theme?: "light" | "dark"
          size?: "normal" | "compact"
        },
      ) => number
      getResponse: (widgetId?: number) => string
      reset: (widgetId?: number) => void
      execute: (widgetId?: number) => void
    }
    onRecaptchaLoad?: () => void
  }
}

type FormState = "idle" | "submitting" | "success" | "error"

type FieldErrors = {
  name?: string
  email?: string
  phone?: string
  message?: string
  captcha?: string
}

function validate(name: string, email: string, phone: string, message: string): FieldErrors {
  const errors: FieldErrors = {}
  if (!name.trim()) errors.name = "required"
  if (!email.trim()) errors.email = "required"
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "invalid"
  if (!phone.trim()) errors.phone = "required"
  if (!message.trim()) errors.message = "required"
  return errors
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ""

export default function ContactPage() {
  const { t } = useI18n()
  const formRef = useRef<HTMLFormElement>(null)
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<number | null>(null)

  const [state, setState] = useState<FormState>("idle")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [captchaToken, setCaptchaToken] = useState<string>("")
  const [captchaReady, setCaptchaReady] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  // ── Render the reCAPTCHA widget once the script loads ──
  const renderRecaptcha = useCallback(() => {
    if (
      recaptchaContainerRef.current &&
      widgetIdRef.current === null &&
      typeof window !== "undefined" &&
      window.grecaptcha
    ) {
      widgetIdRef.current = window.grecaptcha.render(recaptchaContainerRef.current, {
        sitekey: SITE_KEY,
        theme: "light",
        callback: (token: string) => {
          setCaptchaToken(token)
          setErrors((prev) => ({ ...prev, captcha: undefined }))
        },
        "expired-callback": () => setCaptchaToken(""),
        "error-callback": () => setCaptchaToken(""),
      })
      setCaptchaReady(true)
    }
  }, [])

  // Expose callback for the ?onload= URL param on the script
  useEffect(() => {
    window.onRecaptchaLoad = renderRecaptcha
    return () => {
      window.onRecaptchaLoad = undefined
    }
  }, [renderRecaptcha])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = fd.get("name") as string
    const email = fd.get("email") as string
    const phone = fd.get("phone") as string
    const message = fd.get("message") as string

    // Field validation
    const fieldErrors = validate(name, email, phone, message)

    // Captcha validation
    if (!captchaToken) {
      fieldErrors.captcha = "required"
    }

    setErrors(fieldErrors)
    setTouched({ name: true, email: true, phone: true, message: true })

    if (Object.keys(fieldErrors).length > 0) return

    setState("submitting")
    setErrorMsg("")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message, captchaToken }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? t("contact.form.error"))
        setState("error")
        // Reset captcha on failure
        if (widgetIdRef.current !== null) {
          window.grecaptcha?.reset(widgetIdRef.current)
        }
        setCaptchaToken("")
        return
      }

      setState("success")
      formRef.current?.reset()
      setCaptchaToken("")
      if (widgetIdRef.current !== null) {
        window.grecaptcha?.reset(widgetIdRef.current)
      }
    } catch {
      setErrorMsg(t("contact.form.error"))
      setState("error")
    }
  }

  const handleBlur = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }))

  const getFieldError = (field: keyof FieldErrors): string | undefined => {
    if (!touched[field] && field !== "captcha") return undefined
    const err = errors[field]
    if (!err) return undefined
    return err === "required" ? t("contact.form.required") : t("contact.form.invalidEmail")
  }

  const nameError = getFieldError("name")
  const emailError = getFieldError("email")
  const messageError = getFieldError("message")
  const captchaError = errors.captcha ? t("contact.form.captchaRequired") : undefined

  return (
    <>
      {/* Load reCAPTCHA v2 script — onload fires renderRecaptcha */}
      <Script
        src={`https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit`}
        strategy="lazyOnload"
      />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Page heading */}
        <div className="text-center">
          <p className="font-serif text-sm uppercase tracking-[0.2em] text-primary">OurMithla</p>
          <h1 className="mt-2 font-serif text-4xl text-foreground text-balance sm:text-5xl">
            {t("contact.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-pretty">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-3">
          {/* ── Contact info panel ─────────────────────────── */}
          <aside className="flex flex-col gap-6 lg:col-span-1">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-serif text-xl text-foreground">{t("contact.info.title")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("contact.info.desc")}
              </p>

              <ul className="mt-6 flex flex-col gap-5">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Mail className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t("contact.info.emailLabel")}
                    </p>
                    <a
                      href="mailto:Info@hibousoft.com"
                      className="mt-0.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
                    >
                      Info@hibousoft.com
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Phone className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t("contact.form.phone")}
                    </p>
                    <a
                      href="tel:+911204383077"
                      className="mt-0.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
                    >
                      +91 120 438 3077 / 7042046060
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MapPin className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t("contact.info.locationLabel")}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">
                      {t("contact.info.location")}
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Cultural badge */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-gold/10 p-6 text-center shadow-sm">
              <p className="font-serif text-4xl text-primary">ॐ</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Every message is read with care and responded to within 2–3 business days.
              </p>
            </div>

            {/* Security notice */}
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-green-600" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                This form is protected by Google reCAPTCHA. Your information is
                sent securely and never shared with third parties.
              </p>
            </div>
          </aside>

          {/* ── Contact form ───────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">

              {/* Success banner */}
              {state === "success" && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{t("contact.form.success")}</p>
                    <p className="mt-0.5 text-xs opacity-80">
                      Check your inbox — a confirmation email is on its way.
                    </p>
                  </div>
                </div>
              )}

              {/* Error banner */}
              {state === "error" && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive">
                  <AlertCircle className="mt-0.5 size-5 shrink-0" />
                  <p className="text-sm">{errorMsg || t("contact.form.error")}</p>
                </div>
              )}

              <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                {/* Name + Email */}
                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-name" className="text-sm font-medium text-foreground">
                      {t("contact.form.name")}
                      <span className="ml-1 text-destructive" aria-hidden>*</span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder={t("contact.form.namePlaceholder")}
                      onBlur={() => handleBlur("name")}
                      aria-invalid={!!nameError}
                      aria-describedby={nameError ? "contact-name-error" : undefined}
                      className={`rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50 ${
                        nameError
                          ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                          : "border-border focus:border-ring"
                      }`}
                    />
                    {nameError && (
                      <p id="contact-name-error" className="text-xs text-destructive">{nameError}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-email" className="text-sm font-medium text-foreground">
                      {t("contact.form.email")}
                      <span className="ml-1 text-destructive" aria-hidden>*</span>
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder={t("contact.form.emailPlaceholder")}
                      onBlur={() => handleBlur("email")}
                      aria-invalid={!!emailError}
                      aria-describedby={emailError ? "contact-email-error" : undefined}
                      className={`rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50 ${
                        emailError
                          ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                          : "border-border focus:border-ring"
                      }`}
                    />
                    {emailError && (
                      <p id="contact-email-error" className="text-xs text-destructive">{emailError}</p>
                    )}
                  </div>
                </div>

                {/* Phone (required) */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-phone" className="text-sm font-medium text-foreground">
                    {t("contact.form.phone")}
                    <span className="ml-1 text-destructive" aria-hidden>*</span>
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder={t("contact.form.phonePlaceholder")}
                    onBlur={() => handleBlur("phone")}
                    aria-invalid={!!getFieldError("phone")}
                    aria-describedby={getFieldError("phone") ? "contact-phone-error" : undefined}
                    className={`rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50 ${
                      getFieldError("phone")
                        ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                        : "border-border focus:border-ring"
                    }`}
                  />
                  {getFieldError("phone") && (
                    <p id="contact-phone-error" className="text-xs text-destructive">{t("contact.form.required")}</p>
                  )}
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-message" className="text-sm font-medium text-foreground">
                    {t("contact.form.message")}
                    <span className="ml-1 text-destructive" aria-hidden>*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={6}
                    placeholder={t("contact.form.messagePlaceholder")}
                    onBlur={() => handleBlur("message")}
                    aria-invalid={!!messageError}
                    aria-describedby={messageError ? "contact-message-error" : undefined}
                    className={`resize-none rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50 ${
                      messageError
                        ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                        : "border-border focus:border-ring"
                    }`}
                  />
                  {messageError && (
                    <p id="contact-message-error" className="text-xs text-destructive">{messageError}</p>
                  )}
                </div>

                {/* ── Google reCAPTCHA v2 widget ──────────────── */}
                <div className="flex flex-col gap-1.5">
                  <div
                    ref={recaptchaContainerRef}
                    id="recaptcha-widget"
                    className="min-h-[78px]"
                  />
                  {!captchaReady && (
                    <p className="text-xs text-muted-foreground">Loading security check…</p>
                  )}
                  {captchaError && (
                    <p className="text-xs text-destructive">{captchaError}</p>
                  )}
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">
                    Fields marked <span className="text-destructive">*</span> are required
                  </p>
                  <button
                    id="contact-submit"
                    type="submit"
                    disabled={state === "submitting"}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60"
                  >
                    {state === "submitting" ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        {t("contact.form.submitting")}
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        {t("contact.form.submit")}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
