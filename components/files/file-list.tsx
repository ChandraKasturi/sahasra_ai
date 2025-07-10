"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileText, Trash2, BookOpen, ClipboardList } from "lucide-react"
import Link from "next/link"

export interface FileItem {
  id: string
  name: string
  status: "processing" | "ready" | "error"
  uploadedAt: string
  size: string
  subject?: string
  description?: string
  metadata?: Record<string, any>
}

interface FileListProps {
  files: FileItem[]
  onDeleteFile: (id: string) => void
  onAssessFile: (id: string) => void
  onLearnFile?: (id: string) => void
}

export function FileList({ files, onDeleteFile, onAssessFile, onLearnFile }: FileListProps) {
  return (
    <div className="w-full">
      {files.length === 0 ? (
        <div className="text-center py-6 md:py-8 border rounded-lg">
          <FileText className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No files</h3>
          <p className="mt-1 text-xs md:text-sm text-gray-500">Upload a file to get started</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">File Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Uploaded</TableHead>
                <TableHead className="hidden sm:table-cell">Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                      <span className="truncate max-w-[120px] sm:max-w-none">{file.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={file.status} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{file.uploadedAt}</TableCell>
                  <TableCell className="hidden sm:table-cell">{file.size}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1 md:space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 md:h-8 md:w-8 p-0"
                        title="Learning"
                        onClick={onLearnFile ? () => onLearnFile(file.id) : undefined}
                        asChild={!onLearnFile}
                      >
                        {onLearnFile ? (
                          <div>
                            <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="sr-only">Learning</span>
                          </div>
                        ) : (
                          <Link href={`/home/learning/${file.subject || "english"}/${file.id}`}>
                            <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="sr-only">Learning</span>
                          </Link>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 md:h-8 md:w-8 p-0"
                        title="Assessment"
                        onClick={() => onAssessFile(file.id)}
                      >
                        <ClipboardList className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="sr-only">Assessment</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 md:h-8 md:w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete"
                        onClick={() => onDeleteFile(file.id)}
                      >
                        <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: "processing" | "ready" | "error" }) {
  const statusStyles = {
    processing: "bg-yellow-100 text-yellow-800 border-yellow-200",
    ready: "bg-green-100 text-green-800 border-green-200",
    error: "bg-red-100 text-red-800 border-red-200",
  }

  const statusText = {
    processing: "Processing",
    ready: "Ready",
    error: "Error",
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status]}`}
    >
      {statusText[status]}
    </span>
  )
}
