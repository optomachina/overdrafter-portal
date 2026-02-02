interface ValidationResult {
  valid: boolean
  error?: string
}

interface FileInput {
  name: string
  size: number
}

const ALLOWED_EXTENSIONS = ['.sldprt', '.sldasm', '.slddrw', '.step', '.pdf']

const TIER_LIMITS = {
  free: 100 * 1024 * 1024,      // 100MB
  'part-time': 500 * 1024 * 1024, // 500MB
  'full-time': 500 * 1024 * 1024,
  team: 500 * 1024 * 1024,
}

const ABSOLUTE_MAX_SIZE = 500 * 1024 * 1024 // 500MB

export function validateUpload(
  file: FileInput,
  tier: 'free' | 'part-time' | 'full-time' | 'team'
): ValidationResult {
  // Check if file is empty
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' }
  }

  // Check absolute max size
  if (file.size > ABSOLUTE_MAX_SIZE) {
    return { valid: false, error: 'File exceeds maximum size of 500MB' }
  }

  // Check tier-specific limit
  const tierLimit = TIER_LIMITS[tier]
  if (file.size > tierLimit) {
    return { 
      valid: false, 
      error: `File exceeds ${tier === 'free' ? '100MB' : '500MB'} limit for ${tier} tier` 
    }
  }

  // Check file extension
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return { 
      valid: false, 
      error: `Unsupported file type: ${extension}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` 
    }
  }

  return { valid: true }
}