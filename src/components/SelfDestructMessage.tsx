import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface SelfDestructMessageProps {
  message: {
    id: string
    text: string
    destructIn: number // segundos
    onDestroy: () => void
  }
}

export function SelfDestructMessage({ message }: SelfDestructMessageProps) {
  const [timeLeft, setTimeLeft] = useState(message.destructIn)
  const [isDestroying, setIsDestroying] = useState(false)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsDestroying(true)
          setTimeout(() => {
            message.onDestroy()
          }, 500)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  return (
    <motion.div
      animate={{
        opacity: isDestroying ? 0 : 1,
        scale: isDestroying ? 0.8 : 1,
        filter: isDestroying ? 'blur(10px)' : 'blur(0px)'
      }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="bg-orange-600 text-white px-4 py-2 rounded-lg">
        <p>{message.text}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs opacity-70">
            🔥 Autodestrucción en {timeLeft}s
          </span>
          <div className="w-full max-w-[100px] h-1 bg-orange-800 rounded-full overflow-hidden ml-2">
            <motion.div
              className="h-full bg-orange-300"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: message.destructIn, ease: 'linear' }}
            />
          </div>
        </div>
      </div>
      
      {/* Efecto visual de destrucción */}
      {isDestroying && (
        <motion.div
          className="absolute inset-0 bg-orange-500 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.div>
  )
}