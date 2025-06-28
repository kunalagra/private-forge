import React, { useState } from 'react'
import { X, GripVertical, Image as ImageIcon, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { FileItem } from '../services/pdfService'

interface FilePreviewProps {
  files: FileItem[]
  onRemove: (id: string) => void
  onReorder: (files: FileItem[]) => void
}

const FilePreview: React.FC<FilePreviewProps> = ({
  files,
  onRemove,
  onReorder,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === index) return

    const newFiles = [...files]
    const draggedFile = newFiles[draggedIndex]

    newFiles.splice(draggedIndex, 1)
    newFiles.splice(index, 0, draggedFile)

    onReorder(newFiles)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
      {files.map((fileItem, index) => (
        <div
          key={fileItem.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`
            group relative bg-linear-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 transition-all duration-200 cursor-move hover:shadow-lg hover:border-blue-300
            ${draggedIndex === index ? 'opacity-50 scale-95 shadow-xl border-blue-400' : ''}
          `}
        >
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors">
            <GripVertical className="h-4 w-4" />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(fileItem.id)}
            className="absolute right-2 top-2 h-8 w-8 p-0 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-start gap-4 ml-6 mr-10">
            <div className="shrink-0 relative">
              {fileItem.type === 'image' ? (
                <img
                  src={fileItem.preview}
                  alt={fileItem.file.name}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 bg-red-100 rounded-lg border border-red-200 shadow-xs flex items-center justify-center">
                  <FileText className="h-8 w-8 text-red-600" />
                </div>
              )}
              <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {index + 1}
              </div>
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <p className="text-sm font-medium text-gray-900 truncate mb-1">
                {fileItem.file.name}
              </p>
              <p className="text-xs text-gray-500 mb-2">
                {formatFileSize(fileItem.file.size)}
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${fileItem.type === 'image' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                >
                  {fileItem.type === 'image' ? (
                    <>
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Image
                    </>
                  ) : (
                    <>
                      <FileText className="h-3 w-3 mr-1" />
                      PDF ({fileItem.pageCount} pages)
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      ))}

      {files.length > 1 && (
        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-100">
          <GripVertical className="h-4 w-4 inline mr-1" />
          Drag files to reorder them in your PDF
        </div>
      )}
    </div>
  )
}

export default FilePreview
