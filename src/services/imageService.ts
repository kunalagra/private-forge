export interface PaperSize {
  name: string
  width: number
  height: number
}

export class ImageService {
  async processImage(
    file: File,
    paperSize: PaperSize,
    quality: number = 85,
  ): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          let { width, height } = this.calculateDimensions(
            img.width,
            img.height,
            paperSize,
          )

          canvas.width = width
          canvas.height = height

          // Fill with white background
          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, width, height)

          // Calculate dimensions to maintain aspect ratio
          const imgAspect = img.width / img.height
          const canvasAspect = width / height

          let drawWidth = width
          let drawHeight = height
          let offsetX = 0
          let offsetY = 0

          if (paperSize.name !== 'Original Size') {
            if (imgAspect > canvasAspect) {
              // Image is wider than canvas
              drawHeight = width / imgAspect
              offsetY = (height - drawHeight) / 2
            } else {
              // Image is taller than canvas
              drawWidth = height * imgAspect
              offsetX = (width - drawWidth) / 2
            }
          }

          // Draw the image
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

          // Convert to blob and then to Uint8Array with custom quality
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not convert canvas to blob'))
                return
              }

              const reader = new FileReader()
              reader.onload = () => {
                resolve(new Uint8Array(reader.result as ArrayBuffer))
              }
              reader.onerror = () => reject(new Error('Could not read blob'))
              reader.readAsArrayBuffer(blob)
            },
            'image/jpeg',
            quality / 100,
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error('Could not load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  private calculateDimensions(
    imgWidth: number,
    imgHeight: number,
    paperSize: PaperSize,
  ): { width: number; height: number } {
    if (paperSize.name === 'Original Size') {
      return { width: imgWidth, height: imgHeight }
    }

    // Use standard paper dimensions (in pixels at 72 DPI)
    return {
      width: paperSize.width,
      height: paperSize.height,
    }
  }
}
