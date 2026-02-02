import { createClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// R2 client (S3-compatible)
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export const R2_BUCKET = process.env.R2_BUCKET_NAME!

export interface UploadConfig {
  projectId: string
  userId: string
  tier: 'free' | 'part-time' | 'full-time' | 'team'
}

export async function getUploadUrl(
  file: File,
  config: UploadConfig
): Promise<{ uploadUrl: string; fileId: string; expiresAt?: Date }> {
  const fileId = crypto.randomUUID()
  const key = `${config.userId}/${config.projectId}/${fileId}-${file.name}`
  
  // Generate presigned URL for direct browser upload
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: file.type,
    ContentLength: file.size,
  })
  
  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 })
  
  // Calculate expiration for free tier
  const expiresAt = config.tier === 'free' 
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    : undefined
  
  return { uploadUrl, fileId, expiresAt }
}

export async function saveFileRecord(
  fileId: string,
  file: File,
  config: UploadConfig,
  storagePath: string,
  expiresAt?: Date
) {
  const { data, error } = await supabase
    .from('files')
    .insert({
      id: fileId,
      project_id: config.projectId,
      filename: file.name,
      file_type: getFileExtension(file.name),
      size_bytes: file.size,
      storage_path: storagePath,
      version: 1,
      expires_at: expiresAt?.toISOString(),
      created_by: config.userId,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

function getFileExtension(filename: string): string {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'))
  const allowed = ['.sldprt', '.sldasm', '.slddrw', '.step', '.pdf']
  return allowed.includes(ext) ? ext.slice(1) : 'unknown'
}