import { NextRequest, NextResponse } from 'next/server'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { r2Client, R2_BUCKET } from '@/lib/storage'
import { supabase } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = params.id

    // Get file record
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single()

    if (fileError || !file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Check authorization (user owns project or is assigned worker)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user owns the project
    const { data: project } = await supabase
      .from('projects')
      .select('customer_id')
      .eq('id', file.project_id)
      .single()

    const isOwner = project?.customer_id === user.id

    // Check if user is assigned worker
    const { data: assignment } = await supabase
      .from('project_assignments')
      .select('id')
      .eq('project_id', file.project_id)
      .eq('worker_id', user.id)
      .single()

    const isWorker = !!assignment

    if (!isOwner && !isWorker) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Generate presigned download URL (valid for 1 hour)
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: file.storage_path,
    })

    const downloadUrl = await getSignedUrl(r2Client, command, { 
      expiresIn: 3600 
    })

    return NextResponse.json({
      downloadUrl,
      filename: file.filename,
      expiresIn: 3600,
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    )
  }
}