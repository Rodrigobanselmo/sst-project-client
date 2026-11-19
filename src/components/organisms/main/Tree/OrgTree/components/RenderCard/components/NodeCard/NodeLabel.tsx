import { useLayoutEffect, useRef } from 'react';
import { Box } from '@mui/material';
import STooltip from 'components/atoms/STooltip';

const BASE_FONT_SIZE = 13;
const MIN_FONT_SIZE = 10;

type NameEntry = { container: HTMLDivElement; text: HTMLParagraphElement; card: HTMLElement | null };
type NameGroup = { entries: Set<NameEntry>; frame?: number };
const scopes = new WeakMap<Element, Map<string, NameGroup>>();

function fitGroup(group: NameGroup) {
  const entries = [...group.entries].filter(({ container }) => container.isConnected);
  // Measure every sibling at the same base size before applying the shared minimum.
  for (const { text, card } of entries) {
    card?.style.removeProperty('--hierarchy-card-width');
    text.style.removeProperty('font-size');
    text.style.setProperty('--hierarchy-name-font-size', `${BASE_FONT_SIZE}px`);
    text.style.whiteSpace = 'nowrap';
  }
  const measured = entries.filter(({ container }) => container.clientWidth > 0);
  const sizes = measured.map(({ container, text }) => Math.min(BASE_FONT_SIZE,
    Math.floor(container.clientWidth / Math.max(1, text.scrollWidth) * BASE_FONT_SIZE * 10) / 10,
  ));
  // Only compact groups whose names all fit at the maximum font size.
  // Include each card's label, controls, gaps and padding in the measurement.
  if (measured.length && sizes.every((size) => size === BASE_FONT_SIZE)) {
    const widths = measured.map(({ container, text, card }) => {
      if (!card) return 0;
      const range = document.createRange();
      range.selectNodeContents(text);
      const scale = text.getBoundingClientRect().width / text.clientWidth || 1;
      const nameWidth = range.getBoundingClientRect().width / scale;
      return Math.ceil(card.offsetWidth - container.clientWidth + nameWidth + 8);
    });
    const sharedWidth = Math.max(...widths);
    for (const { card } of measured) {
      if (card && sharedWidth > 0) {
        card.style.setProperty('--hierarchy-card-width', `${Math.min(card.offsetWidth, sharedWidth)}px`);
      }
    }
  }
  const sharedSize = Math.max(MIN_FONT_SIZE, Math.min(BASE_FONT_SIZE, ...sizes));
  measured.forEach(({ text }, index) => {
    text.style.setProperty('--hierarchy-name-font-size', `${sharedSize}px`);
    text.style.whiteSpace = sizes[index] < MIN_FONT_SIZE || text.scrollWidth > text.clientWidth
      ? 'normal' : 'nowrap';
  });
}

/** Direct siblings of the same hierarchy level share their smallest fitting font. */
export function NodeLabel({ label, groupKey }: { label: string; groupKey: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;
    const scope = container.closest('[data-gse-organogram-viewport]') || document.body;
    let groups = scopes.get(scope);
    if (!groups) { groups = new Map(); scopes.set(scope, groups); }
    let group = groups.get(groupKey);
    if (!group) { group = { entries: new Set() }; groups.set(groupKey, group); }
    const activeGroup = group;
    const entry = { container, text, card: container.closest<HTMLElement>('[id^="node_card_"]') };
    activeGroup.entries.add(entry);
    let disposed = false;
    let lastWidth = container.clientWidth;
    const scheduleFit = () => {
      if (disposed || activeGroup.frame !== undefined) return;
      activeGroup.frame = requestAnimationFrame(() => {
        activeGroup.frame = undefined;
        fitGroup(activeGroup);
      });
    };
    scheduleFit();
    const observer = new ResizeObserver(() => {
      if (container.clientWidth !== lastWidth) {
        lastWidth = container.clientWidth;
        scheduleFit();
      }
    });
    observer.observe(container);
    void document.fonts.ready.then(scheduleFit);
    return () => {
      disposed = true;
      observer.disconnect();
      activeGroup.entries.delete(entry);
      if (!activeGroup.entries.size) {
        if (activeGroup.frame !== undefined) cancelAnimationFrame(activeGroup.frame);
        groups!.delete(groupKey);
      } else {
        // Remaining siblings can grow again when the longest name is removed.
        fitGroup(activeGroup);
      }
    };
  }, [label, groupKey]);

  return (
    <Box ref={containerRef} sx={{ width: '100%', minWidth: 0 }}>
      <STooltip minLength={25} withWrapper enterDelay={600} title={label}>
        <Box
          ref={textRef}
          component="p"
          data-hierarchy-node-name
          data-hierarchy-name-group={groupKey}
          sx={{
            m: 0,
            width: '100%',
            color: 'text.primary',
            fontSize: `clamp(${MIN_FONT_SIZE}px, var(--hierarchy-name-font-size, ${BASE_FONT_SIZE}px), ${BASE_FONT_SIZE}px)`,
            lineHeight: 1.25,
            fontWeight: 600,
            whiteSpace: 'normal',
            overflowWrap: 'anywhere',
            textAlign: 'left',
          }}
        >
          {label}
        </Box>
      </STooltip>
    </Box>
  );
}
