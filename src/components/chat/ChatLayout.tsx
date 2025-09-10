'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { ChatArea } from './ChatArea'
import { Header } from './Header'

export function ChatLayout() {
  const [currentChat, setCurrentChat] = useState(null)
  
  return (
    <div className="h-full flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar onSelectChat={setCurrentChat} />
        <ChatArea currentChat={currentChat} />
      </div>
    </div>
  )
}