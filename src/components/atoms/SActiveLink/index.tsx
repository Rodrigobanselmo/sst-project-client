import { cloneElement } from 'react';

import { Box } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

import SArrowNextIcon from 'assets/icons/SArrowNextIcon';

import { useModal } from 'core/hooks/useModal';

import SFlex from '../SFlex';
import { IActiveLinkProps } from './types';

export function SActiveLink({
  children,
  shouldMatchExactHref,
  canOpen,
  isOpen,
  ...rest
}: IActiveLinkProps): JSX.Element {
  const { asPath } = useRouter();

  let isActive = false;

  if (canOpen)
    return (
      <Box
        onClick={(e) => rest?.onClick?.(e)}
        sx={{ cursor: 'pointer' }}
        position={'relative'}
        {...(rest as any)}
      >
        <Box marginLeft={-8}>{children}</Box>
        <Box position={'absolute'} right={16} top={5}>
          <SArrowNextIcon
            sx={{
              fontSize: 14,
              color: 'grey.400',
              ...(isOpen && { transform: 'rotate(90deg)' }),
            }}
          />
        </Box>
      </Box>
    );

  if (rest.onClick) {
    return (
      <Box
        onClick={(e) => rest?.onClick?.(e)}
        sx={{ cursor: 'pointer' }}
        {...(rest as any)}
      >
        {children}
      </Box>
    );
  }
  const path = asPath.split('?')[0];
  if (shouldMatchExactHref && (path === rest.href || path === rest.as)) {
    isActive = true;
  }

  if (
    !shouldMatchExactHref &&
    (asPath.startsWith(String(rest.href)) ||
      asPath.startsWith(String(rest.href)))
  ) {
    isActive = true;
  }

  return (
    <Link {...rest} href={isActive ? asPath : rest.href || ''}>
      {cloneElement<any>(children, {
        is_active: isActive ? 1 : 0,
      })}
    </Link>
  );
}
