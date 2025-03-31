'use client'

import React, { useState } from 'react'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')

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

  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-8'>
      <h1 className='text-2xl font-bold mb-4'>Upload a PDF File</h1>
      <form onSubmit={handleFormSubmit} className='flex flex-col items-center'>
        <input
          type='file'
          accept='application/pdf'
          onChange={handleFileChange}
          className='mb-4'
        />
        <button
          type='submit'
          className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        >
          Upload
        </button>
      </form>
      {message && <p className='mt-4 text-sm text-gray-700'>{message}</p>}
    </main>
  )
}
