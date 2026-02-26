import {
  ArrowDown,
  ArrowUp,
  Eye,
  FileText,
  GripVertical,
  Image as ImageIcon,
  X,
} from 'lucide-react'
import type React from 'react'
import { useCallback, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { FileItem } from '../services/pdfService'

interface FileUploadZoneProps {
  accept: string
  multiple: boolean
  onFilesSelected: (files: File[]) => void
  placeholder: string
  icon: React.ReactNode
  files?: FileItem[]
  onRemove?: (id: string) => void
  onMoveUp?: (index: number) => void
  onMoveDown?: (index: number) => void
  onReorder?: (dragIndex: number, hoverIndex: number) => void
  onPreview?: (file: FileItem) => void
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  accept,
  multiple,
  onFilesSelected,
  placeholder,
  icon,
  files = [],
  onRemove,
  onMoveUp,
  onMoveDown,
  onReorder,
  onPreview,
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const isValidFile = (file: File): boolean => {
    const fileType = file.type.toLowerCase()

    if (accept.includes('image/*') && accept.includes('.pdf')) {
      return fileType.startsWith('image/') || fileType === 'application/pdf'
    }
    if (accept === 'image/*') {
      return fileType.startsWith('image/')
    }
    if (accept === '.pdf') {
      return fileType === 'application/pdf'
    }
    return true
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      const validFiles = files.filter(isValidFile)

      if (validFiles.length > 0) {
        onFilesSelected(multiple ? validFiles : [validFiles[0]])
      }
    },
    [multiple, onFilesSelected],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      const validFiles = files.filter(isValidFile)

      if (validFiles.length > 0) {
        onFilesSelected(multiple ? validFiles : [validFiles[0]])
      }
      e.target.value = ''
    },
    [multiple, onFilesSelected],
  )

  const getAcceptString = () => {
    if (accept.includes('image/*') && accept.includes('.pdf')) {
      return 'image/*,.pdf'
    }
    return accept
  }

  const getDescription = () => {
    if (accept.includes('image/*') && accept.includes('.pdf')) {
      return 'Supports images (JPG, PNG, WebP) and PDF files'
    }
    if (accept === 'image/*') {
      return 'Supports JPG, PNG, WebP, and more'
    }
    if (accept === '.pdf') {
      return 'PDF files only'
    }
    return 'All file types supported'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / k ** i).toFixed(1)) + ' ' + sizes[i]
  }

  const handleFileDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', '')
  }

  const handleFileDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (draggedIndex !== null && draggedIndex !== index && onReorder) {
      onReorder(draggedIndex, index)
      setDraggedIndex(index)
    }
  }

  const handleFileDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
          ${
            isDragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/30'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById(`file-input-${accept}`)?.click()}
      >
        <input
          id={`file-input-${accept}`}
          type="file"
          accept={getAcceptString()}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="space-y-3">
          <div
            className={`mx-auto transition-colors ${isDragOver ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}
          >
            {icon}
          </div>
          <div>
            <p
              className={`text-sm font-medium transition-colors ${isDragOver ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
            >
              {files.length > 0
                ? 'Add more files or drop them here'
                : placeholder}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {getDescription()}
            </p>
          </div>
        </div>
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Files ({files.length})
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Drag files to reorder or use controls
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {files.map((fileItem, index) => (
              <div
                key={fileItem.id}
                draggable
                onDragStart={(e) => handleFileDragStart(e, index)}
                onDragOver={(e) => handleFileDragOver(e, index)}
                onDragEnd={handleFileDragEnd}
                className={`group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-all duration-200 cursor-move ${
                  draggedIndex === index ? 'opacity-50 scale-95' : ''
                }`}
              >
                {/* Remove Button - Fixed positioning */}
                {onRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemove(fileItem.id)
                    }}
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}

                {/* Control Buttons - Fixed positioning to avoid overlap */}
                <div className="absolute top-1 left-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {onMoveUp && index > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onMoveUp(index)
                      }}
                      className="h-5 w-5 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    >
                      <ArrowUp className="h-2.5 w-2.5" />
                    </Button>
                  )}
                  {onMoveDown && index < files.length - 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onMoveDown(index)
                      }}
                      className="h-5 w-5 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    >
                      <ArrowDown className="h-2.5 w-2.5" />
                    </Button>
                  )}
                </div>

                {/* Preview Button - Positioned to avoid overlap */}
                {onPreview && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onPreview(fileItem)
                    }}
                    className="absolute top-1 right-8 h-6 w-6 p-0 bg-gray-700 hover:bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                )}

                {/* Drag Handle */}
                <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </div>

                {/* File Content */}
                <div className="flex flex-col items-center space-y-2">
                  {/* Thumbnail/Icon */}
                  <div className="relative">
                    {fileItem.type === 'image' ? (
                      <img
                        src={fileItem.preview}
                        alt={fileItem.file.name}
                        className="w-16 h-16 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded border flex items-center justify-center">
                        <FileText className="h-8 w-8 text-red-600 dark:text-red-400" />
                      </div>
                    )}

                    {/* Order Number */}
                    <div className="absolute -top-1 -left-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="text-center w-full">
                    <p
                      className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate max-w-full"
                      title={fileItem.file.name}
                    >
                      {fileItem.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(fileItem.file.size)}
                    </p>

                    {/* File Type Badge */}
                    <Badge
                      variant="outline"
                      className={`text-xs mt-1 ${
                        fileItem.type === 'image'
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700'
                          : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
                      }`}
                    >
                      {fileItem.type === 'image' ? (
                        <>
                          <ImageIcon className="h-2.5 w-2.5 mr-1" />
                          Image
                        </>
                      ) : (
                        <>
                          <FileText className="h-2.5 w-2.5 mr-1" />
                          PDF ({fileItem.pageCount} pages)
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUploadZone
