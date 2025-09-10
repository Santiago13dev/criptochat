/**componente del area de chat donde se muestran los mensajes y el input para navegar entre mensajes*/
import { useState } from 'react'
import { Send, Paperclip, Lock } from 'lucide-react'

export function ChatArea({ currentChat }) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  
  const sendMessage = () => {
    if (!message.trim()) return
    
    setMessages([...messages, {
      id: Date.now(),
      text: message,
      sender: 'me',
      timestamp: new Date()
    }])
    
    setMessage('')
  }
  
  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-24 h-24 mx-auto mb-4 text-gray-600" />
          <h2 className="text-2xl font-bold mb-2">Bienvenido a CriptoChat</h2>
          <p className="text-gray-400">Selecciona una conversación para comenzar</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.sender === 'me' ? 'bg-purple-600' : 'bg-gray-700'
              }`}>
                <p>{msg.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-white/10 rounded-lg">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Escribe un mensaje encriptado..."
            className="flex-1 bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          
          <button
            onClick={sendMessage}
            className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}