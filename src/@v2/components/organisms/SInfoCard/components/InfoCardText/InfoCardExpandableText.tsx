import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';

const COLLAPSED_LINES = 2;

export const InfoCardExpandableText = ({
  label,
  text,
  minWidth = 200,
}: {
  label: string;
  text: string;
  minWidth?: string | number;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const contentRef = useRef<HTMLElement>(null);

  const measureOverflow = useCallback(() => {
    const el = contentRef.current;
    if (!el || expanded) return;
    setHasOverflow(el.scrollHeight > el.clientHeight + 1);
  }, [expanded]);

  useLayoutEffect(() => {
    measureOverflow();
  }, [text, measureOverflow]);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => measureOverflow());
    observer.observe(el);
    return () => observer.disconnect();
  }, [measureOverflow]);

  const showToggle = expanded || hasOverflow;

  return (
    <SFlex direction="column" gap={0} flex={1} minWidth={minWidth}>
      <SText ft={12} color="text.label" mb={2}>
        {label}
      </SText>
      <SText
        ref={contentRef}
        color="text.main"
        lineNumber={expanded ? undefined : COLLAPSED_LINES}
        sx={{ wordBreak: 'break-word' }}
      >
        {text}
      </SText>
      {showToggle && (
        <SText
          role="button"
          tabIndex={0}
          ft={12}
          color="info.main"
          onClick={() => setExpanded((prev) => !prev)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setExpanded((prev) => !prev);
            }
          }}
          sx={{
            alignSelf: 'flex-start',
            mt: 0.5,
            cursor: 'pointer',
            textDecoration: 'underline',
            '&:hover': { opacity: 0.85 },
          }}
        >
          {expanded ? 'Recolher' : 'Ver todos'}
        </SText>
      )}
    </SFlex>
  );
};
