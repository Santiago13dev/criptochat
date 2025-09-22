/**componente del header del chat que incluye el titulo y el estado de la conexion para chats*/
import { Shield, User, Settings } from 'lucide-react'

interface HeaderProps {
  onOpenProfile?: () => void
  onOpenSettings?: () => void
  userAvatar?: string
  userName?: string
}

export function Header({ onOpenProfile, onOpenSettings, userAvatar, userName }: HeaderProps) {
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
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-green-400">E2E Activo</span>
          </div>
          
          {/* Profile Button */}
          <button
            onClick={onOpenProfile}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            title="Ver perfil"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName || 'Usuario'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-gray-400" />
              )}
            </div>
            {userName && (
              <span className="text-sm text-gray-300 hidden sm:block">{userName}</span>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            title="Configuración"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  )
}