"use client"

import { useState, useEffect } from "react"
import { Download, X, Smartphone, Check } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Check if already in standalone app mode
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setInstalled(true)
      return
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Check if user dismissed prompt in this session
      const dismissed = sessionStorage.getItem("pwa_install_dismissed")
      if (!dismissed) {
        setShowPrompt(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)

    window.addEventListener("appinstalled", () => {
      setInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
    }
  }, [])

  async function handleInstallClick() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === "accepted") {
      setInstalled(true)
    }
    setShowPrompt(false)
    setDeferredPrompt(null)
  }

  function handleDismiss() {
    setShowPrompt(false)
    sessionStorage.setItem("pwa_install_dismissed", "true")
  }

  if (!showPrompt || installed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-background/95 p-3.5 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Smartphone className="size-5" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-foreground">Install OurMithla App</h4>
            <p className="text-xs text-muted-foreground">Add to Home Screen for fast offline access</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all shrink-0"
          >
            <Download className="size-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Close install prompt"
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
