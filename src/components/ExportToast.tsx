import { useState } from 'react'
import { Loader2, Minimize2, Maximize2 } from 'lucide-react'
import { toast } from 'sonner'

function ExportToast({ label }: { label: string }) {
  const [minimized, setMinimized] = useState(false)

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Exportando {label}...</span>
        <Maximize2 className="h-3 w-3 ml-1 text-gray-400" />
      </button>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        <span className="text-sm">
          Generando archivo {label}... Esto puede tardar unos segundos.
        </span>
      </div>
      <button
        onClick={() => setMinimized(true)}
        className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 shrink-0"
        title="Minimizar"
      >
        <Minimize2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function renderExportToast(label: string) {
  return toast.custom(
    (id) => <ExportToast label={label} />,
    { duration: Infinity },
  )
}
