import { FileText, Trash2, Upload, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import FileUploadZone from '../components/FileUploadZone'
import OptionsPanel from '../components/OptionsPanel'
import PreviewModal from '../components/PreviewModal'
import ThemeToggle from '../components/ThemeToggle'
import { useAppState } from '../hooks/useAppState'
import {
  type FileItem,
  type PDFGenerationOptions,
  PDFService,
} from '../services/pdfService'

const Index = () => {
  const { files, setFiles, settings, updateSettings, clearFiles } =
    useAppState()
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode')
    const systemPrefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches
    const isDark = savedTheme ? JSON.parse(savedTheme) : systemPrefersDark

    setDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  // Update dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode))
    document.documentElement.classList.toggle('dark', newDarkMode)
  }

  const handleFilesUpload = async (uploadedFiles: File[]) => {
    const newFileItems: FileItem[] = []

    for (const file of uploadedFiles) {
      const fileType = file.type.toLowerCase()
      const isImage = fileType.startsWith('image/')
      const isPdf = fileType === 'application/pdf'

      if (isImage || isPdf) {
        const fileItem: FileItem = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          type: isImage ? 'image' : 'pdf',
        }

        if (isImage) {
          fileItem.preview = URL.createObjectURL(file)
        } else if (isPdf) {
          try {
            fileItem.pageCount = await PDFService.getPageCount(file)
          } catch (error) {
            console.error('Error getting page count:', error)
            fileItem.pageCount = 1
          }
        }

        newFileItems.push(fileItem)
      }
    }

    setFiles((prev) => [...prev, ...newFileItems])
    toast.success(`Added ${newFileItems.length} file(s)`, {
      description: 'Ready to be combined into PDF',
    })
  }

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file && file.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter((f) => f.id !== id)
    })
    toast.info('File removed')
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    setFiles((prev) => {
      const newFiles = [...prev]
      ;[newFiles[index - 1], newFiles[index]] = [
        newFiles[index],
        newFiles[index - 1],
      ]
      return newFiles
    })
  }

  const handleMoveDown = (index: number) => {
    if (index === files.length - 1) return
    setFiles((prev) => {
      const newFiles = [...prev]
      ;[newFiles[index], newFiles[index + 1]] = [
        newFiles[index + 1],
        newFiles[index],
      ]
      return newFiles
    })
  }

  const handleReorder = (dragIndex: number, hoverIndex: number) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      const draggedFile = newFiles[dragIndex]
      newFiles.splice(dragIndex, 1)
      newFiles.splice(hoverIndex, 0, draggedFile)
      return newFiles
    })
  }

  const handlePreview = (file: FileItem) => {
    setPreviewFile(file)
    setIsPreviewOpen(true)
  }

  const downloadPDF = (pdfBytes: Uint8Array, filename: string) => {
    try {
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log('Download initiated for:', filename)
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download PDF')
    }
  }

  const handleGeneratePdf = async () => {
    if (files.length === 0) {
      toast.error('Please add at least one file')
      return
    }

    setIsProcessing(true)

    try {
      const options: PDFGenerationOptions = {
        useImageCompression: settings.useImageCompression,
        imageQuality: settings.imageQuality,
        imagePaperSize: settings.imagePaperSize,
      }
      const pdfBytes = await PDFService.combineFiles(files, options)
      const filename = `combined-files-${new Date().toISOString().split('T')[0]}.pdf`

      downloadPDF(pdfBytes, filename)

      toast.success('PDF created successfully!', {
        description: `Combined ${files.length} file(s) into a new PDF${settings.useImageCompression ? ` with ${settings.imageQuality}% quality` : ''}`,
      })
    } catch (error) {
      console.error('PDF Generation Error:', error)
      toast.error('Error generating PDF', {
        description: 'Please check your files and try again',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const canGenerate = files.length > 0

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ThemeToggle darkMode={darkMode} onToggle={toggleDarkMode} />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-xl text-white mr-4">
              <FileText className="h-8 w-8" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100">
              Private Forge
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Combine images and PDFs into a single document. Mix and match files
            in any order.
            <span className="inline-flex items-center mx-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
              100% Private
            </span>
            All processing happens locally in your browser.
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Upload className="h-5 w-5" />
                Upload & Arrange Files
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Add images (JPG, PNG, WebP) and PDF files. Drag to reorder, use
                arrow buttons, or click the eye icon to preview.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploadZone
                accept="image/*,.pdf"
                multiple={true}
                onFilesSelected={handleFilesUpload}
                placeholder="Drop your images and PDF files here or click to browse"
                icon={<FileText className="h-8 w-8" />}
                files={files}
                onRemove={handleRemoveFile}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onReorder={handleReorder}
                onPreview={handlePreview}
              />
            </CardContent>
          </Card>

          <OptionsPanel
            useImageCompression={settings.useImageCompression}
            imageQuality={settings.imageQuality}
            imagePaperSize={settings.imagePaperSize}
            onCompressionChange={(value) =>
              updateSettings({ useImageCompression: value })
            }
            onQualityChange={(value) => updateSettings({ imageQuality: value })}
            onImagePaperSizeChange={(value) =>
              updateSettings({
                imagePaperSize: value as typeof settings.imagePaperSize,
              })
            }
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleGeneratePdf}
              disabled={!canGenerate || isProcessing}
              className="flex-1 h-14 text-lg bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  <span>Generating PDF...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <Zap className="mr-3 h-5 w-5" />
                  <span>Combine into PDF</span>
                </div>
              )}
            </Button>

            {files.length > 0 && (
              <Button
                onClick={clearFiles}
                className="sm:w-auto w-full h-14 text-lg bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center">
                  <Trash2 className="mr-3 h-5 w-5" />
                  <span>Clear Files</span>
                </div>
              </Button>
            )}
          </div>
        </div>
      </div>

      <PreviewModal
        file={previewFile}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false)
          setPreviewFile(null)
        }}
      />
    </div>
  )
}

export default Index
