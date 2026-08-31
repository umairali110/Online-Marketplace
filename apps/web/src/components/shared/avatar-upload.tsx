'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import { userApi, avatarUrl } from '@/lib/user-api';
import { useToast } from '@/components/ui/toast';

export function AvatarUpload({
  currentAvatar,
  name,
  onUploaded,
}: {
  currentAvatar: string | null;
  name: string;
  onUploaded: (newAvatarPath: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { show } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      show('Image must be under 2MB', 'error');
      return;
    }
    setUploading(true);
    try {
      const updated = await userApi.uploadAvatar(file);
      onUploaded(updated.avatar ?? '');
      show('Profile picture updated');
    } catch (err: any) {
      show(err?.response?.data?.message ?? 'Could not upload image', 'error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const resolvedUrl = avatarUrl(currentAvatar);

  return (
    <div className="relative h-20 w-20 shrink-0">
      <div className="relative h-20 w-20 overflow-hidden rounded-full border border-border bg-bg">
        {resolvedUrl ? (
          <Image src={resolvedUrl} alt={name} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-lg font-bold text-primary">
            {name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md disabled:opacity-50"
      >
        <Camera size={13} />
      </button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
    </div>
  );
}