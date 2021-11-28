import { cloneElement } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import { IActiveLinkProps } from './types';

export function SActiveLink({
  children,
  shouldMatchExactHref,
  ...rest
}: IActiveLinkProps): JSX.Element {
  const { asPath } = useRouter();

  let isActive = false;

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
    <Link {...rest}>
      {cloneElement(children, {
        is_active: isActive ? 1 : 0,
      })}
    </Link>
  );
}
