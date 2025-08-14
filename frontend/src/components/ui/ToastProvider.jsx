import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const ToastContext = createContext({ showToast: () => {} })

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((toast) => {
    const id = ++idRef.current
    const newToast = {
      id,
      title: toast.title || '',
      description: toast.description || '',
      type: toast.type || 'info',
      duration: toast.duration ?? 3000
    }
    setToasts((prev) => [...prev, newToast])

    if (newToast.duration > 0) {
      setTimeout(() => removeToast(id), newToast.duration)
    }
  }, [removeToast])

  const contextValue = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[9999] space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`pointer-events-auto max-w-sm cursor-pointer rounded-lg border p-4 shadow-lg transition-all duration-200 ${
              toast.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-900'
                : toast.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-900'
                : 'border-blue-200 bg-white text-gray-900 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800'
            }`}
          >
            {toast.title && <div className="font-semibold mb-1">{toast.title}</div>}
            {toast.description && (
              <div className="text-sm opacity-90">{toast.description}</div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}