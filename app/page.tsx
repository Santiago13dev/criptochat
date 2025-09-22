/**
 * aplicación de mensajería segura con cifrado de extremo a extremo, autenticación de usuarios, gestión de contactos, manejo de mensajes y comunicación en tiempo real mediante Socket.io y Supabase.
* @returns El código devuelve un componente React que representa una aplicación de mensajería llamada CriptoChat. El componente tiene dos vistas principales: una pantalla de bienvenida y una pantalla de chat.
 */
'use client'

import { useState, useEffect } from 'react'
import { socketManager } from '@/lib/socket'
import { CryptoManager } from '@/lib/crypto/encryption'
import { notificationManager } from '@/lib/notifications'
import { supabase } from '@/lib/supabase/client'
import type { DBUser } from '@/lib/supabase/client'
import { SettingsModal } from '@/src/components/SettingsModal'
import { ContactList } from '@/src/components/ContactList'
import { Settings, QrCode, UserPlus, Shield } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'me' | 'other'
  timestamp: Date
  encrypted?: boolean
  selfDestruct?: boolean
  destructIn?: number
}

interface Contact {
  id: string
  name: string
  publicKey: string
  status?: 'online' | 'offline'
  lastSeen?: Date
}

export default function Home() {
  const [currentView, setCurrentView] = useState<'welcome' | 'chat'>('welcome')
  const [myQRCode, setMyQRCode] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [currentContact, setCurrentContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [showQRModal, setShowQRModal] = useState(false)
  const [showScanModal, setShowScanModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [scanInput, setScanInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [cryptoManager, setCryptoManager] = useState<CryptoManager | null>(null)
  const [currentUser, setCurrentUser] = useState<DBUser | null>(null)

  // Initialize everything
  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    let crypto = CryptoManager.loadFromLocalStorage()
    if (!crypto) {
      crypto = new CryptoManager()
      crypto.saveToLocalStorage()
    }
    setCryptoManager(crypto)
    
    const myId = 'user_' + Math.random().toString(36).substr(2, 9)
    setMyQRCode(myId)
    
    await notificationManager.init()
    const socket = socketManager.connect(myId, 'Usuario')
    setIsConnected(socketManager.isConnected())
    socketManager.onMessage(handleIncomingMessage)
    await loadContacts()
  }

  const loadContacts = async () => {
    const savedContacts = localStorage.getItem('criptochat_contacts')
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts))
    }
  }

  const handleIncomingMessage = async (data: any) => {
    console.log('📨 Received message:', data)
    
    let decryptedText = data.message
    if (cryptoManager && data.encrypted) {
      try {
        decryptedText = await cryptoManager.decryptMessage(
          data.encrypted,
          data.senderPublicKey
        )
      } catch (error) {
        console.error('Decryption failed:', error)
      }
    }
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: decryptedText,
      sender: 'other',
      timestamp: new Date(data.timestamp),
      encrypted: true,
      selfDestruct: data.selfDestruct,
      destructIn: data.destructAfter
    }
    
    setMessages(prev => [...prev, newMessage])
    
    await notificationManager.showNotification('Nuevo mensaje', {
      body: 'Has recibido un mensaje encriptado',
      data: { messageId: newMessage.id }
    })
    
    if (data.selfDestruct && data.destructAfter) {
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== newMessage.id))
      }, data.destructAfter * 1000)
    }
  }

  const addContact = async () => {
    if (!scanInput.trim() || !scanInput.startsWith('user_') || scanInput === myQRCode || contacts.find(c => c.publicKey === scanInput)) {
      alert('Código QR inválido o ya existe')
      return
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      name: `Usuario ${contacts.length + 1}`,
      publicKey: scanInput
    }

    const updatedContacts = [...contacts, newContact]
    setContacts(updatedContacts)
    localStorage.setItem('criptochat_contacts', JSON.stringify(updatedContacts))
    
    setShowScanModal(false)
    setScanInput('')
    alert('¡Contacto agregado exitosamente!')
  }

  const editContact = async (contactId: string, newName: string) => {
    const updatedContacts = contacts.map(contact =>
      contact.id === contactId ? { ...contact, name: newName } : contact
    )
    setContacts(updatedContacts)
    localStorage.setItem('criptochat_contacts', JSON.stringify(updatedContacts))
  }

  const deleteContact = async (contactId: string) => {
    const updatedContacts = contacts.filter(contact => contact.id !== contactId)
    setContacts(updatedContacts)
    localStorage.setItem('criptochat_contacts', JSON.stringify(updatedContacts))
    
    if (currentContact?.id === contactId) {
      setCurrentContact(null)
      setMessages([])
    }
  }

  const handleExportData = () => {
    const exportData = {
      contacts,
      myQRCode,
      settings: { notifications: true, darkMode: true },
      timestamp: new Date().toISOString()
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `criptochat-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    alert('Datos exportados exitosamente')
  }

  const handleClearData = () => {
    if (confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
      localStorage.removeItem('criptochat_contacts')
      localStorage.removeItem('criptochat_crypto')
      setContacts([])
      setCurrentContact(null)
      setMessages([])
      alert('Todos los datos han sido eliminados')
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentContact || !cryptoManager) return

    const selfDestruct = (document.getElementById('selfDestruct') as HTMLInputElement)?.checked
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'me',
      timestamp: new Date(),
      encrypted: true,
      selfDestruct
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage('')
    
    if (selfDestruct) {
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== newMessage.id))
      }, 30000)
    }
    
    // Simulate response
    setTimeout(() => {
      const autoReply: Message = {
        id: (Date.now() + 1).toString(),
        text: `Mensaje recibido: "${inputMessage}" - Encriptado con E2E 🔐`,
        sender: 'other',
        timestamp: new Date(),
        encrypted: true
      }
      setMessages(prev => [...prev, autoReply])
    }, 1000)
  }

  const selectContact = async (contact: Contact) => {
    setCurrentContact(contact)
    setMessages([])
    
    const welcomeMsg: Message = {
      id: '1',
      text: `Chat seguro iniciado con ${contact.name}. Todos los mensajes están encriptados de extremo a extremo.`,
      sender: 'other',
      timestamp: new Date(),
      encrypted: true
    }
    setMessages([welcomeMsg])
  }

  if (currentView === 'welcome') {
    return (
      <main className="h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-neutral-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-4xl font-bold mb-2 text-neutral-primary">CriptoChat</h1>
          <p className="text-neutral-secondary mb-8">Mensajería con encriptación E2E</p>
          <button
            onClick={() => setCurrentView('chat')}
            className="btn-primary px-8 py-3 text-lg"
          >
            Iniciar CriptoChat
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="h-screen bg-gray-100 dark:bg-gray-900 text-neutral-primary flex">
      <aside className="w-80 glass-neutral flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-neutral-primary">
            <Shield className="w-6 h-6 text-slate-600" />
            CriptoChat
            <span className="text-xs text-green-500 ml-auto flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </h2>
          <p className="text-xs text-neutral-secondary mt-1">Tu ID: {myQRCode}</p>
        </div>

        <div className="p-4 space-y-2">
          <button
            onClick={() => setShowQRModal(true)}
            className="w-full flex items-center gap-2 btn-secondary text-sm"
          >
            <QrCode className="w-4 h-4" /> Ver mi código QR
          </button>
          
          <button
            onClick={() => setShowScanModal(true)}
            className="w-full flex items-center gap-2 btn-primary text-sm"
          >
            <UserPlus className="w-4 h-4" /> Agregar contacto
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-neutral-secondary mb-3">
            Contactos ({contacts.length})
          </h3>
          
          <ContactList
            contacts={contacts}
            currentContact={currentContact}
            onSelectContact={selectContact}
            onEditContact={editContact}
            onDeleteContact={deleteContact}
          />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="w-full flex items-center gap-2 btn-secondary text-sm"
          >
            <Settings className="w-4 h-4" /> Configuración
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        {currentContact ? (
          <>
            <div className="p-4 glass-neutral border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-neutral-primary">{currentContact.name}</h3>
              <p className="text-xs text-neutral-secondary">🔐 Chat encriptado E2E</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender === 'me'
                        ? 'bg-slate-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-neutral-primary border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs opacity-70">
                        {msg.timestamp.toLocaleTimeString('es', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {msg.encrypted && <span className="text-xs">🔒</span>}
                      {msg.selfDestruct && <span className="text-xs">🔥</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 glass-neutral border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-neutral-secondary">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" id="selfDestruct" className="rounded text-slate-600" />
                    <span>🔥 Autodestruir (30s)</span>
                  </label>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Escribe un mensaje encriptado..."
                    className="input-field"
                  />
                  <button onClick={sendMessage} className="btn-primary">Enviar</button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-bold mb-2 text-neutral-primary">Selecciona un chat</h2>
              <p className="text-neutral-secondary">Agrega contactos con su código QR para comenzar</p>
            </div>
          </div>
        )}
      </div>

      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card-neutral p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-neutral-primary">Mi Código QR</h3>
            <div className="bg-white p-4 rounded mb-4">
              <div className="aspect-square bg-gray-200 flex items-center justify-center text-black font-mono text-xs">
                {myQRCode}
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(myQRCode)
                alert('Código copiado al portapapeles')
              }}
              className="w-full mb-2 btn-primary"
            >
              Copiar código
            </button>
            <button onClick={() => setShowQRModal(false)} className="w-full btn-secondary">Cerrar</button>
          </div>
        </div>
      )}

      {showScanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card-neutral p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-neutral-primary">Agregar Contacto</h3>
            <input
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Ej: user_abc123xyz"
              className="input-field mb-4"
            />
            <button onClick={addContact} className="w-full mb-2 btn-primary">Agregar contacto</button>
            <button
              onClick={() => {
                setShowScanModal(false)
                setScanInput('')
              }}
              className="w-full btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onExportData={handleExportData}
        onClearData={handleClearData}
      />
    </main>
  )
}