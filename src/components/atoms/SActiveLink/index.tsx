import { cloneElement } from 'react';

import { Box } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useModal } from 'core/hooks/useModal';

import { IActiveLinkProps } from './types';

export function SActiveLink({
  children,
  shouldMatchExactHref,
  ...rest
}: IActiveLinkProps): JSX.Element {
  const { asPath } = useRouter();
  const { onOpenModal } = useModal();

  let isActive = false;

  if (rest.modalName) {
    return (
      <Box
        onClick={() => onOpenModal(rest.modalName as string)}
        sx={{ cursor: 'pointer' }}
        {...rest}
      >
        {children}
      </Box>
    );
  }

  if (shouldMatchExactHref && (asPath === rest.href || asPath === rest.as)) {
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
    <Link href={rest.href || ''} {...rest}>
      {cloneElement(children, {
        is_active: isActive ? 1 : 0,
      })}
    </Link>
  );
}
