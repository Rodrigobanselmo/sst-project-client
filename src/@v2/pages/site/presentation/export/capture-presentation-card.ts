import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import type { PresentationCardDefinition } from '../constants/presentation.constant';
import { PresentationExportFrame } from './PresentationExportFrame';

export const PRESENTATION_EXPORT_WIDTH = 1920;
export const PRESENTATION_EXPORT_HEIGHT = 1080;

const FONT_TIMEOUT_MS = 4000;
const IMAGE_TIMEOUT_MS = 4000;
const LAYOUT_SETTLE_MS = 80;

type MountedExportHost = {
  host: HTMLElement;
  root: Root;
  slide: HTMLElement;
};

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function withTimeout(promise: Promise<unknown>, ms: number) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error('timeout')), ms);
    }),
  ]);
}

async function waitForFonts() {
  try {
    await withTimeout(document.fonts.ready, FONT_TIMEOUT_MS);
  } catch {
    /* continue with currently available faces */
  }
}

async function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll('img'));

  await Promise.all(
    images.map(async (image) => {
      if (image.complete && image.naturalWidth > 0) {
        return;
      }

      try {
        if (typeof image.decode === 'function') {
          await withTimeout(image.decode(), IMAGE_TIMEOUT_MS);
          return;
        }

        await withTimeout(
          new Promise<void>((resolve) => {
            const done = () => resolve();
            image.addEventListener('load', done, { once: true });
            image.addEventListener('error', done, { once: true });
          }),
          IMAGE_TIMEOUT_MS,
        );
      } catch {
        /* skip failed decode so export can proceed */
      }
    }),
  );
}

function mountExportHost(card: PresentationCardDefinition): MountedExportHost {
  const host = document.createElement('div');
  host.className = 'lp lp-pres lp-pres--export';
  host.setAttribute('aria-hidden', 'true');
  document.body.appendChild(host);

  const root = createRoot(host);
  flushSync(() => {
    root.render(createElement(PresentationExportFrame, { card }));
  });

  const slide = host.querySelector<HTMLElement>('[data-presentation-export="slide"]');
  if (!slide) {
    root.unmount();
    host.remove();
    throw new Error('Não foi possível montar o card para exportação.');
  }

  return { host, root, slide };
}

function unmountExportHost(mounted: MountedExportHost | undefined) {
  if (!mounted) {
    return;
  }

  try {
    mounted.root.unmount();
  } catch {
    /* already unmounted */
  }
  mounted.host.remove();
}

function prepareExportGraphics(root: HTMLElement) {
  root.querySelectorAll('svg').forEach((svg) => {
    const rect = svg.getBoundingClientRect();
    const width = rect.width || svg.clientWidth;
    const height = rect.height || svg.clientHeight;
    if (!width || !height) {
      return;
    }

    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.style.width = `${width}px`;
    svg.style.height = `${height}px`;
    svg.style.overflow = 'visible';

    const viewBox = svg.viewBox.baseVal;
    const scaleX = viewBox?.width ? viewBox.width / width : 1;

    svg.querySelectorAll<SVGElement>('path, line, polyline, polygon, circle, ellipse, rect').forEach((node) => {
      const computed = window.getComputedStyle(node);
      const strokeWidth = Number.parseFloat(computed.strokeWidth);
      const usesNonScalingStroke = computed.vectorEffect === 'non-scaling-stroke';

      node.setAttribute('vector-effect', 'none');
      node.style.setProperty('vector-effect', 'none', 'important');

      if (usesNonScalingStroke && Number.isFinite(strokeWidth) && strokeWidth > 0) {
        const nextWidth = String(strokeWidth * scaleX);
        node.setAttribute('stroke-width', nextWidth);
        node.style.setProperty('stroke-width', nextWidth, 'important');
      }

      if (computed.fill === 'none' || node.getAttribute('fill') === 'none') {
        node.setAttribute('fill', 'none');
        node.style.setProperty('fill', 'none', 'important');
      }
    });

    svg.querySelectorAll('marker').forEach((marker) => marker.remove());
    svg.querySelectorAll<SVGElement>('[marker-end]').forEach((node) => {
      node.removeAttribute('marker-end');
      node.style.setProperty('marker-end', 'none', 'important');
    });
  });

  root.querySelectorAll('.lp-pres-flow__return-path').forEach((node) => {
    const svg = node.closest('svg');
    if (!svg || svg.querySelector('[data-presentation-export-arrow]')) {
      return;
    }

    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrow.setAttribute('data-presentation-export-arrow', 'true');
    arrow.setAttribute('d', 'M7.2 16.1 L10 11.2 L12.8 16.1 Z');
    arrow.setAttribute('fill', '#17233c');
    svg.appendChild(arrow);
  });
}

export async function capturePresentationCard(card: PresentationCardDefinition): Promise<string> {
  let mounted: MountedExportHost | undefined;

  try {
    await waitForFonts();
    mounted = mountExportHost(card);
    await waitForImages(mounted.slide);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    await wait(LAYOUT_SETTLE_MS);
    prepareExportGraphics(mounted.slide);

    const { toPng } = await import('html-to-image');

    return await toPng(mounted.slide, {
      width: PRESENTATION_EXPORT_WIDTH,
      height: PRESENTATION_EXPORT_HEIGHT,
      canvasWidth: PRESENTATION_EXPORT_WIDTH,
      canvasHeight: PRESENTATION_EXPORT_HEIGHT,
      pixelRatio: 1,
      cacheBust: false,
      skipAutoScale: true,
      backgroundColor: '#ffffff',
      preferredFontFormat: 'woff2',
      style: {
        margin: '0',
        transform: 'none',
        width: `${PRESENTATION_EXPORT_WIDTH}px`,
        height: `${PRESENTATION_EXPORT_HEIGHT}px`,
      },
      onImageErrorHandler: () => undefined,
    });
  } finally {
    unmountExportHost(mounted);
  }
}
