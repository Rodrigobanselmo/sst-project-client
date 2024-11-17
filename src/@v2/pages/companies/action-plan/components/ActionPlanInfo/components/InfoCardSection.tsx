import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';

export const InfoCardSection = ({
  children,
  numColumns,
  gridColumns = 'repeat(auto-fit, minmax(150px, 1fr))',
}: {
  children: React.ReactNode;
  numColumns?: number;
  gridColumns?: string | (string | undefined)[];
}) => {
  if (numColumns === 4) {
    gridColumns = [
      'repeat(2, minmax(150px, 1fr))',
      undefined,
      undefined,
      'repeat(4, minmax(150px, 1fr))',
    ];
  }

  if (numColumns === 5) {
    gridColumns = [
      'repeat(2, minmax(150px, 1fr))',
      undefined,
      undefined,
      'repeat(5, minmax(150px, 1fr))',
    ];
  }

  return (
    <SFlex
      gap={4}
      align={'center'}
      sx={{ px: '16px' }}
      height={'65px'}
      flexWrap={'wrap'}
      display="grid"
      gridTemplateColumns={gridColumns}
    >
      {children}
    </SFlex>
  );
};
