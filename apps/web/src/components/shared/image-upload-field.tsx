'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import { uploadApi, UploadFolder } from '@/lib/upload-api';
import { useToast } from '@/components/ui/toast';

interface ImageUploadFieldProps {
  label: string;
  folder: UploadFolder;
  value: string | null;
  onChange: (url: string | null) => void;
  aspect?: 'square' | 'wide';
}

export function ImageUploadField({ label, folder, value, onChange, aspect = 'square' }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { show } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      show('Image must be under 4MB', 'error');
      return;
    }
    setUploading(true);
    try {
      const { url } = await uploadApi.uploadImage(file, folder);
      onChange(url);
    } catch (err: any) {
      show(err?.response?.data?.message ?? 'Could not upload image', 'error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-primary">{label}</label>
      <div
        className={`relative overflow-hidden rounded-btn border border-dashed border-border bg-bg ${
          aspect === 'square' ? 'aspect-square w-32' : 'aspect-[3/1] w-full'
        }`}
      >
        {value ? (
          <>
            <Image src={value} alt={label} fill className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <X size={12} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-full w-full flex-col items-center justify-center gap-1 text-text-muted disabled:opacity-50"
          >
            <Upload size={18} />
            <span className="text-xs">{uploading ? 'Uploading...' : 'Upload'}</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
    </div>
  );
}