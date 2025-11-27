/**
 * Converts an image path to a proper URL for display
 * Handles various path formats and ensures it's a valid relative or absolute URL
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return '';
  }

  // If it's already a full URL, use it as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Ensure the path starts with / for proper relative URL resolution
  // If it starts with /uploads/, replace with /api/uploads/
  if (imagePath.startsWith('/uploads/')) {
    return imagePath.replace('/uploads/', '/api/uploads/');
  }

  // If it starts with uploads/ (no leading slash), add /api/
  if (imagePath.startsWith('uploads/')) {
    return `/api/${imagePath}`;
  }

  // If it already starts with /api/uploads/, use as is
  if (imagePath.startsWith('/api/uploads/')) {
    return imagePath;
  }

  // If it starts with /api/ but not /api/uploads/, use as is (might be other API paths)
  if (imagePath.startsWith('/api/')) {
    return imagePath;
  }

  // If it starts with /, it's already an absolute path, just ensure it goes through /api/uploads/
  if (imagePath.startsWith('/')) {
    // If it's a path like /blogs/..., assume it should be /api/uploads/blogs/...
    if (imagePath.startsWith('/blogs/')) {
      return `/api/uploads${imagePath}`;
    }
    return imagePath;
  }

  // Default: assume it's a relative path and prepend /api/uploads/
  return `/api/uploads/${imagePath}`;
};

