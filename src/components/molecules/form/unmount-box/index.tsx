import React, { useEffect, useState } from 'react';

import { Box } from '@mui/material';

import { UnmountBoxProps } from './types';

export const UnmountBox = ({
  defaultValue = '',
  unmountOnChangeDefault,
  children,
  ...props
}: UnmountBoxProps) => {
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (unmountOnChangeDefault) {
      setMounted(false);
      setTimeout(() => {
        setMounted(true);
      }, 30);
    }
  }, [unmountOnChangeDefault, defaultValue]);

  // if (unmountOnChangeDefault && !mounted) return null;
  if (!unmountOnChangeDefault) return <>{children}</>;

  return (
    <Box {...(mounted && { component: 'section' })} {...props}>
      {children}
    </Box>
  );
};
