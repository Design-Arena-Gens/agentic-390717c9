'use client'

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import styles from './page.module.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const savedKey = localStorage.getItem('grok_api_key')
    if (savedKey) {
      setApiKey(savedKey)
      setShowApiKeyInput(false)
    }
  }, [])

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('grok_api_key', apiKey)
      setShowApiKeyInput(false)
    }
  }

  const clearApiKey = () => {
    localStorage.removeItem('grok_api_key')
    setApiKey('')
    setShowApiKeyInput(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          apiKey: apiKey,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content,
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Something went wrong. Please check your API key and try again.'}`,
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as FormEvent)
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" stroke="#00d4ff" strokeWidth="2" fill="none"/>
              <text x="20" y="26" textAnchor="middle" fill="#00d4ff" fontSize="16" fontWeight="bold">𝕏</text>
            </svg>
            <h1>Grok AI</h1>
          </div>
          <p className={styles.subtitle}>Powered by xAI</p>
          {!showApiKeyInput && (
            <button onClick={clearApiKey} className={styles.clearKeyBtn}>
              Change API Key
            </button>
          )}
        </header>

        {showApiKeyInput ? (
          <div className={styles.apiKeyContainer}>
            <div className={styles.apiKeyCard}>
              <h2>Enter your xAI API Key</h2>
              <p>Get your API key from <a href="https://console.x.ai/" target="_blank" rel="noopener noreferrer">console.x.ai</a></p>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="xai-..."
                className={styles.apiKeyInput}
              />
              <button onClick={saveApiKey} className={styles.saveKeyBtn}>
                Save & Start Chatting
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.chatContainer}>
              {messages.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🚀</div>
                  <h2>Welcome to Grok</h2>
                  <p>Ask me anything! I&apos;m here to help with questions, creative writing, coding, and more.</p>
                  <div className={styles.suggestions}>
                    <button onClick={() => setInput('Explain quantum computing in simple terms')}>
                      Explain quantum computing
                    </button>
                    <button onClick={() => setInput('Write a haiku about artificial intelligence')}>
                      Write a haiku about AI
                    </button>
                    <button onClick={() => setInput('What are the latest trends in technology?')}>
                      Latest tech trends
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.messages}>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`${styles.message} ${
                        message.role === 'user' ? styles.userMessage : styles.assistantMessage
                      }`}
                    >
                      <div className={styles.messageAvatar}>
                        {message.role === 'user' ? '👤' : '🤖'}
                      </div>
                      <div className={styles.messageContent}>
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className={`${styles.message} ${styles.assistantMessage}`}>
                      <div className={styles.messageAvatar}>🤖</div>
                      <div className={styles.messageContent}>
                        <div className={styles.typing}>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className={styles.inputForm}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Grok anything..."
                className={styles.textInput}
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                className={styles.sendButton}
                disabled={isLoading || !input.trim()}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
