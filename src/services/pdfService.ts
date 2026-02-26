import { PDFDocument } from 'pdf-lib'
import { ImageService, type PaperSize } from './imageService'

export interface PDFGenerationOptions {
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

export interface FileItem {
  id: string
  file: File
  type: 'image' | 'pdf'
  preview?: string
  pageCount?: number
}

// Standard page sizes in points (1/72 inch)
const PAGE_SIZES: Record<string, PaperSize> = {
  A4: { name: 'A4', width: 595, height: 842 },
  Letter: { name: 'Letter', width: 612, height: 792 },
  Legal: { name: 'Legal', width: 612, height: 1008 },
  A3: { name: 'A3', width: 842, height: 1191 },
  A5: { name: 'A5', width: 420, height: 595 },
  Tabloid: { name: 'Tabloid', width: 792, height: 1224 },
  Original: { name: 'Original Size', width: 0, height: 0 },
}

export class PDFService {
  private static imageService = new ImageService()

  static async getPageCount(pdfFile: File): Promise<number> {
    try {
      const pdfBytes = await pdfFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(pdfBytes)
      return pdfDoc.getPageCount()
    } catch (error) {
      console.error('Error reading PDF page count:', error)
      return 1
    }
  }

  static async combineFiles(
    fileItems: FileItem[],
    options: PDFGenerationOptions,
  ): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create()

    for (const fileItem of fileItems) {
      if (fileItem.type === 'image') {
        if (options.useImageCompression) {
          await PDFService.addCompressedImageToPDF(
            pdfDoc,
            fileItem.file,
            options,
          )
        } else {
          await PDFService.addImageToPDF(pdfDoc, fileItem.file, options)
        }
      } else if (fileItem.type === 'pdf') {
        await PDFService.addPDFToPDF(pdfDoc, fileItem.file)
      }
    }

    return await pdfDoc.save()
  }

  private static async addCompressedImageToPDF(
    pdfDoc: PDFDocument,
    imageFile: File,
    options: PDFGenerationOptions,
  ) {
    const paperSize =
      PAGE_SIZES[
        options.imagePaperSize === 'Original Size'
          ? 'Original'
          : options.imagePaperSize
      ]
    const compressedImageBytes = await PDFService.imageService.processImage(
      imageFile,
      paperSize,
      options.imageQuality,
    )

    const image = await pdfDoc.embedJpg(compressedImageBytes)
    const page = pdfDoc.addPage()

    if (options.imagePaperSize === 'Original Size') {
      page.setSize(image.width, image.height)
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      })
    } else {
      const pageSize = PAGE_SIZES[options.imagePaperSize]
      page.setSize(pageSize.width, pageSize.height)

      const scaleX = pageSize.width / image.width
      const scaleY = pageSize.height / image.height
      const scale = Math.min(scaleX, scaleY)

      const scaledWidth = image.width * scale
      const scaledHeight = image.height * scale

      const x = (pageSize.width - scaledWidth) / 2
      const y = (pageSize.height - scaledHeight) / 2

      page.drawImage(image, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      })
    }
  }

  private static async addImageToPDF(
    pdfDoc: PDFDocument,
    imageFile: File,
    options: PDFGenerationOptions,
  ) {
    const imageBytes = await imageFile.arrayBuffer()
    const uint8Array = new Uint8Array(imageBytes)

    let image
    const fileType = imageFile.type.toLowerCase()

    if (fileType.includes('png')) {
      image = await pdfDoc.embedPng(uint8Array)
    } else if (fileType.includes('jpg') || fileType.includes('jpeg')) {
      image = await pdfDoc.embedJpg(uint8Array)
    } else {
      image = await pdfDoc.embedJpg(uint8Array)
    }

    const page = pdfDoc.addPage()

    if (options.imagePaperSize === 'Original Size') {
      page.setSize(image.width, image.height)
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      })
    } else {
      const pageSize = PAGE_SIZES[options.imagePaperSize]
      page.setSize(pageSize.width, pageSize.height)

      const scaleX = pageSize.width / image.width
      const scaleY = pageSize.height / image.height
      const scale = Math.min(scaleX, scaleY)

      const scaledWidth = image.width * scale
      const scaledHeight = image.height * scale

      const x = (pageSize.width - scaledWidth) / 2
      const y = (pageSize.height - scaledHeight) / 2

      page.drawImage(image, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      })
    }
  }

  private static async addPDFToPDF(mainDoc: PDFDocument, pdfFile: File) {
    const pdfBytes = await pdfFile.arrayBuffer()
    const sourcePdf = await PDFDocument.load(pdfBytes)

    const pageIndices = Array.from(
      { length: sourcePdf.getPageCount() },
      (_, i) => i,
    )
    const copiedPages = await mainDoc.copyPages(sourcePdf, pageIndices)

    copiedPages.forEach((page) => {
      mainDoc.addPage(page)
    })
  }
}
