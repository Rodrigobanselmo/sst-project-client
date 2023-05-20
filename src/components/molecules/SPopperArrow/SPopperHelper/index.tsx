import { FC } from 'react';

import SText from 'components/atoms/SText';

import { ISPopperHelper } from './types';

import { SPopperArrow } from '..';

export const SPopperHelper: FC<{ children?: any } & ISPopperHelper> = ({
  anchorEl,
  isOpen,
  close,
  content,
  show,
  ...props
}) => {
  if (!show) return null;

  return (
    <SPopperArrow
      anchorEl={anchorEl}
      isOpen={isOpen}
      close={close}
      color="dark"
      sx={{
        transform: 'translate(6px, 15px)',
        width: '20rem',
        color: 'text.main',
        ...((props.sx || {}) as any),
      }}
      {...props}
    >
      <SText
        sx={{ textAlign: 'center' }}
        color="grey.200"
        py={6}
        px={8}
        fontSize={14}
      >
        {content}
      </SText>
    </SPopperArrow>
  );
};
