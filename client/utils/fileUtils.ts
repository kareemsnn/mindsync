// File utilities for profile image handling

/**
 * Resize and compress an image to reduce file size
 * @param file The original image file
 * @returns A promise that resolves to a compressed file
 */
export const resizeAndCompressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        // Calculate new dimensions (max 800px width/height)
        const maxSize = 800
        let width = img.width
        let height = img.height
        
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height
            height = maxSize
          }
        }
        
        // Create canvas and resize image
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx!.drawImage(img, 0, 0, width, height)
        
        // Convert to Blob with compression
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob from image'))
            return
          }
          // Create a new File object from the blob
          const newFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          resolve(newFile)
        }, 'image/jpeg', 0.7) // Compression quality 0.7 (70%)
      }
      img.onerror = () => {
        reject(new Error('Error loading image for compression'))
      }
    }
    reader.onerror = () => {
      reject(new Error('Error reading file for compression'))
    }
  })
}

/**
 * Convert a file to base64 string representation
 * @param file The file to convert
 * @returns A promise that resolves to a base64 string
 */
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        console.log("Base64 conversion successful, length:", reader.result.length)
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert file to base64'))
      }
    }
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Helper function to convert hex-encoded bytea to a displayable data URL
 * @param hexString The hex string from PostgreSQL
 * @returns A data URL string that can be used in img src
 */
export const hexToDataUrl = (hexString: string): string => {
  try {
    // If it already starts with data:image, it's already a data URL
    if (hexString.startsWith('data:image')) {
      return hexString;
    }
    
    // Check if it's a hex-encoded bytea from PostgreSQL (starts with \\x)
    if (hexString.startsWith('\\x')) {
      // Remove the \\x prefix
      const hex = hexString.substring(2);
      
      // Convert hex to binary
      let binary = '';
      for (let i = 0; i < hex.length; i += 2) {
        const hexByte = hex.substr(i, 2);
        const byte = parseInt(hexByte, 16);
        binary += String.fromCharCode(byte);
      }
      
      // If it looks like a data URL after conversion, return it
      if (binary.startsWith('data:image')) {
        return binary;
      } else {
        console.error('Converted binary does not start with data:image');
        return '';
      }
    }
    
    console.warn('Unknown image format:', hexString.substring(0, 20));
    return '';
  } catch (error) {
    console.error('Error converting hex to data URL:', error);
    return '';
  }
}; 