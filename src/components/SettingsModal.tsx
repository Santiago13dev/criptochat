/**
 * Componente modal de configuraciones del chat
 * Incluye opciones de personalización, seguridad y notificaciones
 */

import { useState } from 'react'
import { X, User, Shield, Bell, Palette, Download, Trash2 } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onClearData: () => void
  onExportData: () => void
}

export function SettingsModal({ isOpen, onClose, onClearData, onExportData }: SettingsModalProps) {
  const [currentTab, setCurrentTab] = useState<'general' | 'security' | 'notifications' | 'about'>('general')
  const [notifications, setNotifications] = useState(true)
  const [sounds, setSounds] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [autoDestruct, setAutoDestruct] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Configuración</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-48 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
            <nav className="p-4 space-y-2">
              {[
                { id: 'general', label: 'General', icon: User },
                { id: 'security', label: 'Seguridad', icon: Shield },
                { id: 'notifications', label: 'Notificaciones', icon: Bell },
                { id: 'about', label: 'Acerca de', icon: Palette }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setCurrentTab(id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentTab === id
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {currentTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                    Configuración General
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Modo oscuro
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Interfaz con colores oscuros
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={darkMode}
                          onChange={(e) => setDarkMode(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-slate-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Sonidos
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Reproducir sonidos de notificación
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sounds}
                          onChange={(e) => setSounds(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-slate-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-800 dark:text-white mb-3">
                    Datos de la aplicación
                  </h4>
                  <div className="space-y-3">
                    <button
                      onClick={onExportData}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Exportar datos
                    </button>
                    <button
                      onClick={onClearData}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Limpiar todos los datos
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                    Configuración de Seguridad
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Autodestrucción automática
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Todos los mensajes se autodestruyen por defecto
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoDestruct}
                          onChange={(e) => setAutoDestruct(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-slate-600"></div>
                      </label>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2">
                        Estado de encriptación
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="text-gray-600 dark:text-gray-400">
                            Encriptación E2E activa
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="text-gray-600 dark:text-gray-400">
                            Algoritmo: secp256k1
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="text-gray-600 dark:text-gray-400">
                            Zero-Knowledge activado
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                    Configuración de Notificaciones
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Notificaciones push
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Recibir notificaciones de nuevos mensajes
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications}
                          onChange={(e) => setNotifications(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-slate-600"></div>
                      </label>
                    </div>

                    <button
                      onClick={async () => {
                        const permission = await Notification.requestPermission()
                        alert(`Permisos de notificación: ${permission}`)
                      }}
                      className="w-full px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                    >
                      Solicitar permisos de notificación
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                    Acerca de CriptoChat
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2">
                        Versión
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        CriptoChat v1.0.0
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2">
                        Tecnologías
                      </h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <p>• Next.js + TypeScript</p>
                        <p>• Socket.io para comunicación en tiempo real</p>
                        <p>• Supabase para persistencia</p>
                        <p>• @noble/secp256k1 para encriptación</p>
                        <p>• Tailwind CSS para estilos</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2">
                        Desarrollado por
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Santiago13dev
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}