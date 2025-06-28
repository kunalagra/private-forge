import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Settings, Maximize, Image } from 'lucide-react'

export interface OptionsSettings {
  useImageCompression: boolean
  imageQuality: number
  imagePaperSize: string
}

interface OptionsPanelProps {
  useImageCompression: boolean
  imageQuality: number
  imagePaperSize: string
  onCompressionChange: (value: boolean) => void
  onQualityChange: (value: number) => void
  onImagePaperSizeChange: (value: string) => void
}

const OptionsPanel: React.FC<OptionsPanelProps> = ({
  useImageCompression,
  imageQuality,
  imagePaperSize,
  onCompressionChange,
  onQualityChange,
  onImagePaperSizeChange,
}) => {
  const handleQualityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0
    const clampedValue = Math.min(Math.max(value, 1), 100)
    onQualityChange(clampedValue)
  }

  return (
    <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-xs animate-fade-in hover:shadow-xl transition-all duration-500 group">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
          <Settings className="h-5 w-5 animate-pulse group-hover:animate-spin" />
          PDF Generation Options
        </CardTitle>
        <CardDescription className="dark:text-gray-400">
          Configure how your PDF will be generated
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Image Paper Size */}
          <div className="space-y-3 animate-slide-in-left group/item">
            <Label
              htmlFor="imagePaperSize"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors duration-200"
            >
              <Maximize className="h-4 w-4 group-hover/item:scale-110 transition-transform duration-200" />
              Image Page Size
            </Label>
            <Select
              value={imagePaperSize}
              onValueChange={onImagePaperSizeChange}
            >
              <SelectTrigger className="transition-all duration-300 hover:border-blue-400 focus:border-blue-500 hover:shadow-md hover:scale-[1.02] bg-white/80 dark:bg-gray-800/80">
                <SelectValue placeholder="Select image size" />
              </SelectTrigger>
              <SelectContent className="animate-scale-in">
                <SelectItem
                  value="Original Size"
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                >
                  Original Size
                </SelectItem>
                <SelectItem
                  value="A4"
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                >
                  Fit to A4
                </SelectItem>
                <SelectItem
                  value="A3"
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                >
                  Fit to A3
                </SelectItem>
                <SelectItem
                  value="A5"
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                >
                  Fit to A5
                </SelectItem>
                <SelectItem
                  value="Letter"
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                >
                  Fit to Letter
                </SelectItem>
                <SelectItem
                  value="Legal"
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                >
                  Fit to Legal
                </SelectItem>
                <SelectItem
                  value="Tabloid"
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                >
                  Fit to Tabloid
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image Compression Section */}
          <div className="space-y-4 animate-fade-in-up group/compression">
            <div className="flex items-center justify-between p-4 rounded-xl bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 transition-all duration-300 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:shadow-md hover:scale-[1.02] border border-transparent hover:border-blue-200 dark:hover:border-blue-700">
              <div className="space-y-1">
                <Label
                  htmlFor="compression"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 group-hover/compression:text-blue-600 dark:group-hover/compression:text-blue-400 transition-colors duration-200"
                >
                  <Image className="h-4 w-4 group-hover/compression:scale-110 transition-transform duration-200" />
                  Image Compression
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Reduce file size by compressing images
                </p>
              </div>
              <Switch
                id="compression"
                checked={useImageCompression}
                onCheckedChange={onCompressionChange}
                className="transition-all duration-300 hover:scale-110"
              />
            </div>

            {/* Quality Slider - Only show when compression is enabled */}
            <div
              className={`space-y-4 transition-all duration-500 ease-in-out transform ${
                useImageCompression
                  ? 'opacity-100 max-h-40 translate-y-0 scale-100'
                  : 'opacity-0 max-h-0 -translate-y-4 scale-95 overflow-hidden'
              }`}
            >
              <div className="p-4 rounded-xl bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 animate-scale-in">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                  Image Quality:{' '}
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {imageQuality}%
                  </span>
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[imageQuality]}
                    onValueChange={(value) => onQualityChange(value[0])}
                    max={100}
                    min={1}
                    step={1}
                    className="flex-1 transition-all duration-200 hover:scale-[1.02]"
                  />
                  <div className="relative">
                    <Input
                      type="number"
                      value={imageQuality}
                      onChange={handleQualityInputChange}
                      min={1}
                      max={100}
                      className="w-20 text-center transition-all duration-300 hover:border-blue-400 focus:border-blue-500 hover:shadow-md hover:scale-105 no-spinner bg-white/80 dark:bg-gray-800/80"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                      %
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span className="animate-pulse">
                    Lower quality (smaller file)
                  </span>
                  <span className="animate-pulse">
                    Higher quality (larger file)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default OptionsPanel
