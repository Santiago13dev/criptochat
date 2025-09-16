// lib/supabase/self-destruct.ts
export class SelfDestructManager {
  private timers: Map<string, NodeJS.Timeout> = new Map()
  
  scheduleDestruction(messageId: string, seconds: number) {
    // Cancelar timer existente si hay uno
    this.cancelDestruction(messageId)
    
    // Programar nueva destrucción
    const timer = setTimeout(async () => {
      await this.destroyMessage(messageId)
      this.timers.delete(messageId)
    }, seconds * 1000)
    
    this.timers.set(messageId, timer)
  }
  
  cancelDestruction(messageId: string) {
    const timer = this.timers.get(messageId)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(messageId)
    }
  }
  
  async destroyMessage(messageId: string) {
    // Eliminar de la base de datos
    await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
    
    console.log(`💥 Mensaje ${messageId} destruido`)
    
    // Emitir evento para actualizar UI
    window.dispatchEvent(new CustomEvent('message-destroyed', {
      detail: { messageId }
    }))
  }
  
  // Limpiar todos los timers
  cleanup() {
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()
  }
}

export const selfDestructManager = new SelfDestructManager()