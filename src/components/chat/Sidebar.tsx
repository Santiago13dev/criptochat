import { useState } from 'react'
import { QrCode, UserPlus, Settings } from 'lucide-react'

export function Sidebar({ onSelectChat }) {
  const [contacts, setContacts] = useState([])
  
  return (
    <aside className="w-80 glass border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold">CriptoChat</h2>
      </div>
      
      <div className="p-4 space-y-2">
        <button className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/10 transition">
          <QrCode className="w-5 h-5" />
          <span>Escanear QR</span>
        </button>
        
        <button className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/10 transition">
          <UserPlus className="w-5 h-5" />
          <span>Mi código QR</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {contacts.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Sin contactos</p>
            <p className="text-sm mt-2">Escanea un QR para agregar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map(contact => (
              <button
                key={contact.id}
                onClick={() => onSelectChat(contact)}
                className="w-full p-3 rounded-lg hover:bg-white/10 transition text-left"
              >
                <div className="font-medium">{contact.name}</div>
                <div className="text-sm text-gray-400">{contact.lastMessage}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-800">
        <button className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/10 transition">
          <Settings className="w-5 h-5" />
          <span>Configuración</span>
        </button>
      </div>
    </aside>
  )
}