'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Mic, Square, Sparkles, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountryCitySelect } from '@/components/shared/country-city-select';
import { useVoiceInput } from '@/hooks/use-voice-input';
import { serviceCategoriesApi, providerProfileApi } from '@/lib/provider-api';
import { useToast } from '@/components/ui/toast';

export default function ProviderOnboardingPage() {
  const router = useRouter();
  const { show } = useToast();
  const { transcript, setTranscript, listening, supported, start, stop } = useVoiceInput();

  const { data: categories } = useQuery({ queryKey: ['service-categories'], queryFn: serviceCategoriesApi.list });

  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [selectedCategorySlugs, setSelectedCategorySlugs] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleExtract = async () => {
    if (!transcript.trim()) {
      show('Record your voice description first', 'error');
      return;
    }
    setExtracting(true);
    try {
      const result = await providerProfileApi.extractFromVoice(transcript);
      setBio(result.bio);
      setSkills(result.skills);
      setSelectedCategorySlugs(result.matchedCategories.map((c) => c.slug));
      show('Profile filled from your voice description — review and adjust below');
    } catch {
      show('Could not process voice input', 'error');
    } finally {
      setExtracting(false);
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
        show('Location captured');
      },
      () => {
        setLocating(false);
        show('Could not get your location', 'error');
      },
    );
  };

  const toggleCategory = (slug: string) => {
    setSelectedCategorySlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (selectedCategorySlugs.length === 0) {
      setError('Select at least one service category.');
      return;
    }
    setSaving(true);
    try {
      await providerProfileApi.create({
        bio,
        skills,
        categorySlugs: selectedCategorySlugs,
        city,
        country,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
      });
      show('Provider profile created!');
      router.push('/provider/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not create profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-lg rounded-card border border-border bg-surface p-6">
        <h1 className="text-xl font-bold text-text-primary">Set Up Your Provider Profile</h1>
        <p className="mt-1 text-sm text-text-muted">
          Describe your services out loud, or fill in the form manually below.
        </p>

        {supported ? (
          <div className="mt-5 rounded-card border border-dashed border-border bg-bg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary">Voice Description</span>
              <button
                type="button"
                onClick={listening ? stop : start}
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  listening ? 'bg-danger text-white' : 'bg-primary text-white'
                }`}
              >
                {listening ? <Square size={16} /> : <Mic size={16} />}
              </button>
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder='e.g. "I do plumbing and pipe fitting, 5 years experience, I also fix water heaters..."'
              rows={3}
              className="mt-3 w-full rounded-btn border border-border bg-surface p-3 text-sm focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={handleExtract}
              disabled={extracting}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-primary disabled:opacity-50"
            >
              <Sparkles size={12} />
              {extracting ? 'Extracting...' : 'Fill profile from this description'}
            </button>
          </div>
        ) : (
          <p className="mt-5 rounded-btn border border-border bg-bg p-3 text-xs text-text-muted">
            Voice input isn&apos;t supported in this browser — please fill the form manually.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-btn border border-border bg-bg p-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Skills</label>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span key={skill} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{skill}</span>
              ))}
              {skills.length === 0 && <p className="text-xs text-text-muted">No skills yet — use voice input above.</p>}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Service Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories?.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCategory(c.slug)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    selectedCategorySlugs.includes(c.slug) ? 'border-primary bg-primary/5 text-primary' : 'border-border text-text-muted'
                  }`}
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>

          <CountryCitySelect country={country} city={city} onCountryChange={setCountry} onCityChange={setCity} />

          <button
            type="button"
            onClick={handleUseLocation}
            disabled={locating}
            className="flex items-center gap-1.5 text-xs font-medium text-primary disabled:opacity-50"
          >
            <Navigation size={12} />
            {locating ? 'Locating...' : latitude ? 'Precise location captured ✓' : 'Also capture precise GPS location (recommended)'}
          </button>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" className="w-full" loading={saving}>
            Create Provider Profile
          </Button>
        </form>
      </div>
    </div>
  );
}