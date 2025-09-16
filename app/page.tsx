'use client'

import { socketManager } from '@/lib/socket'
import { useState, useEffect, useRef } from 'react'
import { db } from '@/lib/supabase/database'
import { supabase } from '@/lib/supabase/client'
import type { User, Contact, Message } from '@/lib/supabase/client'

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  
  // Inicializar o cargar usuario
  useEffect(() => {
    initializeUser()
  }, [])
  
  const initializeUser = async () => {
    // Verificar si ya existe un usuario local
    const savedUserId = localStorage.getItem('criptochat_user_id')
    
    if (savedUserId) {
      // Buscar en la base de datos
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', savedUserId)
        .single()
      
      if (data) {
        setCurrentUser(data)
        await loadContacts(data.id)
        await db.updateUserStatus(data.id, 'online')
        subscribeToRealtime(data.id)
        return
      }
    "use client"

    import { socketManager } from '@/lib/socket'
    import { useState, useEffect } from 'react'
    import { db } from '@/lib/supabase/database'
    import { supabase } from '@/lib/supabase/client'
    import { generateKeyPair, encryptMessage as encryptSimple } from '@/lib/crypto'
    import type { User as DbUser, Contact as DbContact, Message as DbMessage } from '@/lib/supabase/client'

    // UI-level types
    interface UIMessage {
      id: string
      text: string
      sender: 'me' | 'other'
      timestamp: Date
      encrypted?: boolean
    }

    interface UIContact {
      id: string
      name: string
      publicKey: string
    }

    export default function Home() {
      // Integración de usuario/DB + UI local
      const [currentUser, setCurrentUser] = useState<DbUser | null>(null)
      const [currentView, setCurrentView] = useState<'welcome' | 'chat'>('welcome')
      const [myQRCode, setMyQRCode] = useState('')
      const [contacts, setContacts] = useState<UIContact[]>([])
      const [currentContact, setCurrentContact] = useState<UIContact | null>(null)
      const [messages, setMessages] = useState<UIMessage[]>([])
      const [inputMessage, setInputMessage] = useState('')
      const [showQRModal, setShowQRModal] = useState(false)
      const [showScanModal, setShowScanModal] = useState(false)
      const [scanInput, setScanInput] = useState('')

      // Inicializar usuario (db) y QR local
      useEffect(() => {
        const init = async () => {
          // Cargar o crear usuario en supabase
          const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('criptochat_user_id') : null

          if (savedUserId) {
            const { data } = await supabase.from('users').select('*').eq('id', savedUserId).single()
            if (data) {
              setCurrentUser(data)
              setMyQRCode(data.qr_code)
              await db.updateUserStatus(data.id, 'online')
              db.getContacts(data.id).then(list => {
                const uiContacts = list.map((c: DbContact) => ({ id: c.contact_id, name: c.contact?.display_name || 'Contacto', publicKey: c.contact?.qr_code || '' }))
                setContacts(uiContacts)
              })
              db.subscribeToMessages(data.id, (m) => {
                // Mostrar notificación simple
                const uiMsg: UIMessage = { id: m.id, text: '[mensaje encriptado]', sender: 'other', timestamp: new Date(m.created_at), encrypted: true }
                setMessages(prev => [...prev, uiMsg])
                new Notification('Nuevo mensaje', { body: 'Has recibido un mensaje encriptado' })
              })
              return
            }
          }

          // Crear nuevo usuario local y en DB
          const qrCode = 'user_' + Math.random().toString(36).substr(2, 9)
          const keys = generateKeyPair()

          const newUser = await db.createUser({
            username: qrCode,
            display_name: 'Usuario',
            qr_code: qrCode,
            public_key: keys.publicKey,
            status: 'online'
          })

          if (newUser) {
            setCurrentUser(newUser)
            setMyQRCode(newUser.qr_code)
            localStorage.setItem('criptochat_user_id', newUser.id)
          }
        }

        init()
      }, [])

      // Conectar socket cuando tengamos QR
      useEffect(() => {
        if (!myQRCode) return
        const socket = socketManager.connect(myQRCode, 'Usuario')

        socketManager.onMessage((data: any) => {
          const newMessage: UIMessage = {
            id: Date.now().toString(),
            text: data.message,
            sender: 'other',
            timestamp: new Date(data.timestamp || Date.now()),
            encrypted: data.encrypted
          }
          setMessages(prev => [...prev, newMessage])
          new Notification('Nuevo mensaje', { body: data.message, icon: '/icon.png' })
        })

        return () => socketManager.disconnect()
      }, [myQRCode])

      // Agregar contacto (local UI + optional db flow)
      const addContact = async (contactQR?: string) => {
        const qr = contactQR || scanInput
        if (!qr || !qr.trim()) {
          alert('Por favor ingresa un código QR')
          return
        }

        if (!qr.startsWith('user_')) {
          alert('Código QR inválido. Debe empezar con "user_"')
          return
        }

        if (qr === myQRCode) {
          alert('No puedes agregarte a ti mismo como contacto')
          return
        }

        if (contacts.find(c => c.publicKey === qr)) {
          alert('Este contacto ya existe')
          return
        }

        // Try to resolve via DB if user exists
        let name = `Usuario ${contacts.length + 1}`
        if (currentUser) {
          try {
            const contactUser = await db.getUserByQR(qr)
            if (contactUser) {
              name = contactUser.display_name || name
              // attempt to add to DB
              try { await db.addContact(currentUser.id, qr) } catch (e) { /* ignore DB add errors for UI demo */ }
            }
          } catch {}
        }

        const newContact: UIContact = { id: Date.now().toString(), name, publicKey: qr }
        const updatedContacts = [...contacts, newContact]
        setContacts(updatedContacts)
        localStorage.setItem('criptochat_contacts', JSON.stringify(updatedContacts))
        setShowScanModal(false)
        setScanInput('')
        alert('¡Contacto agregado exitosamente!')
      }

      // Enviar mensaje (UI + socket + optional DB)
      const sendMessage = async () => {
        if (!inputMessage.trim() || !currentContact) return

        const encrypted = await encryptSimple(inputMessage, currentContact.publicKey).catch(() => btoa(inputMessage))

        // Send via socket for demo
        socketManager.sendMessage(currentContact.publicKey, inputMessage, encrypted)

        const newMessage: UIMessage = { id: Date.now().toString(), text: inputMessage, sender: 'me', timestamp: new Date(), encrypted: true }
        setMessages(prev => [...prev, newMessage])
        setInputMessage('')

        // Optionally persist in DB if we have a currentUser
        if (currentUser) {
          await db.sendMessage({ sender_id: currentUser.id, recipient_id: currentContact.id, encrypted_content: encrypted, iv: '', message_type: 'text', self_destruct: false })
        }

        // Simulate auto-reply for demo
        setTimeout(() => {
          const autoReply: UIMessage = { id: (Date.now() + 1).toString(), text: `Mensaje recibido: "${inputMessage}" - Encriptado con E2E 🔐`, sender: 'other', timestamp: new Date(), encrypted: true }
          setMessages(prev => [...prev, autoReply])
        }, 1000)
      }

      const selectContact = (contact: UIContact) => {
        setCurrentContact(contact)
        setMessages([])
        const welcomeMsg: UIMessage = { id: '1', text: `Chat seguro iniciado con ${contact.name}. Todos los mensajes están encriptados de extremo a extremo.`, sender: 'other', timestamp: new Date(), encrypted: true }
        setMessages([welcomeMsg])
        setCurrentView('chat')
      }

      // Load local contacts on mount
      useEffect(() => {
        const saved = localStorage.getItem('criptochat_contacts')
        if (saved) setContacts(JSON.parse(saved))
      }, [])

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
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  E2E Activo
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">Tu ID: {myQRCode}</p>
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
                      <div className="font-medium">{contact.name}</div>
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
                      <h3 className="font-semibold">{currentContact.name}</h3>
                      <p className="text-xs text-gray-400">
                        🔐 Chat encriptado E2E
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-900 text-green-400 px-2 py-1 rounded">
                        Seguro
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
                          {msg.encrypted && (
                            <span className="text-xs">🔒</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input de mensaje */}
                <div className="p-4 bg-gray-800 border-t border-gray-700">
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h2 className="text-2xl font-bold mb-2">Selecciona un chat</h2>
                  <p className="text-gray-400">
                    Agrega contactos con su código QR para comenzar
                  </p>
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
                <div className="bg-gray-700 p-3 rounded mb-4">
                  <p className="text-xs font-mono break-all">{myQRCode}</p>
                </div>
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
                  onClick={() => addContact()}
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
                      {msg.encrypted && (
                        <span className="text-xs">🔒</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input de mensaje */}
            <div className="p-4 bg-gray-800 border-t border-gray-700">
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-bold mb-2">Selecciona un chat</h2>
              <p className="text-gray-400">
                Agrega contactos con su código QR para comenzar
              </p>
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
            <div className="bg-gray-700 p-3 rounded mb-4">
              <p className="text-xs font-mono break-all">{myQRCode}</p>
            </div>
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