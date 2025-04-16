'use client'

import React, { useState } from 'react'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<string[]>([])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      setMessage('')
    } else {
      setMessage('Please upload a valid PDF file.')
      setPreviewUrl(null)
    }
  }

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (file) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('http://localhost:8000/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          setMessage(`File uploaded successfully: ${data.filePath}`)
        } else {
          setMessage('Failed to upload file.')
        }
      } catch (error) {
        console.error('Error uploading file:', error)
        setMessage('Error uploading file.')
      }
    } else {
      setMessage('No file selected.')
    }
  }

  const handleChatSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (chatInput.trim()) {
      setChatMessages((prevMessages) => [...prevMessages, `You: ${chatInput}`])

      try {
        const response = await fetch('http://localhost:8000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: chatInput }),
        })

        if (response.ok) {
          const data = await response.json()
          setChatMessages((prevMessages) => [
            ...prevMessages,
            `AI: ${data.message}`,
          ])
        } else {
          setChatMessages((prevMessages) => [
            ...prevMessages,
            'AI: Failed to get a response.',
          ])
        }
      } catch (error) {
        console.error('Error sending chat message:', error)
        setChatMessages((prevMessages) => [
          ...prevMessages,
          'AI: Error processing your message.',
        ])
      }

      setChatInput('')
    }
  }

  return (
    <main className='flex min-h-screen flex-row p-8 bg-black text-white gap-4'>
      {/* File Upload Section */}
      <section className='w-1/2 border-r border-gray-700 pr-6 flex flex-col'>
        <h1 className='text-3xl font-bold mb-4 text-gradient'>Upload a PDF</h1>
        <form
          onSubmit={handleFormSubmit}
          className='flex flex-col items-start mb-4'
        >
          <input
            type='file'
            accept='application/pdf'
            onChange={handleFileChange}
            className='mb-2 w-full px-3 py-1 text-sm border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500'
          />
          <button
            type='submit'
            className='px-4 py-1 text-sm bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition shadow hover:shadow-blue-500/50'
          >
            Upload
          </button>
        </form>

        {message && (
          <p className='text-sm text-gray-300 bg-gray-800 p-2 rounded mb-2'>
            {message}
          </p>
        )}

        {/* PDF Preview */}
        {previewUrl && (
          <div className='flex-grow'>
            <h2 className='text-lg font-semibold mb-2'>PDF Preview:</h2>
            <iframe
              src={previewUrl}
              title='Preview'
              width='100%'
              height='100%'
              className='w-full h-full border border-gray-700 rounded'
            ></iframe>
          </div>
        )}
      </section>

      {/* Chatbox Section */}
      <section className='w-1/2 pl-6 flex flex-col'>
        <h1 className='text-3xl font-bold mb-4 text-gradient'>Chat with AI</h1>
        <div className='flex-grow border border-gray-700 rounded-lg p-4 bg-gray-900 shadow-inner overflow-y-auto mb-4'>
          {chatMessages.length > 0 ? (
            chatMessages.map((msg, index) => (
              <p
                key={index}
                className={`text-sm mb-2 ${
                  msg.startsWith('You:')
                    ? 'text-blue-400 font-semibold'
                    : 'text-gray-300'
                }`}
              >
                {msg}
              </p>
            ))
          ) : (
            <p className='text-sm text-gray-500'>
              No messages yet. Start the conversation!
            </p>
          )}
        </div>
        <form onSubmit={handleChatSubmit} className='flex items-center'>
          <input
            type='text'
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder='Type your message...'
            className='flex-grow px-4 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500 mr-2'
          />
          <button
            type='submit'
            className='px-6 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition shadow hover:shadow-green-500/50'
          >
            Send
          </button>
        </form>
      </section>
    </main>
  )
}
