import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileText } from 'lucide-react'
import type { FileItem } from '../services/pdfService'

interface PreviewModalProps {
  file: FileItem | null
  isOpen: boolean
  onClose: () => void
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  file,
  isOpen,
  onClose,
}) => {
  if (!file) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-gray-100">
            {file.type === 'image' ? (
              <img
                src={file.preview}
                alt=""
                className="w-6 h-6 object-cover rounded"
              />
            ) : (
              <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
            )}
            {file.file.name}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          {file.type === 'image' ? (
            <div className="flex justify-center">
              <img
                src={file.preview}
                alt={file.file.name}
                className="max-w-full max-h-[60vh] object-contain rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <FileText className="w-16 h-16 mb-4 text-red-400 dark:text-red-300" />
              <p className="text-lg font-medium">PDF Preview</p>
              <p className="text-sm">PDF preview is not available</p>
              <p className="text-xs mt-1">
                {file.pageCount} pages •{' '}
                {(file.file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PreviewModal
