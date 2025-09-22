/**
 * Componente modal de perfil de usuario
 * Permite editar foto de perfil y estado/frase personal
 */

import { useState, useRef, useEffect } from 'react'
import { X, Camera, User, Edit3, Save, RotateCcw } from 'lucide-react'
import Image from 'next/image'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentAvatar?: string
  currentStatus?: string
  currentName?: string
  onSaveProfile: (profileData: {
    avatar: string | null
    status: string
    name: string
  }) => void
}

export function ProfileModal({ 
  isOpen, 
  onClose, 
  currentAvatar = '',
  currentStatus = '',
  currentName = '',
  onSaveProfile 
}: ProfileModalProps) {
  const [avatar, setAvatar] = useState<string | null>(currentAvatar || null)
  const [status, setStatus] = useState(currentStatus)
  const [name, setName] = useState(currentName)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null)
  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAvatar(currentAvatar || null)
      setStatus(currentStatus)
      setName(currentName)
      setPreviewUrl(currentAvatar || null)
      setIsEditing(false)
      setHasChanges(false)
    }
  }, [isOpen, currentAvatar, currentStatus, currentName])

  // Track changes
  useEffect(() => {
    const avatarChanged = avatar !== currentAvatar
    const statusChanged = status !== currentStatus
    const nameChanged = name !== currentName
    setHasChanges(avatarChanged || statusChanged || nameChanged)
  }, [avatar, status, name, currentAvatar, currentStatus, currentName])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreviewUrl(result)
        setAvatar(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const removeAvatar = () => {
    setAvatar(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = () => {
    if (!name.trim()) {
      alert('El nombre es requerido')
      return
    }

    onSaveProfile({
      avatar,
      status: status.trim(),
      name: name.trim()
    })
    
    setIsEditing(false)
    onClose()
  }

  const handleCancel = () => {
    setAvatar(currentAvatar || null)
    setStatus(currentStatus)
    setName(currentName)
    setPreviewUrl(currentAvatar || null)
    setIsEditing(false)
    setHasChanges(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Mi Perfil
          </h2>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Avatar preview"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              
              {/* Camera button overlay */}
              <button
                onClick={triggerFileInput}
                className="absolute -bottom-1 -right-1 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors shadow-lg"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={triggerFileInput}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cambiar foto
              </button>
              
              {previewUrl && (
                <button
                  onClick={removeAvatar}
                  className="px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                >
                  Eliminar
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Name Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre de usuario
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ingresa tu nombre"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Máximo 50 caracteres
            </p>
          </div>

          {/* Status Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Estado / Frase personal
            </label>
            <div className="relative">
              <textarea
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="¿Qué está pasando?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                maxLength={200}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {status.length}/200
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Comparte lo que estás pensando o tu estado actual
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
            <p className="text-xs text-purple-700 dark:text-purple-300">
              🔒 Tu información de perfil se almacena de forma segura y solo es visible para tus contactos.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          
          <div className="flex gap-2">
            {hasChanges && (
              <button
                onClick={() => {
                  setAvatar(currentAvatar || null)
                  setStatus(currentStatus)
                  setName(currentName)
                  setPreviewUrl(currentAvatar || null)
                  setHasChanges(false)
                }}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Deshacer
              </button>
            )}
            
            <button
              onClick={handleSave}
              disabled={!hasChanges || !name.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}