import { api } from './api-client';

export type UploadFolder = 'avatars' | 'products' | 'stores';

export interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadApi = {
  uploadImage: (file: File, folder: UploadFolder) => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post<UploadResult>(`/uploads/image?folder=${folder}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};