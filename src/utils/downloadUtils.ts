// utils/downloadUtils.ts

/**
 * Converts a Cloudinary URL to force download with proper filename
 */
export const getCloudinaryDownloadUrl = (url: string, filename?: string): string => {
  try {
    if (!url.includes('cloudinary.com')) {
      return url;
    }

    // Split the URL at /upload/
    const parts = url.split('/upload/');
    if (parts.length !== 2) {
      return url;
    }

    // Create download flag with filename
    const downloadFlag = filename 
      ? `fl_attachment:${encodeURIComponent(filename)}`
      : 'fl_attachment';

    // Reconstruct URL with download flag
    return `${parts[0]}/upload/${downloadFlag}/${parts[1]}`;
  } catch (error) {
    console.error('Error creating download URL:', error);
    return url;
  }
};

/**
 * Downloads a file from a URL using fetch and blob
 */
export const downloadFileFromUrl = async (url: string, filename: string): Promise<void> => {
  try {
    console.log('Starting download for:', filename);
    
    // First try with the download URL
    const downloadUrl = getCloudinaryDownloadUrl(url, filename);
    
    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Create blob URL and trigger download
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up blob URL
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    
    console.log('Download completed successfully');
    
  } catch (error) {
    console.error('Download failed:', error);
    
    // Fallback: open in new tab
    console.log('Trying fallback: opening in new tab');
    window.open(url, '_blank');
  }
};

/**
 * Gets appropriate file icon based on MIME type
 */
export const getFileIcon = (mimeType: string): string => {
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📋';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) return '🗜️';
  if (mimeType.includes('audio')) return '🎵';
  if (mimeType.includes('video')) return '🎬';
  if (mimeType.includes('text')) return '📄';
  if (mimeType.startsWith('image/')) return '🖼️';
  return '📎';
};

/**
 * Formats file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};