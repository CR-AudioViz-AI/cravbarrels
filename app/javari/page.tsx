'use client'

import { useState, useRef, useEffect } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

// Sample responses for demo (in production, this would call the API)
const SAMPLE_RESPONSES: Record<string, string> = {
  'default': "I'm Javari, your AI spirits expert! I have deep knowledge of all 13 spirit categories - bourbon, scotch, irish, japanese whisky, wine, beer, tequila, rum, gin, vodka, cognac, sake, and liqueurs. Ask me anything about history, production, tasting notes, recommendations, or trivia!",
  'bourbon': "Bourbon is America's native spirit! To be called bourbon, it must be made in the USA from at least 51% corn, aged in new charred oak barrels, distilled to no more than 160 proof, and entered into the barrel at no more than 125 proof. While it can be made anywhere in the US, 95% comes from Kentucky. Would you like to know about specific producers, the history of bourbon, or get some recommendations?",
  'pappy': "Pappy Van Winkle is legendary! It's produced at Buffalo Trace Distillery and includes the 15, 20, and 23-year expressions. The MSRP ranges from $119-299, but secondary market prices are typically $1,500-6,000+. The wheated bourbon mashbill (using wheat instead of rye as the flavoring grain) gives it a softer, sweeter profile. Would you like tips on finding Pappy at retail, or learn about similar wheated bourbons?",
  'scotch': "Scotch whisky has five official regions: Speyside (known for elegant, fruity whiskies), Highland (diverse styles), Lowland (light and grassy), Islay (peaty and smoky), and Campbeltown (maritime character). It must be aged at least 3 years in Scotland. What region interests you most?",
  'recommend': "I'd be happy to recommend something! To give you the best suggestion, tell me:\n\n1. What spirit category interests you? (bourbon, scotch, wine, etc.)\n2. What's your budget range?\n3. What flavors do you enjoy? (sweet, smoky, fruity, spicy)\n4. Is this for sipping neat, cocktails, or a special occasion?\n\nWith this info, I can give you personalized recommendations from our database of thousands of spirits!",
}

function getResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('bourbon')) return SAMPLE_RESPONSES.bourbon
  if (lower.includes('pappy') || lower.includes('van winkle')) return SAMPLE_RESPONSES.pappy
  if (lower.includes('scotch') || lower.includes('scotland')) return SAMPLE_RESPONSES.scotch
  if (lower.includes('recommend') || lower.includes('suggestion')) return SAMPLE_RESPONSES.recommend
  return SAMPLE_RESPONSES.default
}

export default function JavariPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm Javari, your AI spirits expert. 🥃\n\nI have comprehensive knowledge of all 13 spirit categories including bourbon, scotch, wine, beer, tequila, and more. I can help you with:\n\n• **Learning** - History, production methods, tasting notes\n• **Recommendations** - Personalized suggestions based on your preferences\n• **Trivia** - Fun facts and deep knowledge\n• **Collection** - Advice on building your collection\n\nWhat would you like to explore today?" }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const handleSend = async () => {
    if (!input.trim()) return
    
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsTyping(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
    
    const response = getResponse(userMessage)
    setIsTyping(false)
    setMessages(prev => [...prev, { role: 'assistant', content: response }])
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
  const quickQuestions = [
    "Tell me about bourbon",
    "What's the deal with Pappy Van Winkle?",
    "Recommend a scotch for beginners",
    "What makes Japanese whisky special?",
    "Best tequila under $50?",
  ]
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-3 bg-purple-100 rounded-full px-6 py-3">
          <span className="text-4xl">🤖</span>
          <div className="text-left">
            <h1 className="text-xl font-bold text-purple-900">Javari AI</h1>
            <p className="text-sm text-purple-700">Your Spirits Expert</p>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-barrel-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.role === 'assistant' && (
                  <span className="text-xl mr-2">🤖</span>
                )}
                <span className="whitespace-pre-wrap">{message.content}</span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <span className="text-xl mr-2">🤖</span>
                <span className="animate-pulse">Javari is typing...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Quick Questions */}
      {messages.length <= 2 && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Javari anything about spirits..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-barrel-500 focus:border-transparent"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="px-6 py-3 bg-barrel-500 text-white rounded-xl font-semibold hover:bg-barrel-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
      
      <p className="text-xs text-gray-400 text-center mt-3">
        Javari AI is powered by comprehensive spirits knowledge. Part of BarrelVerse by CR AudioViz AI.
      </p>
    </div>
  )
}
