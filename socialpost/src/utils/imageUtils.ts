const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const MAX_IMAGE_DIMENSION = 2048; // Maximum width/height in pixels

export const validateImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      reject('File size must be less than 10MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      reject('File must be an image');
      return;
    }

    // Create an image element to check dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      // Check dimensions
      if (img.width > MAX_IMAGE_DIMENSION || img.height > MAX_IMAGE_DIMENSION) {
        reject(`Image dimensions must be less than ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION} pixels`);
        return;
      }

      resolve(objectUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject('Failed to load image');
    };

    img.src = objectUrl;
  });
};

export const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > height && width > MAX_IMAGE_DIMENSION) {
          height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
          width = MAX_IMAGE_DIMENSION;
        } else if (height > MAX_IMAGE_DIMENSION) {
          width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
          height = MAX_IMAGE_DIMENSION;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject('Failed to get canvas context');
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with quality 0.8
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject('Failed to compress image');
              return;
            }
            
            // Create new file from blob
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
          },
          'image/jpeg',
          0.8
        );
      };
      
      img.onerror = () => {
        reject('Failed to load image for compression');
      };
    };
    
    reader.onerror = () => {
      reject('Failed to read file');
    };
  });
}; 