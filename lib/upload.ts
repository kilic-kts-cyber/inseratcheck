// lib/upload.ts
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export function validateUpload(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Nur JPG, PNG, WebP und PDF erlaubt'
  }
  if (file.size > MAX_SIZE) {
    return 'Datei darf maximal 10 MB groß sein'
  }
  return null
}

export function sanitizeFilename(original: string): string {
  const ext = path.extname(original).toLowerCase()
  const unique = crypto.randomBytes(16).toString('hex')
  return `${unique}${ext}`
}

export async function saveFileLocally(
  file: File, 
  orderId: string, 
  category: string
): Promise<{ filename: string; path: string; url: string }> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const filename = sanitizeFilename(file.name)
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', orderId, category)
  
  await mkdir(uploadDir, { recursive: true })
  
  const filePath = path.join(uploadDir, filename)
  await writeFile(filePath, buffer)

  const relativePath = `/uploads/${orderId}/${category}/${filename}`

  return { filename, path: filePath, url: relativePath }
}

// TODO: S3 Upload (implementiere wenn UPLOAD_PROVIDER=s3)
export async function saveFileToS3(
  _file: File,
  _orderId: string,
  _category: string
): Promise<{ filename: string; path: string; url: string }> {
  // TODO: Implementiere mit @aws-sdk/client-s3
  // const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
  // const s3 = new S3Client({ region: process.env.AWS_REGION })
  throw new Error('S3 Upload nicht konfiguriert. Setze UPLOAD_PROVIDER=local für Entwicklung.')
}

export async function uploadFile(
  file: File,
  orderId: string,
  category: string = 'OTHER'
): Promise<{ filename: string; path: string; url: string }> {
  const error = validateUpload(file)
  if (error) throw new Error(error)

  const provider = process.env.UPLOAD_PROVIDER || 'local'
  
  if (provider === 's3') {
    return saveFileToS3(file, orderId, category)
  }
  return saveFileLocally(file, orderId, category)
}
