// Free, no-auth-required country/city API — used for the provider onboarding form's
// cascading Country -> City dropdowns.
const GEO_BASE = 'https://countriesnow.space/api/v0.1';

export const geoApi = {
  listCountries: async (): Promise<string[]> => {
    const res = await fetch(`${GEO_BASE}/countries/positions`);
    if (!res.ok) throw new Error('Could not load countries');
    const data = await res.json();
    return (data.data as { name: string }[]).map((c) => c.name).sort();
  },
  listCities: async (country: string): Promise<string[]> => {
    const res = await fetch(`${GEO_BASE}/countries/cities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country }),
    });
    if (!res.ok) throw new Error('Could not load cities');
    const data = await res.json();
    return (data.data as string[]) ?? [];
  },
};