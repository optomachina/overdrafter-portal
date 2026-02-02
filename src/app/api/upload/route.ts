import { NextRequest, NextResponse } from 'next/server'
import { getUploadUrl, saveFileRecord, UploadConfig } from '@/lib/storage'
import { validateUpload } from '@/lib/upload'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename, size, projectId, userId, tier } = body

    // Validate file
    const validation = validateUpload({ name: filename, size }, tier)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Get presigned URL
    const config: UploadConfig = {
      projectId,
      userId,
      tier,
    }

    const { uploadUrl, fileId, expiresAt } = await getUploadUrl(
      { name: filename, size } as File,
      config
    )

    // Save file record
    const storagePath = `${userId}/${projectId}/${fileId}-${filename}`
    await saveFileRecord(fileId, { name: filename, size } as File, config, storagePath, expiresAt)

    return NextResponse.json({
      fileId,
      uploadUrl,
      expiresAt: expiresAt?.toISOString(),
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to create upload' },
      { status: 500 }
    )
  }
}