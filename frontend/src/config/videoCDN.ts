// Video CDN Configuration for Bunny CDN
// Supports iframe embed for Bunny Stream

export interface BunnyCDNConfig {
  storageZone: string; // e.g., 'abc123' from vz-abc123.b-cdn.net
  libraryId: string; // For iframe embed
  getIframeUrl: (videoId: string) => string;
  getHlsUrl: (videoId: string) => string;
}

// Configuration for Bunny CDN
// Update these values with your actual Bunny CDN credentials
export const VIDEO_CDN_CONFIG: { bunnycdn: BunnyCDNConfig } = {
  bunnycdn: {
    // Your Bunny CDN storage zone name (the part after 'vz-' in your pull zone URL)
    // Example: If your URL is vz-abc123.b-cdn.net, then storageZone = 'abc123'
    // Update this with your actual storage zone name
    storageZone: 'a268bf91-e24', // Extracted from vz-a268bf91-e24.b-cdn.net
    
    // Your Bunny CDN stream library ID (for iframe embed)
    // Find it in: Bunny.net Dashboard > Stream > Library Settings
    // Update this with your actual library ID
    libraryId: '499688', // Your actual Bunny CDN library ID
    
    // Bunny CDN iframe embed URL
    // Returns: https://iframe.mediadelivery.net/play/{libraryId}/{videoId}
    getIframeUrl: (videoId: string) => {
      return `https://iframe.mediadelivery.net/play/${VIDEO_CDN_CONFIG.bunnycdn.libraryId}/${videoId}`;
    },
    getHlsUrl: (videoId: string) => {
      if (!videoId) return '';
      return `https://vz-${VIDEO_CDN_CONFIG.bunnycdn.storageZone}.b-cdn.net/${videoId}/playlist.m3u8`;
    }
  }
};

/**
 * Get Bunny CDN iframe URL for a video
 * @param videoId - Video ID from Bunny CDN
 * @returns Complete iframe URL
 */
export function getVideoUrl(videoId: string): string {
  if (!videoId) {
    console.error('getVideoUrl: Video ID is required');
    return '';
  }

  try {
    return VIDEO_CDN_CONFIG.bunnycdn.getIframeUrl(videoId);
  } catch (error) {
    console.error('Error generating iframe URL:', error);
    return '';
  }
}

/**
 * Validate Bunny CDN configuration
 * @returns Validation result
 */
export function validateConfig(): { bunnycdn: boolean } {
  return {
    bunnycdn: !!VIDEO_CDN_CONFIG.bunnycdn.storageZone && 
              VIDEO_CDN_CONFIG.bunnycdn.storageZone !== 'YOUR_STORAGE_ZONE' &&
              !!VIDEO_CDN_CONFIG.bunnycdn.libraryId &&
              VIDEO_CDN_CONFIG.bunnycdn.libraryId !== 'YOUR_LIBRARY_ID'
  };
}

export const getBunnyHlsUrl = (videoId: string): string => {
  if (!videoId) return '';
  if (videoId.startsWith('http')) return videoId;
  return VIDEO_CDN_CONFIG.bunnycdn.getHlsUrl(videoId);
};
