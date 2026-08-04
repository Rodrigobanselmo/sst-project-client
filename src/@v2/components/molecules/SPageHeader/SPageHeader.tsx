import { FC } from 'react';

import { Box } from '@mui/material';
import { SIconArrowBack } from '@v2/assets/icons/SIconArrowBack/SIconArrowBack';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SText } from '@v2/components/atoms/SText/SText';
import { useRouter } from 'next/router';
import { SPageHeaderProps } from './types';

export const SPageHeader: FC<SPageHeaderProps> = ({
  mb = 12,
  title,
  subtitle,
  onBack,
}) => {
  const router = useRouter();
  const trimmedSubtitle = subtitle?.trim();
  return (
    <Box mb={mb} mt={0}>
      <SFlex align="flex-start">
        <Box sx={{ mt: trimmedSubtitle ? '2px' : 0 }}>
          <SIconButton onClick={onBack ?? (() => router.back())}>
            <SIconArrowBack
              color={'text.main'}
              fontSize={'22px'}
              variant={'line'}
            />
          </SIconButton>
        </Box>
        <Box pl={1} minWidth={0}>
          <SText
            fontSize={['1.3rem', '1.3rem', '1.563rem']}
            variant={'h4'}
            color={'text.main'}
            fontWeight={600}
          >
            {title}
          </SText>
          {trimmedSubtitle ? (
            <SText
              fontSize={13}
              color="text.secondary"
              fontWeight={500}
              sx={{
                mt: 0.25,
                lineHeight: 1.35,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: { xs: '70vw', sm: '52vw', md: 520 },
              }}
              title={trimmedSubtitle}
            >
              {trimmedSubtitle}
            </SText>
          ) : null}
        </Box>
      </SFlex>
    </Box>
  );
};
