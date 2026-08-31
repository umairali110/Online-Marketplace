'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sellerStoreApi } from '@/lib/seller-api';
import { catalogApi } from '@/lib/catalog-api';
import { aiApi } from '@/lib/ai-api';
import { useToast } from '@/components/ui/toast';
import { ImageUploadField } from '@/components/shared/image-upload-field';
import { CountryCitySelect } from '@/components/shared/country-city-select';
import { Sparkles, Navigation } from 'lucide-react';

export default function StoreBuilderPage() {
  const queryClient = useQueryClient();
  const { show } = useToast();

  const { data: store } = useQuery({ queryKey: ['seller-store'], queryFn: sellerStoreApi.getMyStore });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: catalogApi.getCategories });

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
    const [logo, setLogo] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
    const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
    const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (store) {
      setName(store.name);
      setCategory(store.category ?? '');
      setDescription(store.description ?? '');
      setLogo(store.logo);
      setBanner(store.banner);
      setCity(store.city ?? '');
      setCountry(store.country ?? '');
            setLatitude(store.latitude ?? null);
      setLongitude(store.longitude ?? null);
    }
  }, [store]);

  const handleGenerate = async () => {
    if (!name) {
      show('Enter a store name first', 'error');
      return;
    }
    setGenerating(true);
    try {
      const { description: generated } = await aiApi.generateStoreDescription(name, category || undefined);
      setDescription(generated);
    } catch {
      show('Could not generate description', 'error');
    } finally {
      setGenerating(false);
    }
  };

    const handleUseLocation = () => {
    if (!navigator.geolocation) {
      show('Location services not supported in this browser', 'error');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocating(false);
        show('Store location captured');
      },
      () => {
        setLocating(false);
        show('Could not get your location', 'error');
      },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
                if (store) {
        await sellerStoreApi.update({ name, category, description, logo: logo ?? undefined, banner: banner ?? undefined, city, country, latitude: latitude ?? undefined, longitude: longitude ?? undefined });
        show('Store updated');
      } else {
        await sellerStoreApi.create({ name, category, description, logo: logo ?? undefined, banner: banner ?? undefined, city, country, latitude: latitude ?? undefined, longitude: longitude ?? undefined });
        show('Store created! Waiting for admin approval.');
      }
      queryClient.invalidateQueries({ queryKey: ['seller-store'] });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not save store');
    } finally {
      setSaving(false);
    }
    
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-text-primary">
        {store ? 'Store Settings' : 'AI Store Builder'}
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        {store ? 'Update your store details.' : "Tell us about your store and we'll set it up for you."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <ImageUploadField label="Store Logo" folder="stores" value={logo} onChange={setLogo} aspect="square" />
        <ImageUploadField label="Store Banner" folder="stores" value={banner} onChange={setBanner} aspect="wide" />
                <CountryCitySelect country={country} city={city} onCountryChange={setCountry} onCityChange={setCity} />
                        <button
          type="button"
          onClick={handleUseLocation}
          disabled={locating}
          className="flex items-center gap-1.5 text-xs font-medium text-primary disabled:opacity-50"
        >
          <Navigation size={12} />
          {locating ? 'Locating...' : latitude ? 'Precise location captured ✓' : 'Also capture precise store location (recommended for local search)'}
        </button>
        <Input label="Store Name" value={name} onChange={(e) => setName(e.target.value)} required />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">Store Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 w-full rounded-btn border border-border bg-surface px-3.5 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">Select a category</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-text-primary">Store Description</label>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-1 text-xs font-medium text-primary disabled:opacity-50"
            >
              <Sparkles size={12} />
              {generating ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="We provide the best electronics products with trust and quality."
            className="w-full rounded-btn border border-border bg-bg p-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" loading={saving}>
          {store ? 'Save Changes' : 'Create Store'}
        </Button>
      </form>
    </div>
  );
}