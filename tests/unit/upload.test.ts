import { describe, it, expect } from 'vitest'
import { validateUpload } from '@/lib/upload'

describe('validateUpload', () => {
  it('accepts valid CAD file extensions', () => {
    const validFiles = [
      { name: 'part.sldprt', size: 1024 },
      { name: 'assembly.sldasm', size: 2048 },
      { name: 'drawing.slddrw', size: 512 },
      { name: 'model.step', size: 1024 },
      { name: 'spec.pdf', size: 256 },
    ]

    validFiles.forEach(file => {
      const result = validateUpload(file, 'free')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  it('rejects unsupported file extensions', () => {
    const invalidFiles = [
      { name: 'virus.exe', size: 1024 },
      { name: 'script.js', size: 512 },
      { name: 'archive.zip', size: 2048 },
    ]

    invalidFiles.forEach(file => {
      const result = validateUpload(file, 'free')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Unsupported file type')
    })
  })

  it('enforces 100MB limit for free tier', () => {
    const file = { name: 'large.sldprt', size: 101 * 1024 * 1024 }
    const result = validateUpload(file, 'free')
    
    expect(result.valid).toBe(false)
    expect(result.error).toContain('100MB')
  })

  it('allows larger files for paid tiers', () => {
    const file = { name: 'large.sldprt', size: 200 * 1024 * 1024 }
    
    expect(validateUpload(file, 'part-time').valid).toBe(true)
    expect(validateUpload(file, 'full-time').valid).toBe(true)
    expect(validateUpload(file, 'team').valid).toBe(true)
  })

  it('rejects files over 500MB for all tiers', () => {
    const file = { name: 'huge.sldprt', size: 501 * 1024 * 1024 }
    
    const tiers: Array<'free' | 'part-time' | 'full-time' | 'team'> = 
      ['free', 'part-time', 'full-time', 'team']
    
    tiers.forEach(tier => {
      const result = validateUpload(file, tier)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('500MB')
    })
  })

  it('rejects empty files', () => {
    const file = { name: 'empty.sldprt', size: 0 }
    const result = validateUpload(file, 'free')
    
    expect(result.valid).toBe(false)
    expect(result.error).toContain('empty')
  })
})