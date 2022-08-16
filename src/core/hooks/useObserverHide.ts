import { useRef, useEffect, useState } from 'react';

import throttle from 'lodash.throttle';

export function onVisible(callback: any) {
  const throttleFn = throttle((state: boolean) => {
    callback(state);
  }, 200);

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        throttleFn(false);
      } else {
        throttleFn(true);
      }
    });
  });
}

export function useObserverHide() {
  const ref = useRef<HTMLDivElement>(null);
  const [hide, setHide] = useState(true);

  useEffect(() => {
    if (ref.current) {
      const x = onVisible((e: boolean) => setHide(e));
      x.observe(ref.current);

      return () => {
        x.disconnect();
      };
    }
  }, []);

  return { ref, hide, setHide };
}
