'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const slides = [
  { title: 'AI finds the best for you', desc: 'Smart shopping, trusted always.' },
  { title: 'Compare across stores instantly', desc: 'See real prices from every seller side by side.' },
  { title: 'Shop safely with trust & protection', desc: 'Buyer protection on every order, every store.' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const isLast = step === slides.length - 1;

  const next = () => (isLast ? router.push('/login') : setStep((s) => s + 1));

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-bg px-6 py-10">
      <button
        onClick={() => router.push('/login')}
        className="self-end text-sm font-medium text-text-muted"
      >
        Skip
      </button>

      <div className="flex flex-col items-center text-center">
        <div className="mb-8 flex h-40 w-40 items-center justify-center rounded-2xl bg-primary/10">
          <span className="text-4xl">✨</span>
        </div>
        <h2 className="text-xl font-bold text-text-primary">{slides[step].title}</h2>
        <p className="mt-2 text-text-muted">{slides[step].desc}</p>
      </div>

      <div className="w-full max-w-xs">
        <div className="mb-6 flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-border'}`}
            />
          ))}
        </div>
        <Button className="w-full" onClick={next}>
          {isLast ? 'Get Started' : 'Next'}
        </Button>
      </div>
    </div>
  );
}