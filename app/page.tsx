'use client'

import { useState, useEffect, useRef } from 'react'
import { socketManager } from '@/lib/socket'
import { CryptoManager } from '@/lib/crypto/encryption'
import { notificationManager } from '@/lib/notifications'
import { supabase } from '@/lib/supabase/client'
import type { DBUser, DBMessage, DBContact } from '@/lib/supabase/client'

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
  const [scanInput, setScanInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [cryptoManager, setCryptoManager] = useState<CryptoManager | null>(null)
  const [currentUser, setCurrentUser] = useState<DBUser | null>(null)

  // Initialize everything
  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    // 1. Initialize crypto
    let crypto = CryptoManager.loadFromLocalStorage()
    if (!crypto) {
      crypto = new CryptoManager()
      crypto.saveToLocalStorage()
    }
    setCryptoManager(crypto)
    
    // 2. Generate or load user ID
    const myId = 'user_' + Math.random().toString(36).substr(2, 9)
    setMyQRCode(myId)
    
    // 3. Initialize notifications
    await notificationManager.init()
    
    // 4. Connect to Socket.io
    const socket = socketManager.connect(myId, 'Usuario')
    setIsConnected(socketManager.isConnected())
    
    // 5. Setup message handler
    socketManager.onMessage(handleIncomingMessage)
    
    // 6. Load or create user in Supabase
    await initializeSupabase(myId, crypto.getPublicKey())
    
    // 7. Load contacts from localStorage/Supabase
    await loadContacts()
  }

  const initializeSupabase = async (userId: string, publicKey: string) => {
    try {
      // Check if user exists
      let { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('qr_code', userId)
        .single()
      
      if (!user) {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            username: userId,
            display_name: 'Usuario',
            public_key: publicKey,
            qr_code: userId,
            status: 'online'
          })
          .select()
          .single()
        
        if (newUser) {
          setCurrentUser(newUser)
        }
      } else {
        setCurrentUser(user)
        
        // Update status to online
        await supabase
          .from('users')
          .update({ status: 'online', last_seen: new Date().toISOString() })
          .eq('id', user.id)
      }
    } catch (error) {
      console.error('Supabase error:', error)
    }
  }

  const loadContacts = async () => {
    // Load from localStorage first
    const savedContacts = localStorage.getItem('criptochat_contacts')
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts))
    }
    
    // Then sync with Supabase
    if (currentUser) {
      const { data: dbContacts } = await supabase
        .from('contacts')
        .select(`
          *,
          contact:contact_id (*)
        `)
        .eq('user_id', currentUser.id)
      
      if (dbContacts) {
        const formattedContacts = dbContacts.map(c => ({
          id: c.contact.id,
          name: c.contact.display_name,
          publicKey: c.contact.public_key,
          status: c.contact.status,
          lastSeen: c.contact.last_seen
        }))
        setContacts(formattedContacts)
      }
    }
  }

  const handleIncomingMessage = async (data: any) => {
    console.log('📨 Received message:', data)
    
    // Decrypt if we have crypto manager
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
    
    // Show notification
    await notificationManager.showNotification('Nuevo mensaje', {
      body: 'Has recibido un mensaje encriptado',
      data: { messageId: newMessage.id }
    })
    
    // Handle self-destruct
    if (data.selfDestruct && data.destructAfter) {
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== newMessage.id))
      }, data.destructAfter * 1000)
    }
  }

  const addContact = async () => {
    if (!scanInput.trim()) {
      alert('Por favor ingresa un código QR')
      return
    }

    if (!scanInput.startsWith('user_')) {
      alert('Código QR inválido')
      return
    }

    if (scanInput === myQRCode) {
      alert('No puedes agregarte a ti mismo')
      return
    }

    if (contacts.find(c => c.publicKey === scanInput)) {
      alert('Este contacto ya existe')
      return
    }

    // Check if user exists in Supabase
    const { data: contactUser } = await supabase
      .from('users')
      .select('*')
      .eq('qr_code', scanInput)
      .single()
    
    let newContact: Contact
    
    if (contactUser) {
      // User exists in database
      newContact = {
        id: contactUser.id,
        name: contactUser.display_name,
        publicKey: contactUser.public_key,
        status: contactUser.status,
        lastSeen: contactUser.last_seen
      }
      
      // Add to contacts table
      if (currentUser) {
        await supabase
          .from('contacts')
          .insert({
            user_id: currentUser.id,
            contact_id: contactUser.id
          })
      }
    } else {
      // User not in database yet
      newContact = {
        id: Date.now().toString(),
        name: `Usuario ${contacts.length + 1}`,
        publicKey: scanInput
      }
    }

    const updatedContacts = [...contacts, newContact]
    setContacts(updatedContacts)
    localStorage.setItem('criptochat_contacts', JSON.stringify(updatedContacts))
    
    setShowScanModal(false)
    setScanInput('')
    alert('¡Contacto agregado exitosamente!')
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentContact || !cryptoManager) return

    const selfDestruct = (document.getElementById('selfDestruct') as HTMLInputElement)?.checked
    
    // Encrypt message
    const encrypted = await cryptoManager.encryptMessage(
      inputMessage,
      currentContact.publicKey
    )
    
    // Create local message
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'me',
      timestamp: new Date(),
      encrypted: true,
      selfDestruct
    }

    setMessages(prev => [...prev, newMessage])
    
    // Send via Socket.io
    const sent = socketManager.sendMessage({
      to: currentContact.publicKey,
      from: myQRCode,
      message: inputMessage,
      encrypted: encrypted.encrypted,
      timestamp: Date.now(),
      selfDestruct,
      destructAfter: selfDestruct ? 30 : undefined
    })
    
    // Save to Supabase
    if (currentUser && currentContact) {
      await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.id,
          recipient_id: currentContact.id,
          encrypted_content: encrypted.encrypted,
          iv: encrypted.iv,
          message_type: 'text',
          self_destruct: selfDestruct,
          destruct_after: selfDestruct ? 30 : null,
          destruct_at: selfDestruct 
            ? new Date(Date.now() + 30000).toISOString() 
            : null
        })
    }
    
    setInputMessage('')
    
    // Handle self-destruct locally
    if (selfDestruct) {
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== newMessage.id))
        console.log('💥 Mensaje autodestruido:', newMessage.id)
      }, 30000)
    }
    
    // Simulate response (remove in production)
    setTimeout(() => {
      const autoReply: Message = {
        id: (Date.now() + 1).toString(),
        text: selfDestruct 
          ? `⚠️ Recibí tu mensaje autodestructivo`
          : `Mensaje recibido: "${inputMessage}" - Encriptado con E2E 🔐`,
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
    
    // Load messages from Supabase
    if (currentUser) {
      const { data: dbMessages } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},recipient_id.eq.${contact.id}),and(sender_id.eq.${contact.id},recipient_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true })
      
      if (dbMessages && cryptoManager) {
        const decryptedMessages = await Promise.all(
          dbMessages.map(async (msg) => {
            let text = '[Mensaje encriptado]'
            try {
              text = await cryptoManager.decryptMessage(
                msg.encrypted_content,
                msg.sender_id === currentUser.id ? contact.publicKey : cryptoManager.getPublicKey()
              )
            } catch (error) {
              console.error('Failed to decrypt:', error)
            }
            
            return {
              id: msg.id,
              text,
              sender: msg.sender_id === currentUser.id ? 'me' as const : 'other' as const,
              timestamp: new Date(msg.created_at),
              encrypted: true,
              selfDestruct: msg.self_destruct,
              destructIn: msg.destruct_after
            }
          })
        )
        
        setMessages(decryptedMessages)
      }
    }
    
    // Initial message
    const welcomeMsg: Message = {
      id: '1',
      text: `Chat seguro iniciado con ${contact.name}. Todos los mensajes están encriptados de extremo a extremo.`,
      sender: 'other',
      timestamp: new Date(),
      encrypted: true
    }
    setMessages(prev => [welcomeMsg, ...prev])
  }

  // Auto-destroy messages checker
  useEffect(() => {
    const interval = setInterval(async () => {
      if (currentUser) {
        // Check for messages to destroy in Supabase
        const { data: toDestroy } = await supabase
          .from('messages')
          .select('id')
          .eq('self_destruct', true)
          .lte('destruct_at', new Date().toISOString())
        
        if (toDestroy && toDestroy.length > 0) {
          const ids = toDestroy.map(m => m.id)
          
          // Delete from database
          await supabase
            .from('messages')
            .delete()
            .in('id', ids)
          
          // Remove from UI
          setMessages(prev => prev.filter(m => !ids.includes(m.id)))
          
          console.log(`🔥 Destroyed ${ids.length} messages`)
        }
      }
    }, 5000) // Check every 5 seconds
    
    return () => clearInterval(interval)
  }, [currentUser])

  // Vista de bienvenida
  if (currentView === 'welcome') {
    return (
      <main className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-4xl font-bold mb-2">CriptoChat</h1>
          <p className="text-gray-400 mb-8">Mensajería con encriptación E2E</p>
          <button
            onClick={() => setCurrentView('chat')}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Iniciar CriptoChat
          </button>
        </div>
      </main>
    )
  }

  // Vista principal del chat
  return (
    <main className="h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span>🔐</span>
            CriptoChat
            <span className="text-xs text-green-400 ml-auto flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">Tu ID: {myQRCode}</p>
          {cryptoManager && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              🔑 {cryptoManager.getPublicKey().substring(0, 20)}...
            </p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="p-4 space-y-2">
          <button
            onClick={() => setShowQRModal(true)}
            className="w-full flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            <span>👤</span> Ver mi código QR
          </button>
          
          <button
            onClick={() => setShowScanModal(true)}
            className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            <span>📷</span> Agregar contacto
          </button>
          
          <button
            onClick={async () => {
              const permission = await notificationManager.requestPermission()
              alert(`Notificaciones: ${permission}`)
            }}
            className="w-full flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
          >
            <span>🔔</span> Activar notificaciones
          </button>
        </div>

        {/* Lista de contactos */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            Contactos ({contacts.length})
          </h3>
          
          {contacts.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p className="text-sm">Sin contactos aún</p>
              <p className="text-xs mt-2">Agrega contactos con su código QR</p>
            </div>
          ) : (
            <div className="space-y-2">
              {contacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => selectContact(contact)}
                  className={`w-full p-3 rounded-lg text-left transition ${
                    currentContact?.id === contact.id
                      ? 'bg-purple-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{contact.name}</div>
                    {contact.status && (
                      <span className={`w-2 h-2 rounded-full ${
                        contact.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                      }`}></span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {contact.publicKey.substring(0, 20)}...
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-lg transition">
            <span>⚙️</span> Configuración
          </button>
        </div>
      </aside>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col">
        {currentContact ? (
          <>
            {/* Header del chat */}
            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    {currentContact.name}
                    {currentContact.status === 'online' && (
                      <span className="text-xs bg-green-900 text-green-400 px-2 py-1 rounded">
                        En línea
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-400">
                    🔐 Chat encriptado E2E con @noble/secp256k1
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-purple-900 text-purple-400 px-2 py-1 rounded">
                    Socket.io ✓
                  </span>
                  <span className="text-xs bg-blue-900 text-blue-400 px-2 py-1 rounded">
                    Supabase ✓
                  </span>
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender === 'me'
                        ? 'bg-purple-600'
                        : 'bg-gray-700'
                    } ${msg.selfDestruct ? 'border-2 border-orange-500' : ''}`}
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

            {/* Input de mensaje */}
            <div className="p-4 bg-gray-800 border-t border-gray-700">
              <div className="space-y-3">
                {/* Opciones */}
                <div className="flex items-center gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="selfDestruct"
                      className="rounded text-purple-600"
                    />
                    <span>🔥 Autodestruir (30s)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="encrypt"
                      defaultChecked
                      className="rounded text-purple-600"
                    />
                    <span>🔐 Encriptar</span>
                  </label>
                </div>
                
                {/* Input y botón */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Escribe un mensaje encriptado..."
                    className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <button
                    onClick={sendMessage}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-bold mb-2">Selecciona un chat</h2>
              <p className="text-gray-400">
                Agrega contactos con su código QR para comenzar
              </p>
              <div className="mt-8 space-y-2 text-sm">
                <p className="flex items-center justify-center gap-2">
                  <span className="text-green-400">✓</span> Socket.io conectado
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span className="text-green-400">✓</span> Encriptación E2E activa
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span className="text-green-400">✓</span> Base de datos lista
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span className="text-green-400">✓</span> Notificaciones disponibles
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Mi QR */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Mi Código QR</h3>
            <div className="bg-white p-4 rounded mb-4">
              <div className="aspect-square bg-gray-200 flex items-center justify-center text-black font-mono text-xs">
                {myQRCode}
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Comparte este código para que otros te agreguen
            </p>
            {cryptoManager && (
              <div className="bg-gray-700 p-3 rounded mb-4">
                <p className="text-xs text-gray-400 mb-1">Clave pública:</p>
                <p className="text-xs font-mono break-all">
                  {cryptoManager.getPublicKey().substring(0, 64)}...
                </p>
              </div>
            )}
            <button
              onClick={() => {
                navigator.clipboard.writeText(myQRCode)
                alert('Código copiado al portapapeles')
              }}
              className="w-full mb-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition"
            >
              Copiar código
            </button>
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal Escanear/Agregar */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Agregar Contacto</h3>
            <p className="text-sm text-gray-400 mb-4">
              Ingresa el código QR del contacto que quieres agregar
            </p>
            <input
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Ej: user_abc123xyz"
              className="w-full px-4 py-2 bg-gray-700 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              onClick={addContact}
              className="w-full mb-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition"
            >
              Agregar contacto
            </button>
            <button
              onClick={() => {
                setShowScanModal(false)
                setScanInput('')
              }}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </main>
  )
}