'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AvatarUpload } from '@/components/shared/avatar-upload';
import { userApi, FullProfile } from '@/lib/user-api';
import { useToast } from '@/components/ui/toast';

interface ProfileFormProps {
  profile: FullProfile;
  onSaved?: (updated: FullProfile) => void;
  submitLabel?: string;
}

export function ProfileForm({ profile, onSaved, submitLabel = 'Save Changes' }: ProfileFormProps) {
  const { show } = useToast();
  const [avatar, setAvatar] = useState(profile.avatar);
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [city, setCity] = useState(profile.city ?? '');
  const [country, setCountry] = useState(profile.country ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setAvatar(profile.avatar);
    setName(profile.name);
    setPhone(profile.phone ?? '');
    setCity(profile.city ?? '');
    setCountry(profile.country ?? '');
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const updated = await userApi.updateProfile({ name, phone, city, country });
      show('Profile saved');
      onSaved?.({ ...updated, avatar });
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Could not save profile';
      setError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AvatarUpload currentAvatar={avatar} name={name} onUploaded={(path) => setAvatar(path)} />

      <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Phone Number" type="tel" placeholder="+92 3xx xxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} required />

      <div className="grid grid-cols-2 gap-3">
        <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
        <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} required />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" loading={saving}>
        {submitLabel}
      </Button>
    </form>
  );
}