/**
 * Componente para gestionar contactos - editar nombre y eliminar
 */

import { useState } from 'react'
import { Edit3, Trash2, Check, X, MoreVertical } from 'lucide-react'

interface Contact {
  id: string
  name: string
  publicKey: string
  status?: 'online' | 'offline'
  lastSeen?: Date
}

interface ContactItemProps {
  contact: Contact
  isActive: boolean
  onSelect: (contact: Contact) => void
  onEdit: (contactId: string, newName: string) => void
  onDelete: (contactId: string) => void
}

export function ContactItem({ 
  contact, 
  isActive, 
  onSelect, 
  onEdit, 
  onDelete 
}: ContactItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(contact.name)
  const [showMenu, setShowMenu] = useState(false)

  const handleSaveEdit = () => {
    if (editName.trim() && editName.trim() !== contact.name) {
      onEdit(contact.id, editName.trim())
    }
    setIsEditing(false)
    setEditName(contact.name)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditName(contact.name)
  }

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${contact.name}?`)) {
      onDelete(contact.id)
    }
    setShowMenu(false)
  }

  return (
    <div
      className={`relative group w-full p-3 rounded-lg text-left transition-colors duration-200 ${
        isActive
          ? 'bg-slate-600 text-white'
          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div 
          className="flex-1 cursor-pointer"
          onClick={() => !isEditing && onSelect(contact)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleSaveEdit()
                      if (e.key === 'Escape') handleCancelEdit()
                    }}
                    className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                    autoFocus
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="p-1 hover:bg-green-600 rounded transition-colors"
                  >
                    <Check className="w-4 h-4 text-green-500 hover:text-white" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 hover:bg-red-600 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-red-500 hover:text-white" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-xs opacity-70">
                    {contact.publicKey.substring(0, 20)}...
                  </div>
                </>
              )}
            </div>
            
            {!isEditing && (
              <div className="flex items-center gap-2">
                {contact.status && (
                  <span className={`w-2 h-2 rounded-full ${
                    contact.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                  }`}></span>
                )}
                
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(!showMenu)
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-400 dark:hover:bg-gray-600 rounded transition-all duration-200"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {showMenu && (
                    <div className="absolute right-0 top-8 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsEditing(true)
                          setShowMenu(false)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                        Editar nombre
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete()
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors last:rounded-b-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Overlay para cerrar el menu cuando se hace click fuera */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}

interface ContactListProps {
  contacts: Contact[]
  currentContact: Contact | null
  onSelectContact: (contact: Contact) => void
  onEditContact: (contactId: string, newName: string) => void
  onDeleteContact: (contactId: string) => void
}

export function ContactList({
  contacts,
  currentContact,
  onSelectContact,
  onEditContact,
  onDeleteContact
}: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
        <p className="text-sm">Sin contactos aún</p>
        <p className="text-xs mt-2">Agrega contactos con su código QR</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {contacts.map(contact => (
        <ContactItem
          key={contact.id}
          contact={contact}
          isActive={currentContact?.id === contact.id}
          onSelect={onSelectContact}
          onEdit={onEditContact}
          onDelete={onDeleteContact}
        />
      ))}
    </div>
  )
}