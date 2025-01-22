/**
 * Extrai o ID do arquivo de uma URL do Google Drive
 */
export function extractGoogleDriveFileId(url: string): string | null {
  // Formato: https://drive.google.com/file/d/{fileId}/view
  const fileRegex = /\/file\/d\/([^/]+)/;
  // Formato: https://docs.google.com/document/d/{fileId}/edit
  const docsRegex = /\/document\/d\/([^/]+)/;
  // Formato: https://docs.google.com/spreadsheets/d/{fileId}/edit
  const sheetsRegex = /\/spreadsheets\/d\/([^/]+)/;
  // Formato: https://docs.google.com/presentation/d/{fileId}/edit
  const slidesRegex = /\/presentation\/d\/([^/]+)/;

  const match = url.match(fileRegex) || 
                url.match(docsRegex) || 
                url.match(sheetsRegex) || 
                url.match(slidesRegex);

  return match ? match[1] : null;
}

/**
 * Gera uma URL de visualização para um arquivo do Google Drive
 */
export function getGoogleDrivePreviewUrl(url: string): string | null {
  const fileId = extractGoogleDriveFileId(url);
  if (!fileId) return null;

  if (url.includes('docs.google.com')) {
    // Para documentos do Google Docs, Sheets e Slides
    if (url.includes('/document/')) {
      return `https://docs.google.com/document/d/${fileId}/preview`;
    } else if (url.includes('/spreadsheets/')) {
      return `https://docs.google.com/spreadsheets/d/${fileId}/preview`;
    } else if (url.includes('/presentation/')) {
      return `https://docs.google.com/presentation/d/${fileId}/preview`;
    }
  } else {
    // Para arquivos genéricos do Drive
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  return null;
}

/**
 * Verifica se uma URL é do Google Drive
 */
export function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com') || url.includes('docs.google.com');
}

/**
 * Obtém o tipo de documento do Google Drive
 */
export function getGoogleDriveFileType(url: string): string {
  if (url.includes('/document/')) {
    return 'document';
  } else if (url.includes('/spreadsheets/')) {
    return 'spreadsheet';
  } else if (url.includes('/presentation/')) {
    return 'presentation';
  } else if (url.includes('/file/')) {
    // Tentar determinar o tipo pelo final da URL
    const extension = url.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) return 'image';
    if (['mp4', 'webm', 'ogg'].includes(extension || '')) return 'video';
  }
  return 'file';
}
