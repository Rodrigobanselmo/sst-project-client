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
  contextName,
  subtitle,
  onBack,
}) => {
  const router = useRouter();
  const trimmedContext = contextName?.trim();
  const trimmedSubtitle = trimmedContext ? undefined : subtitle?.trim();
  return (
    <Box
      mb={mb}
      mt={0}
      sx={
        trimmedContext
          ? { flex: '1 1 16rem', minWidth: 0, maxWidth: '100%' }
          : undefined
      }
    >
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
        <Box pl={1} minWidth={0} flex={1}>
          <SText
            fontSize={['1.3rem', '1.3rem', '1.563rem']}
            variant={'h4'}
            color={'text.main'}
            fontWeight={600}
            sx={{
              lineHeight: 1.3,
              whiteSpace: 'normal',
              overflowWrap: 'break-word',
            }}
          >
            {title}
            {trimmedContext ? (
              <>
                {': '}
                <Box
                  component="span"
                  sx={{ fontWeight: 400, fontSize: 'inherit' }}
                >
                  {trimmedContext}
                </Box>
              </>
            ) : null}
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
