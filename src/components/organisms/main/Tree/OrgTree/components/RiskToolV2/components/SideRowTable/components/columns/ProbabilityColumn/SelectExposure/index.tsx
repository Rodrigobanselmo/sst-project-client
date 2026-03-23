import { FC, useRef } from 'react';

import SText from 'components/atoms/SText';

import { STagButton } from 'components/atoms/STagButton';
import { SPopperArrow } from 'components/molecules/SPopperArrow';
import { ExposureTypeArray, ExposureTypeMap } from 'core/enums/exposure.enum';
import { useDisclosure } from 'core/hooks/useDisclosure';
import { StackStyled } from './styles';
import { ISelectExposureProps } from './types';

export const SelectExposure: FC<ISelectExposureProps> = ({
  exposure,
  onSelect,
}) => {
  const anchorEl = useRef<null | HTMLDivElement>(null);
  const { isOpen, toggle, close } = useDisclosure();

  return (
    <>
      <STagButton
        ref={anchorEl}
        active={!!exposure}
        onClick={toggle}
        text={exposure ? ExposureTypeMap[exposure].name : 'Exposição'}
        mt={4}
        textProps={{ sx: { color: 'text.main' } }}
        borderActive={
          exposure ? ExposureTypeMap[exposure].colorSchema : undefined
        }
        bg={exposure ? 'grey.100' : undefined}
      />
      <SPopperArrow
        anchorEl={anchorEl}
        isOpen={isOpen}
        close={close}
        color="paper"
        sx={{
          transform: 'translateY(15px)',
          width: '15rem',
          px: 0,
          py: 2,
          color: 'text.main',
        }}
      >
        {ExposureTypeArray.map(({ label, value }) => {
          return (
            <StackStyled
              key={label}
              px={5}
              py={2}
              direction="row"
              spacing={3}
              onClick={() => {
                onSelect(value);
                close();
              }}
            >
              <SText fontSize={14}>{label}</SText>
            </StackStyled>
          );
        })}
      </SPopperArrow>
    </>
  );
};
