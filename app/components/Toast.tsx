"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type ToastVariant = "success" | "error" | "info";
type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastOptions = {
  message: string;
  variant?: ToastVariant;
  type?: ToastVariant;
};

type ToastContextValue = {
  addToast: (messageOrOptions: string | ToastOptions, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue>({
  addToast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success:
    "border border-[var(--accent)]/40 bg-[var(--accent)] text-white backdrop-blur-md",
  error:
    "border border-[#df795f]/40 bg-[#df795f] text-white backdrop-blur-md",
  info: "border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] backdrop-blur-md",
};

const VARIANT_ICONS: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsExiting(true), 2600);
    const removeTimer = setTimeout(() => onRemove(toast.id), 3000);
    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, onRemove]);

  return (
    <div
      role="alert"
      className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-300 ${
        VARIANT_STYLES[toast.variant]
      } ${isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}`}
      style={{ animation: "slideInRight 0.3s ease-out" }}
    >
      <span className="text-base" aria-hidden="true">
        {VARIANT_ICONS[toast.variant]}
      </span>
      {toast.message}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (messageOrOptions: string | ToastOptions, variant: ToastVariant = "success") => {
      const id = crypto.randomUUID();
      let message = "";
      let actualVariant: ToastVariant = variant;

      if (typeof messageOrOptions === "string") {
        message = messageOrOptions;
      } else {
        message = messageOrOptions.message;
        actualVariant = messageOrOptions.type || messageOrOptions.variant || "success";
      }

      setToasts((current) => [...current.slice(-4), { id, message, variant: actualVariant }]);
    },
    [],
  );

  const success = useCallback((msg: string) => addToast(msg, "success"), [addToast]);
  const error = useCallback((msg: string) => addToast(msg, "error"), [addToast]);
  const info = useCallback((msg: string) => addToast(msg, "info"), [addToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext value={{ addToast, success, error, info }}>
      {children}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2"
          aria-live="polite"
        >
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </div>
      )}
    </ToastContext>
  );
}
