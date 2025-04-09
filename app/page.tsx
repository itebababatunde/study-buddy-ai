// 'use client'

// import React, { useState } from 'react'

// export default function Home() {
//   const [file, setFile] = useState<File | null>(null)
//   const [message, setMessage] = useState('')
//   const [chatInput, setChatInput] = useState('')
//   const [chatMessages, setChatMessages] = useState<string[]>([])

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = event.target.files?.[0]
//     if (selectedFile && selectedFile.type === 'application/pdf') {
//       setFile(selectedFile)
//       setMessage('')
//     } else {
//       setMessage('Please upload a valid PDF file.')
//     }
//   }

//   const handleFormSubmit = async (event: React.FormEvent) => {
//     event.preventDefault()
//     if (file) {
//       const formData = new FormData()
//       formData.append('file', file)

//       try {
//         const response = await fetch('http://localhost:8000/api/upload', {
//           method: 'POST',
//           body: formData,
//         })

//         if (response.ok) {
//           const data = await response.json()
//           setMessage(`File uploaded successfully: ${data.filePath}`)
//         } else {
//           setMessage('Failed to upload file.')
//         }
//       } catch (error) {
//         console.log({ error })
//         console.error('Error uploading file:', error)
//         setMessage('Error uploading file.')
//       }
//     } else {
//       setMessage('No file selected.')
//     }
//   }

//   const handleChatSubmit = (event: React.FormEvent) => {
//     event.preventDefault()
//     if (chatInput.trim()) {
//       setChatMessages((prevMessages) => [...prevMessages, `You: ${chatInput}`])
//       setChatInput('') // Clear the input field
//     }
//   }

//   return (
//     <main className='flex min-h-screen flex-row p-8'>
//       {/* File Upload Section */}
//       <section className='w-1/3 border-r border-gray-300 pr-4'>
//         <h1 className='text-2xl font-bold mb-4'>Upload a PDF</h1>
//         <form onSubmit={handleFormSubmit} className='flex flex-col items-start'>
//           <input
//             type='file'
//             accept='application/pdf'
//             onChange={handleFileChange}
//             className='mb-4'
//           />
//           <button
//             type='submit'
//             className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
//           >
//             Upload
//           </button>
//         </form>
//         {message && <p className='mt-4 text-sm text-gray-700'>{message}</p>}
//       </section>

//       {/* Chatbox Section */}
//       <section className='w-2/3 pl-4'>
//         <h1 className='text-2xl font-bold mb-4'>chat w your pdf</h1>
//         <div className='border border-gray-300 rounded p-4 h-96 overflow-y-auto mb-4'>
//           {chatMessages.length > 0 ? (
//             chatMessages.map((msg, index) => (
//               <p key={index} className='text-sm text-gray-800 mb-2'>
//                 {msg}
//               </p>
//             ))
//           ) : (
//             <p className='text-sm text-gray-500'>No messages yet.</p>
//           )}
//         </div>
//         <form onSubmit={handleChatSubmit} className='flex items-center'>
//           <input
//             type='text'
//             value={chatInput}
//             onChange={(e) => setChatInput(e.target.value)}
//             placeholder='Type your message...'
//             className='flex-grow border border-gray-300 rounded px-4 py-2 mr-2'
//           />
//           <button
//             type='submit'
//             className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'
//           >
//             Send
//           </button>
//         </form>
//       </section>
//     </main>
//   )
// }

'use client'

import React, { useState } from 'react'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<string[]>([])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setMessage('')
    } else {
      setMessage('Please upload a valid PDF file.')
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
      // Add the user's message to the chat
      setChatMessages((prevMessages) => [...prevMessages, `You: ${chatInput}`])

      try {
        // Send the message to the backend
        const response = await fetch('http://localhost:8000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: chatInput }),
        })

        if (response.ok) {
          const data = await response.json()
          // Add the chatbot's response to the chat
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

      // Clear the input field
      setChatInput('')
    }
  }

  return (
    <main className='flex min-h-screen flex-row p-8 bg-black text-white'>
      {/* File Upload Section */}
      <section className='w-1/3 border-r border-gray-700 pr-6'>
        <h1 className='text-3xl font-bold mb-6 text-gradient'>Upload a PDF</h1>
        <form onSubmit={handleFormSubmit} className='flex flex-col items-start'>
          <input
            type='file'
            accept='application/pdf'
            onChange={handleFileChange}
            className='mb-4 w-full px-4 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <button
            type='submit'
            className='w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition duration-300 shadow-lg hover:shadow-blue-500/50'
          >
            Upload
          </button>
        </form>
        {message && (
          <p className='mt-4 text-sm text-gray-300 bg-gray-800 p-2 rounded'>
            {message}
          </p>
        )}
      </section>

      {/* Chatbox Section */}
      <section className='w-2/3 pl-6'>
        <h1 className='text-3xl font-bold mb-6 text-gradient'>Chat with AI</h1>
        <div className='border border-gray-700 rounded-lg p-4 h-96 bg-gray-900 shadow-inner overflow-y-auto mb-4'>
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
            className='px-6 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition duration-300 shadow-lg hover:shadow-green-500/50'
          >
            Send
          </button>
        </form>
      </section>
    </main>
  )
}
