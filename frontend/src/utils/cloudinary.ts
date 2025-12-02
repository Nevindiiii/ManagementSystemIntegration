import axios from 'axios';
export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  url: string;
}
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUD_UPLOAD_PRESET;
  const folder = import.meta.env.VITE_CLOUD_FOLDER || 'products';

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration missing');
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);
  try {
    const response = await axios.post<CloudinaryResponse>(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      formData
    );
    return response.data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw new Error('Failed to upload image');
  }
};
