import { createContext, useContext, useState, useCallback } from "react";
import { X } from "lucide-react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface ToastContextType {
  toast: (options: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((options: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { ...options, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-lg shadow-lg p-4 min-w-75 max-w-105 flex items-start gap-3 ${
              t.variant === "destructive"
                ? "bg-red-600 text-white"
                : "bg-white border border-gray-200"
            }`}
          >
            <div className="flex-1">
              <div
                className={`font-semibold ${
                  t.variant === "destructive" ? "text-white" : "text-gray-900"
                }`}
              >
                {t.title}
              </div>
              {t.description && (
                <div
                  className={`text-sm mt-1 ${
                    t.variant === "destructive"
                      ? "text-white/90"
                      : "text-gray-600"
                  }`}
                >
                  {t.description}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className={`p-1 rounded hover:bg-black/10 transition ${
                t.variant === "destructive" ? "text-white" : "text-gray-500"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
