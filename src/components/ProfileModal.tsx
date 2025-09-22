/**
 * Modal de perfil de usuario con foto y estado personalizable
 */

import { useState, useRef } from 'react'
import { X, Camera, Edit3, Check, User, Smile } from 'lucide-react'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userProfile: {
    name: string
    status: string
    avatar: string | null
    qrCode: string
  }
  onUpdateProfile: (profile: { name: string; status: string; avatar: string | null }) => void
}

export function ProfileModal({ isOpen, onClose, userProfile, onUpdateProfile }: ProfileModalProps) {
  const [name, setName] = useState(userProfile.name)
  const [status, setStatus] = useState(userProfile.status)
  const [avatar, setAvatar] = useState<string | null>(userProfile.avatar)
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const statusSuggestions = [
    "Disponible",
    "Ocupado",
    "En una reunión",
    "No molestar",
    "Trabajando desde casa",
    "De viaje",
    "En pausa",
    "Conectado desde móvil",
    "Modo ninja 🥷",
    "Café primero ☕"
  ]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 5MB.')
        return
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida.')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setAvatar(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setAvatar(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const generateAvatar = (name: string) => {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2)
    
    const colors = [
      'bg-slate-500', 'bg-gray-500', 'bg-zinc-500', 'bg-neutral-500',
      'bg-stone-500', 'bg-red-500', 'bg-orange-500', 'bg-amber-500',
      'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 'bg-emerald-500',
      'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500',
      'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
      'bg-pink-500', 'bg-rose-500'
    ]
    
    const colorIndex = name.length % colors.length
    return { initials, color: colors[colorIndex] }
  }

  const handleSave = () => {
    if (name.trim().length < 2) {
      alert('El nombre debe tener al menos 2 caracteres.')
      return
    }

    onUpdateProfile({
      name: name.trim(),
      status: status.trim(),
      avatar
    })
    
    setIsEditingName(false)
    setIsEditingStatus(false)
    onClose()
  }

  const avatarData = generateAvatar(name)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card-neutral w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-neutral-primary">Mi Perfil</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className={`w-24 h-24 rounded-full ${avatarData.color} flex items-center justify-center text-white text-2xl font-bold border-4 border-gray-200 dark:border-gray-700`}>
                  {avatarData.initials || <User className="w-8 h-8" />}
                </div>
              )}
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-full shadow-lg transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-slate-600 hover:text-slate-700 font-medium"
              >
                Cambiar foto
              </button>
              {avatar && (
                <>
                  <span className="text-neutral-muted">•</span>
                  <button
                    onClick={removeAvatar}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Name Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-secondary">Nombre</label>
            {isEditingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)}
                  className="input-field text-sm"
                  autoFocus
                  maxLength={30}
                />
                <button
                  onClick={() => setIsEditingName(false)}
                  className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between group">
                <span className="text-neutral-primary font-medium">{name}</span>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-neutral-secondary hover:text-neutral-primary transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Status Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-secondary flex items-center gap-2">
              <Smile className="w-4 h-4" />
              Estado
            </label>
            {isEditingStatus ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && setIsEditingStatus(false)}
                    className="input-field text-sm"
                    placeholder="¿Cómo te sientes hoy?"
                    maxLength={100}
                  />
                  <button
                    onClick={() => setIsEditingStatus(false)}
                    className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Status Suggestions */}
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {statusSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setStatus(suggestion)}
                      className="text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-neutral-secondary hover:text-neutral-primary transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between group">
                <span className="text-neutral-secondary italic">
                  {status || "Sin estado"}
                </span>
                <button
                  onClick={() => setIsEditingStatus(true)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-neutral-secondary hover:text-neutral-primary transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* QR Code Info */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-secondary">Tu código QR</label>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <code className="text-sm font-mono text-neutral-primary break-all">
                {userProfile.qrCode}
              </code>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 btn-primary"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}