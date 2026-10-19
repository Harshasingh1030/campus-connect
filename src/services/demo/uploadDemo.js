/**
 * Demo Upload Service
 * Simulates poster image selection using client-side object previews.
 * NOTE: Does NOT upload to AWS S3. In production, this service requests a secure S3 presigned PUT URL
 * from AWS Lambda and uploads directly to the private S3 bucket.
 */

export const uploadDemoService = {
  /**
   * Generates a local preview URL for form display during development/demo.
   * @param {File} file - Browser File object
   * @returns {Promise<{ url: string, isDemo: boolean, fileName: string }>}
   */
  async uploadPoster(file) {
    if (!file) {
      throw new Error('No file provided for upload.');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Selected file must be an image (JPEG, PNG, WEBP).');
    }

    // Size limit check (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('Image size must be smaller than 5MB.');
    }

    // Simulate short network latency
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Create a local blob preview URL
    const localUrl = URL.createObjectURL(file);

    return {
      url: localUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      isDemo: true,
      message: 'Local preview generated. In production, this uploads directly to Amazon S3 via presigned PUT URL.'
    };
  }
};
