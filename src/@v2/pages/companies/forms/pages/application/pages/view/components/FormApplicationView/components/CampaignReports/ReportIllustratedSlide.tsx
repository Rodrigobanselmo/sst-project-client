import { Box } from '@mui/material';
import { useLayoutEffect, useRef, type ReactNode } from 'react';

/** Fit only narrative paragraphs to the actual illustration height. Evidence
 * disclosures retain normal typography and never affect the fitting target. */
export function ReportIllustratedSlide({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    let frame = 0;
    let disposed = false;
    const paragraphs = () =>
      Array.from(
        element.querySelectorAll<HTMLElement>('[data-slide-paragraph]'),
      );
    const reset = () =>
      paragraphs().forEach((p) => {
        p.style.removeProperty('font-size');
        p.style.removeProperty('line-height');
      });
    const fit = () => {
      reset();
      if (!active) return;
      const image = element.querySelector('img');
      const text = element.querySelector<HTMLElement>('[data-slide-text]');
      const ps = paragraphs();
      if (!image || !text || !ps.length) return;
      const picture = image.getBoundingClientRect();
      const column = text.getBoundingClientRect();
      // Stacked/mobile and collapsed sections use the normal reading size.
      if (
        picture.height < 1 ||
        column.width < 1 ||
        column.left < picture.right - 1
      )
        return;
      const base = parseFloat(getComputedStyle(ps[0]).fontSize);
      const setSize = (size: number) =>
        ps.forEach((p) => {
          p.style.fontSize = `${size}px`;
          p.style.lineHeight = '1.45';
        });
      const height = () =>
        ps.reduce((sum, p) => {
          const style = getComputedStyle(p);
          return (
            sum +
            p.getBoundingClientRect().height +
            parseFloat(style.marginTop) +
            parseFloat(style.marginBottom)
          );
        }, 0);
      let low = base,
        high = Math.max(base, Math.min(80, base * 3));
      setSize(low);
      if (height() > picture.height) return; // Never sacrifice normal readability.
      for (let step = 0; step < 12; step++) {
        const size = (low + high) / 2;
        setSize(size);
        if (height() <= picture.height) low = size;
        else high = size;
      }
      setSize(Math.floor(low * 10) / 10);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    // Height changes caused by fitting must not feed back into another fit.
    let previousWidth = -1,
      previousImageHeight = -1;
    const observer = new ResizeObserver(() => {
      const width = element.getBoundingClientRect().width;
      const imageHeight =
        element.querySelector('img')?.getBoundingClientRect().height ?? 0;
      if (width !== previousWidth || imageHeight !== previousImageHeight) {
        previousWidth = width;
        previousImageHeight = imageHeight;
        schedule();
      }
    });
    observer.observe(element);
    const imageColumn = element.querySelector('[data-slide-image]');
    if (imageColumn) observer.observe(imageColumn);
    element.addEventListener('load', schedule, true);
    window.addEventListener('resize', schedule);
    document.fonts.ready.then(() => {
      if (!disposed && element.isConnected) schedule();
    });
    schedule();
    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
      element.removeEventListener('load', schedule, true);
      window.removeEventListener('resize', schedule);
      reset();
    };
  }, [active, children]);
  return (
    <Box
      ref={root}
      data-illustrated-slide
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        alignItems: 'flex-start',
        gap: '32px',
      }}
    >
      {children}
    </Box>
  );
}
