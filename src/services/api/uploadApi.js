/**
 * Production Upload Service
 * Coordinates direct-to-S3 uploads using secure presigned PUT URLs.
 * Private bucket architecture: Frontend never accesses S3 using raw AWS credentials.
 */

import { apiClient } from '../apiClient';

export const uploadApiService = {
  /**
   * Uploads an event poster image directly to private Amazon S3
   * @param {File} file - User-selected image file
   * @returns {Promise<{ url: string, key: string }>}
   */
  async uploadPoster(file) {
    if (!file) {
      throw new Error('No file selected.');
    }

    // Step 1: Request S3 presigned PUT URL from API Gateway / Lambda
    const presignedData = await apiClient.post('/admin/uploads/presigned-url', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });

    const { uploadUrl, finalUrl, s3Key } = presignedData;

    // Step 2: Upload file directly to S3 bucket via presigned PUT
    const s3Response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type
      },
      body: file
    });

    if (!s3Response.ok) {
      throw new Error(`S3 upload failed with status ${s3Response.status}`);
    }

    return {
      url: finalUrl,
      key: s3Key,
      isDemo: false
    };
  }
};
