import { useEffect, useState } from 'react'
import type { FileItem } from '../services/pdfService'

interface AppSettings {
  useImageCompression: boolean
  imageQuality: number
  imagePaperSize:
    | 'A4'
    | 'Letter'
    | 'Legal'
    | 'A3'
    | 'A5'
    | 'Tabloid'
    | 'Original Size'
}

const DEFAULT_SETTINGS: AppSettings = {
  useImageCompression: true,
  imageQuality: 85,
  imagePaperSize: 'Original Size',
}

export const useAppState = () => {
  const [files, setFiles] = useState<FileItem[]>([])
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('private-forge-settings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('private-forge-settings', JSON.stringify(settings))
  }, [settings])

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const clearFiles = () => {
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    setFiles([])
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
  }

  return {
    files,
    setFiles,
    settings,
    updateSettings,
    clearFiles,
    resetSettings,
  }
}
