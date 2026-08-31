'use client';

import { useEffect } from 'react';

export function HomeAnimations() {
  useEffect(() => {
    let cancelled = false;
    let ctx: any;

    (async () => {
      const gsapModule = await import('gsap');
      const scrollTriggerModule = await import('gsap/ScrollTrigger');
      const gsap = gsapModule.gsap;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      if (cancelled) return; // ⬅️ YEH ADD KARO — agar component pehle hi unmount ho chuka hai to animation mat chalao

      ctx = gsap.context(() => {
        gsap.from('.gsap-hero-badge', { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' });
        gsap.from('.gsap-hero-title', { opacity: 0, y: 30, duration: 0.7, delay: 0.1, ease: 'power2.out' });
        gsap.from('.gsap-hero-sub', { opacity: 0, y: 20, duration: 0.6, delay: 0.25, ease: 'power2.out' });
        gsap.from('.gsap-hero-cta', { opacity: 0, y: 20, duration: 0.6, delay: 0.35, stagger: 0.1, ease: 'power2.out' });

        document.querySelectorAll<HTMLElement>('.stat-num').forEach((el) => {
          const target = parseInt(el.getAttribute('data-target') || '0', 10);
          const obj = { val: 0 };
          ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            once: true,
            onEnter: () => {
              gsap.to(obj, {
                val: target,
                duration: 1.6,
                ease: 'power1.out',
                onUpdate: () => {
                  el.textContent = `${Math.floor(obj.val).toLocaleString()}+`;
                },
              });
            },
          });
        });

        document.querySelectorAll('section').forEach((section) => {
          const items = section.querySelectorAll('.gsap-fade');
          if (items.length) {
            gsap.from(items, {
              opacity: 0,
              y: 24,
              duration: 0.6,
              stagger: 0.08,
              ease: 'power2.out',
              scrollTrigger: { trigger: section, start: 'top 85%' },
            });
          }
        });
      });
    })();

    return () => {
      cancelled = true; // ⬅️ YEH BHI ADD KARO
      ctx?.revert();
    };
  }, []);

  return null;
}