import React, { FC } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { useRouter } from 'next/router';

import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { IRiskData } from 'core/interfaces/api/IRiskData';

import { GseEffectiveOriginActionButtons } from './GseEffectiveOriginActionButtons';
import {
  getGseEffectiveOriginReturnTo,
  resolveGseEffectiveOriginAction,
} from './open-gse-effective-origin.util';

export const GseInheritedOriginGroupHeader: FC<{
  originTypeLabel: string;
  originName: string;
  sample?: IRiskData;
  isFirst?: boolean;
}> = ({ originTypeLabel, originName, sample, isFirst = false }) => {
  const router = useRouter();
  const { onStackOpenModal } = useModal();
  const { companyId } = useGetCompanyId();
  const selectedGhoId = useAppSelector((state) => state.gho.selected?.id);
  const returnTo = getGseEffectiveOriginReturnTo({
    query: router.query,
    selectedGhoId,
  });
  const originAction = resolveGseEffectiveOriginAction({
    openOrigin: sample?.openOrigin,
    companyId,
    returnTo,
  });

  const onOpenOrigin = () => {
    if (!originAction) return;
    if (originAction.type === 'characterization') {
      void router.push(originAction.href);
      return;
    }
    onStackOpenModal(originAction.modal, originAction.payload);
  };

  return (
    <Box
      sx={{
        px: 1,
        pt: isFirst ? 1 : 3,
        pb: 1.5,
        mb: 2,
        borderBottom: '1px solid',
        borderColor: 'grey.300',
      }}
    >
      <SFlex
        align="flex-end"
        justify="space-between"
        gap={2}
        flexWrap="wrap"
      >
        <Box sx={{ minWidth: 0 }}>
          {!!originTypeLabel && (
            <SText
              fontSize={11}
              color="text.secondary"
              fontWeight={700}
              sx={{
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                mb: 0.5,
              }}
            >
              {originTypeLabel}
            </SText>
          )}
          <SText fontSize={15} fontWeight={600} sx={{ wordBreak: 'break-word' }}>
            {originName || 'Origem sem nome'}
          </SText>
        </Box>
        <GseEffectiveOriginActionButtons
          onOpenOrigin={originAction ? onOpenOrigin : undefined}
        />
      </SFlex>
    </Box>
  );
};
