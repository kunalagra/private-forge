import React, { useState } from 'react'
import { X, GripVertical, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { FileItem } from '../services/pdfService'

interface ImagePreviewProps {
  images: FileItem[]
  onRemove: (id: string) => void
  onReorder: (images: FileItem[]) => void
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  images,
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

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]

    // Remove dragged item
    newImages.splice(draggedIndex, 1)
    // Insert at new position
    newImages.splice(index, 0, draggedImage)

    onReorder(newImages)
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
      {images.map((image, index) => (
        <div
          key={image.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`
            group relative bg-linear-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 transition-all duration-200 cursor-move hover:shadow-lg hover:border-blue-300
            ${draggedIndex === index ? 'opacity-50 scale-95 shadow-xl border-blue-400' : ''}
          `}
        >
          {/* Drag Handle */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors">
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(image.id)}
            className="absolute right-2 top-2 h-8 w-8 p-0 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-start gap-4 ml-6 mr-10">
            {/* Image Thumbnail */}
            <div className="shrink-0 relative">
              <img
                src={image.preview}
                alt={image.file.name}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-xs"
              />
              <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {index + 1}
              </div>
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0 pt-1">
              <p className="text-sm font-medium text-gray-900 truncate mb-1">
                {image.file.name}
              </p>
              <p className="text-xs text-gray-500 mb-2">
                {formatFileSize(image.file.size)}
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                >
                  <ImageIcon className="h-3 w-3 mr-1" />
                  Page {index + 1}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      ))}

      {images.length > 1 && (
        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-100">
          <GripVertical className="h-4 w-4 inline mr-1" />
          Drag images to reorder them in your PDF
        </div>
      )}
    </div>
  )
}

export default ImagePreview
