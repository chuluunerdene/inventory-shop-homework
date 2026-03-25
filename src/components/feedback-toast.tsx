"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type FeedbackToastProps = {
  tone?: "success" | "error" | null;
  text?: string | null;
  clearQueryParams?: boolean;
  duration?: number;
};

type ToastState = {
  text: string;
  tone: "success" | "error";
};

export function FeedbackToast({
  tone,
  text,
  clearQueryParams = false,
  duration = 3200,
}: FeedbackToastProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMessage = Boolean(tone && text);
  const clearRequestedRef = useRef(false);
  const [toast, setToast] = useState<ToastState | null>(
    hasMessage && tone && text ? { tone, text } : null,
  );
  const [isVisible, setIsVisible] = useState(hasMessage);

  const title = useMemo(() => {
    if (!toast) {
      return "";
    }

    return toast.tone === "error" ? "Алдаа" : "Амжилттай";
  }, [toast]);

  useEffect(() => {
    if (!tone || !text) {
      clearRequestedRef.current = false;
      return;
    }

    setToast({ tone, text });
    setIsVisible(true);

    if (!clearQueryParams || clearRequestedRef.current) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    const hasToastParams = params.has("message") || params.has("error");

    if (!hasToastParams) {
      clearRequestedRef.current = true;
      return;
    }

    clearRequestedRef.current = true;
    params.delete("message");
    params.delete("error");

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [clearQueryParams, pathname, router, searchParams, text, tone]);

  useEffect(() => {
    if (!toast || !isVisible) {
      return;
    }

    const hideTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => window.clearTimeout(hideTimer);
  }, [duration, isVisible, toast]);

  useEffect(() => {
    if (!toast || isVisible) {
      return;
    }

    const cleanupTimer = window.setTimeout(() => {
      setToast(null);
    }, 220);

    return () => window.clearTimeout(cleanupTimer);
  }, [isVisible, toast]);

  if (!toast) {
    return null;
  }

  return (
    <div
      className={`feedback-toast feedback-toast--${toast.tone} ${
        isVisible ? "feedback-toast--visible" : "feedback-toast--hidden"
      }`}
      role={toast.tone === "error" ? "alert" : "status"}
      aria-live={toast.tone === "error" ? "assertive" : "polite"}
    >
      <span className="feedback-toast__indicator" aria-hidden="true" />

      <div className="feedback-toast__body">
        <strong className="feedback-toast__title">{title}</strong>
        <p className="feedback-toast__text">{toast.text}</p>
      </div>

      <button
        type="button"
        className="feedback-toast__close"
        onClick={() => setIsVisible(false)}
        aria-label="Мэдэгдлийг хаах"
      >
        x
      </button>
    </div>
  );
}
