import { BoxProps } from '@mui/material';
import { STSTableHeader } from './STableHeader.styles';

export const STableHeader: React.FC<React.PropsWithChildren<BoxProps>> = ({
  className,
  ...props
}) => (
  <STSTableHeader
    px={6}
    py={4}
    mb={2}
    className={'table_grid ' + className}
    {...props}
  />
);
