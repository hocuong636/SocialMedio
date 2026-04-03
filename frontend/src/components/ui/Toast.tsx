import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useUIStore } from '../../store/useUIStore'

const iconMap = {
  success: <CheckCircle size={18} className="text-green-500" />,
  error: <AlertCircle size={18} className="text-red-500" />,
  info: <Info size={18} className="text-blue-500" />,
}

const borderMap = {
  success: 'border-l-4 border-green-500',
  error: 'border-l-4 border-red-500',
  info: 'border-l-4 border-blue-500',
}

export default function Toast() {
  const { toasts, removeToast } = useUIStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-start gap-3 bg-white ${borderMap[toast.type]}
            rounded-xl shadow-xl px-4 py-3 min-w-72 max-w-sm
            animate-in slide-in-from-right-4 fade-in duration-300
          `}
        >
          <span className="mt-0.5 flex-shrink-0">{iconMap[toast.type]}</span>
          <p className="text-sm text-gray-800 flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
