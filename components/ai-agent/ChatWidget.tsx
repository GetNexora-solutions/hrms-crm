"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Bot, X, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/rbac'
import { usePathname } from 'next/navigation'

interface ChatWidgetProps {
  employeeName: string
  role: Role
}

export function ChatWidget({ employeeName, role }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'agent', text: string}[]>([])
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const userMessage = message.trim()
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }])
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          context: {
            role,
            name: employeeName,
            module: pathname
          }
        })
      })
      const data = await response.json()
      
      setChatHistory(prev => [...prev, { role: 'agent', text: data.reply || "I couldn't process that." }])
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'agent', text: "Error connecting to AI assistant." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className="w-80 h-[450px] mb-4 shadow-2xl flex flex-col border-slate-700 bg-slate-900 overflow-hidden">
          <CardHeader className="p-3 border-b border-slate-800 flex flex-row items-center justify-between bg-slate-800">
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <Bot className="h-4 w-4 text-blue-400" /> HR Assistant
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6 text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-4 pr-1">
              <div className="flex gap-2">
                <div className="bg-slate-800 text-slate-200 text-sm p-3 rounded-lg rounded-tl-none">
                  Hi {employeeName}! I'm your AI HR assistant. How can I help you today?
                </div>
              </div>
              {chatHistory.map((msg, i) => (
                <div key={i} className={cn("flex gap-2", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "text-sm p-3 rounded-lg max-w-[85%] whitespace-pre-wrap",
                    msg.role === 'user' 
                      ? "bg-blue-600 text-white rounded-tr-none" 
                      : "bg-slate-800 text-slate-200 rounded-tl-none"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2 justify-start">
                  <div className="bg-slate-800 text-slate-200 text-sm p-3 rounded-lg rounded-tl-none flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-3 border-t border-slate-800 bg-slate-900">
            <form onSubmit={handleSend} className="flex w-full gap-2">
              <Input 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything..." 
                className="flex-1 bg-slate-800 border-slate-700 text-white"
                disabled={loading}
              />
              <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700 text-white shrink-0" disabled={loading || !message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
      
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)} 
          className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center p-0"
        >
          <Bot className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}
