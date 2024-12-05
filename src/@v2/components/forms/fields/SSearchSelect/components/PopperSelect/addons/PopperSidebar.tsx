import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { ReactNode } from 'react';

export type PopperSelectProps<T> = {
  setActive: (active: T) => void;
  active: T;
  options: T[];
  loading?: boolean;
  getOptionLabel: (option: T) => ReactNode;
};

export function PopperSidebar<T>({
  options,
  active,
  loading,
  setActive,
  getOptionLabel,
}: PopperSelectProps<T>) {
  return (
    <SFlex
      direction="column"
      color="red"
      sx={{
        position: 'absolute',
        top: 0,
        width: '200px',
        left: -208,
        minHeight: 180,
        height: '100%',
        borderRadius: 1,
        backgroundColor: 'background.paper',
        overflow: 'auto',
        px: 6,
        pt: 4,
        boxShadow: '1px 1px 2px 1px rgba(0, 0, 0, 0.15)',
      }}
    >
      {loading && (
        <>
          <SSkeleton height={25} />
          <SSkeleton height={25} />
          <SSkeleton height={25} />
          <SSkeleton height={25} />
        </>
      )}
      {!loading &&
        options.map((option, index) => (
          <SText
            fontSize={14}
            key={index}
            onClick={() => setActive(option)}
            sx={{
              cursor: 'pointer',
              px: 4,
              py: 1,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'grey.200',
              },
              '&:active': {
                backgroundColor: 'grey.300',
              },
              ...(active == option && {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }),
            }}
          >
            {getOptionLabel(option)}
          </SText>
        ))}
    </SFlex>
  );
}
