import React, { FC, useMemo } from 'react';

import { CircularProgress, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { styled } from '@mui/material';
import STooltip from 'components/atoms/STooltip';

import { ImageRowProps } from './types';

const StyledImage = styled('img')`
  max-width: 100px;
  max-height: 50px;
  border: 2px solid ${({ theme }) => theme.palette.grey[300]};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  object-fit: contain;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
  &:active {
    opacity: 0.5;
  }
`;

const ImageRow: FC<{ children?: any } & ImageRowProps> = ({
  children,
  onClick,
  fontSize = 12,
  lineHeight,
  loading,
  sx,
  imageProps = {},
  tooltipProps = {},
  clickable,
  url,
  alt,
  ...props
}) => {
  const memoizedChildren = useMemo(() => {
    if (loading) return <CircularProgress size={16} />;

    return (
      <>
        <StyledImage
          alt={alt || 'Image'}
          src={url || '/images/placeholder-image.png'}
        />
        {children}
      </>
    );
  }, [loading, alt, url, children]);

  return (
    <SFlex
      onClick={onClick}
      sx={{
        cursor: onClick || clickable ? 'pointer' : 'default',
        height: '100%',
        ...sx,
      }}
      className="table-row-box"
      align="center"
      {...props}
    >
      {memoizedChildren}
    </SFlex>
  );
};

export default ImageRow;
