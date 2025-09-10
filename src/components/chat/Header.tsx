/**componente del header del chat que incluye el titulo y el estado de la conexion*/
import { Shield } from 'lucide-react'

export function Header() {
  return (
    <header className="glass border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-purple-500" />
          <div>
            <h1 className="text-xl font-bold">CriptoChat</h1>
            <p className="text-xs text-gray-400">Mensajería Zero-Knowledge</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 text-xs">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-green-400">E2E Activo</span>
          </div>
        </div>
      </div>
    </header>
  )
}