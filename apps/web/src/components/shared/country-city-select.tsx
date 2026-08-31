'use client';

import { useQuery } from '@tanstack/react-query';
import { geoApi } from '@/lib/geo-api';

interface CountryCitySelectProps {
  country: string;
  city: string;
  onCountryChange: (country: string) => void;
  onCityChange: (city: string) => void;
}

export function CountryCitySelect({ country, city, onCountryChange, onCityChange }: CountryCitySelectProps) {
  // staleTime: Infinity — country/city lists never change mid-session, so one fetch
  // per country is cached for the whole app lifetime instead of re-hitting the API.
  const { data: countries, isLoading: countriesLoading } = useQuery({
    queryKey: ['geo-countries'],
    queryFn: geoApi.listCountries,
    staleTime: Infinity,
  });

  const { data: cities, isLoading: citiesLoading } = useQuery({
    queryKey: ['geo-cities', country],
    queryFn: () => geoApi.listCities(country),
    enabled: !!country,
    staleTime: Infinity,
  });

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">Country</label>
        <select
          value={country}
          onChange={(e) => {
            onCountryChange(e.target.value);
            onCityChange('');
          }}
          disabled={countriesLoading}
          className="h-11 w-full rounded-btn border border-border bg-surface px-3.5 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
          required
        >
          <option value="">{countriesLoading ? 'Loading...' : 'Select country'}</option>
          {countries?.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">City</label>
        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={!country || citiesLoading}
          className="h-11 w-full rounded-btn border border-border bg-surface px-3.5 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
          required
        >
          <option value="">{!country ? 'Select country first' : citiesLoading ? 'Loading...' : 'Select city'}</option>
          {cities?.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </div>
  );
}