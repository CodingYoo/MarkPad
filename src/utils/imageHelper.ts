// Helper function to convert file path to asset URL in Tauri
export async function convertToAssetUrl(filePath: string): Promise<string> {
  try {
    console.log('[imageHelper] Converting file path:', filePath)
    
    // Dynamic import to avoid errors in browser mode
    const core = await import('@tauri-apps/api/core')
    console.log('[imageHelper] Tauri core module:', Object.keys(core))
    
    // Try different ways to access convertFileSrc
    let convertFileSrc = core.convertFileSrc
    
    if (!convertFileSrc && (core as any).default?.convertFileSrc) {
      convertFileSrc = (core as any).default.convertFileSrc
    }
    
    if (typeof convertFileSrc !== 'function') {
      console.error('[imageHelper] convertFileSrc is not a function:', typeof convertFileSrc)
      console.error('[imageHelper] Available exports:', Object.keys(core))
      return ''
    }
    
    const url = convertFileSrc(filePath)
    console.log('[imageHelper] Converted URL:', url)
    return url
  } catch (error) {
    console.error('[imageHelper] Failed to convert file path:', error)
    return ''
  }
}
