import React, { useEffect, useRef, useState } from 'react';

import { Box } from '@mui/material';

import { UnmountBoxProps } from './types';

export const UnmountBox = ({
  defaultValue = '',
  unmountOnChangeDefault,
  children,
  ...props
}: UnmountBoxProps) => {
  const [mounted, setMounted] = useState(true);
  const ref = useRef<any>(null);

  useEffect(() => {
    if (
      ref.current != defaultValue &&
      (!(defaultValue as any)?.id ||
        (defaultValue as any)?.id === ref.current?.id)
    ) {
      if (unmountOnChangeDefault) {
        setMounted(false);
        setTimeout(() => {
          setMounted(true);
        }, 30);
      }
    }
    ref.current = defaultValue;
  }, [unmountOnChangeDefault, defaultValue]);

  // if (unmountOnChangeDefault && !mounted) return null;
  if (!unmountOnChangeDefault) return <>{children}</>;

  return (
    <Box {...(mounted && { component: 'section' })} {...props}>
      {children}
    </Box>
  );
};
