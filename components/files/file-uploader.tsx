"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface FileUploaderProps {
  subject: string
  onFileUpload: (file: File) => void
}

export function FileUploader({ subject, onFileUpload }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const validateFile = (file: File): boolean => {
    // Check file type
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed")
      return false
    }

    // Check file size (25MB = 25 * 1024 * 1024 bytes)
    if (file.size > 25 * 1024 * 1024) {
      setError("File size must be less than 25MB")
      return false
    }

    // We can't check number of pages client-side reliably
    // This would typically be done server-side

    setError(null)
    return true
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
      }
    }
  }

  const handleSubmit = () => {
    if (selectedFile) {
      onFileUpload(selectedFile)
      setSelectedFile(null)
    }
  }

  const openFileSelector = () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className="w-full">
      <input ref={inputRef} type="file" accept=".pdf" onChange={handleChange} className="hidden" />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {selectedFile ? (
        <div className="border rounded-lg p-3 md:p-4 mb-3 md:mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 p-1 md:p-2 rounded mr-2 md:mr-3">
                <FileIcon className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm md:text-base truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">
                  {selectedFile.name}
                </p>
                <p className="text-xs md:text-sm text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            <button onClick={removeSelectedFile} className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
          <Button onClick={handleSubmit} className="mt-3 md:mt-4 w-full">
            Upload File
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-4 md:p-6 text-center ${
            dragActive ? "border-brand-navy bg-blue-50" : "border-gray-300"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-2 md:space-y-3">
            <div className="bg-blue-100 p-2 md:p-3 rounded-full">
              <Upload className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
            <p className="text-base md:text-lg font-medium">Drag and drop your file here</p>
            <p className="text-xs md:text-sm text-gray-500">
              or{" "}
              <button type="button" onClick={openFileSelector} className="text-brand-navy font-medium hover:underline">
                browse
              </button>{" "}
              to choose a file
            </p>
            <div className="text-xs text-gray-500 mt-1 md:mt-2">
              <p>PDF files only (max 25MB, 10 pages)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
