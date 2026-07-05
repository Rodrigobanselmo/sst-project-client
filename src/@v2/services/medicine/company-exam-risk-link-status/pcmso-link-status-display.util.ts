import { PcmsoLinkStatusEnum } from './company-exam-risk-link-status.types';
import type { ITagActionColors } from 'components/atoms/STag/types';

export const pcmsoLinkStatusLabels: Record<PcmsoLinkStatusEnum, string> = {
  [PcmsoLinkStatusEnum.OK]: 'OK',
  [PcmsoLinkStatusEnum.ADJUSTMENT_RECOMMENDED]: 'Ajuste recomendado',
  [PcmsoLinkStatusEnum.RISK_NOT_CHARACTERIZED]: 'Risco não caracterizado',
  [PcmsoLinkStatusEnum.NO_LIBRARY_REFERENCE]: 'Sem referência',
};

export const pcmsoLinkStatusColors: Record<
  PcmsoLinkStatusEnum,
  ITagActionColors
> = {
  [PcmsoLinkStatusEnum.OK]: 'success',
  [PcmsoLinkStatusEnum.ADJUSTMENT_RECOMMENDED]: 'warning',
  [PcmsoLinkStatusEnum.RISK_NOT_CHARACTERIZED]: 'error',
  [PcmsoLinkStatusEnum.NO_LIBRARY_REFERENCE]: 'info',
};

export const isPcmsoPendingStatus = (status?: PcmsoLinkStatusEnum) =>
  status === PcmsoLinkStatusEnum.ADJUSTMENT_RECOMMENDED ||
  status === PcmsoLinkStatusEnum.RISK_NOT_CHARACTERIZED;
