import { FC } from 'react';

import { Box } from '@mui/material';
import { SIconArrowBack } from '@v2/assets/icons/SIconArrowBack/SIconArrowBack';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SText } from '@v2/components/atoms/SText/SText';
import { useRouter } from 'next/router';
import { SPageHeaderProps } from './types';

export const SPageHeader: FC<SPageHeaderProps> = ({ mb = 12, title }) => {
  const router = useRouter();
  return (
    <Box mb={mb} mt={0}>
      <SFlex align="center">
        <SIconButton onClick={() => router.back()}>
          <SIconArrowBack
            color={'text.main'}
            fontSize={'22px'}
            variant={'line'}
          />
        </SIconButton>
        <SText
          fontSize={['1.3rem', '1.3rem', '1.563rem']}
          variant={'h4'}
          color={'text.main'}
          pl={1}
          fontWeight={600}
        >
          {title}
        </SText>
      </SFlex>
    </Box>
  );
};
