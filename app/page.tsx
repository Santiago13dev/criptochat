/*componente principal de la aplicacion*/

'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Check if user exists
    try {
      const user = localStorage.getItem('criptochat-user')
      if (user) {
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.log('localStorage not available')
    }
    setIsLoading(false)
  }, [])
  
  const handleStart = () => {
    const userId = 'user_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('criptochat-user', JSON.stringify({
      id: userId,
      name: 'Usuario',
      createdAt: Date.now()
    }))
    setIsAuthenticated(true)
  }
  
  const handleScanQR = () => {
    alert('Función QR en desarrollo')
  }
  
  const handleShowQR = () => {
    alert('Tu código QR: ' + Math.random().toString(36).substr(2, 9))
  }
  
  if (isLoading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return (
      <main className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">CriptoChat</h1>
          <p className="text-gray-400 mb-8">Mensajería segura</p>
          <button
            onClick={handleStart}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg"
          >
            Comenzar
          </button>
        </div>
      </main>
    )
  }
  
  return (
    <main className="h-screen bg-gray-900 text-white">
      <div className="h-full flex">
        {/* Sidebar */}
        <aside className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-purple-500">🔐</span>
              CriptoChat
              <span className="text-xs text-green-400 ml-auto">E2E Activo</span>
            </h2>
          </div>
          
          <div className="p-4 space-y-2">
            <button 
              onClick={handleScanQR}
              className="w-full flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              📷 Escanear QR
            </button>
            
            <button 
              onClick={handleShowQR}
              className="w-full flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              👤 Mi código QR
            </button>
          </div>
          
          <div className="flex-1 p-4">
            <div className="text-center text-gray-500 mt-8">
              <p>Sin contactos</p>
              <p className="text-sm mt-2">Escanea un QR para agregar</p>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-700">
            <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-lg transition">
              ⚙️ Configuración
            </button>
          </div>
        </aside>
        
        {/* Chat Area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-2">Bienvenido a CriptoChat</h2>
            <p className="text-gray-400">Selecciona una conversación para comenzar</p>
          </div>
        </div>
      </div>
    </main>
  )
}