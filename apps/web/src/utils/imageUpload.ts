import { sanitizeSvg } from './sanitize'

const RASTER_IMAGE_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/avif',
])

export function isAllowedRasterImageMimeType(value: string): boolean {
  return RASTER_IMAGE_MIME_TYPES.has(value.trim().toLowerCase())
}

export function hasRasterImageSignature(bytes: Uint8Array, mimeType: string): boolean {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end))
  switch (mimeType.trim().toLowerCase()) {
    case 'image/png':
      return bytes.length >= 8 && bytes.slice(0, 8).every(
        (value, index) => value === [137, 80, 78, 71, 13, 10, 26, 10][index],
      )
    case 'image/jpeg':
      return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    case 'image/gif':
      return ascii(0, 6) === 'GIF87a' || ascii(0, 6) === 'GIF89a'
    case 'image/webp':
      return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP'
    case 'image/avif':
      return bytes.length >= 12 && ascii(4, 8) === 'ftyp' && ['avif', 'avis'].includes(ascii(8, 12))
    default:
      return false
  }
}

export function sanitizeUploadedSvg(value: string): string {
  const sanitized = sanitizeSvg(value).trim()
  return /^<svg(?:\s|>)/i.test(sanitized) ? sanitized : ''
}

export function readBlobPrefix(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result))
        return
      }
      reject(new Error('Unable to read image bytes'))
    }
    reader.onerror = () => reject(reader.error || new Error('Unable to read image bytes'))
    reader.readAsArrayBuffer(blob)
  })
}
