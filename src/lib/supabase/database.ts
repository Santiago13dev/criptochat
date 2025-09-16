/* proporciona métodos para interactuar con una base de datos Supabase, incluyendo la gestión de usuarios, el manejo de contactos, el envío y la recepción de mensajes y las suscripciones en tiempo real. */
import { supabase } from './client'
import type { User, Contact, Message } from './client'

export class DatabaseManager {
  // USUARIOS
  async createUser(userData: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating user:', error)
      return null
    }
    
    return data
  }
  
  async getUserByQR(qrCode: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('qr_code', qrCode)
      .single()
    
    if (error) {
      console.error('Error fetching user:', error)
      return null
    }
    
    return data
  }
  
  async updateUserStatus(userId: string, status: string) {
    await supabase
      .from('users')
      .update({ 
        status, 
        last_seen: new Date().toISOString() 
      })
      .eq('id', userId)
  }
  
  // CONTACTOS
  async addContact(userId: string, contactQR: string): Promise<Contact | null> {
    // Primero buscar el usuario por QR
    const contactUser = await this.getUserByQR(contactQR)
    
    if (!contactUser) {
      throw new Error('Usuario no encontrado')
    }
    
    // Verificar que no sea el mismo usuario
    if (contactUser.id === userId) {
      throw new Error('No puedes agregarte a ti mismo')
    }
    
    // Verificar si ya existe
    const { data: existing } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .eq('contact_id', contactUser.id)
      .single()
    
    if (existing) {
      throw new Error('Este contacto ya existe')
    }
    
    // Agregar contacto
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        user_id: userId,
        contact_id: contactUser.id
      })
      .select(`
        *,
        contact:contact_id (*)
      `)
      .single()
    
    if (error) {
      console.error('Error adding contact:', error)
      return null
    }
    
    return data
  }
  
  async getContacts(userId: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        contact:contact_id (*)
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching contacts:', error)
      return []
    }
    
    return data || []
  }
  
  // MENSAJES
  async sendMessage(messageData: Partial<Message>): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single()
    
    if (error) {
      console.error('Error sending message:', error)
      return null
    }
    
    // Si es autodestructivo, programar destrucción
    if (data.self_destruct && data.destruct_after) {
      const destructAt = new Date(Date.now() + data.destruct_after * 1000)
      
      await supabase
        .from('messages')
        .update({ destruct_at: destructAt.toISOString() })
        .eq('id', data.id)
    }
    
    return data
  }
  
  async getMessages(userId: string, contactId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${contactId}),and(sender_id.eq.${contactId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching messages:', error)
      return []
    }
    
    return data || []
  }
  
  async markMessageAsRead(messageId: string) {
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId)
  }
  
  async deleteMessage(messageId: string) {
    await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
  }
  
  // MENSAJES AUTODESTRUCTIVOS
  async checkAndDestroyMessages() {
    // Buscar mensajes que deben destruirse
    const { data: toDestroy } = await supabase
      .from('messages')
      .select('id')
      .eq('self_destruct', true)
      .lte('destruct_at', new Date().toISOString())
    
    if (toDestroy && toDestroy.length > 0) {
      const ids = toDestroy.map(m => m.id)
      
      // Eliminar mensajes
      await supabase
        .from('messages')
        .delete()
        .in('id', ids)
      
      console.log(`🔥 Destruidos ${ids.length} mensajes`)
      
      return ids
    }
    
    return []
  }
  
  // REAL-TIME SUBSCRIPTIONS
  subscribeToMessages(userId: string, callback: (message: Message) => void) {
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Message)
        }
      )
      .subscribe()
    
    return subscription
  }
  
  subscribeToContactStatus(contactIds: string[], callback: (user: User) => void) {
    const subscription = supabase
      .channel('user-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=in.(${contactIds.join(',')})`
        },
        (payload) => {
          callback(payload.new as User)
        }
      )
      .subscribe()
    
    return subscription
  }
}

export const db = new DatabaseManager()