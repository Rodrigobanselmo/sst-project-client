import { PcmsoLinkStatusEnum } from './company-exam-risk-link-status.types';
import type { ITagActionColors } from 'components/atoms/STag/types';

export const pcmsoLinkStatusLabels: Record<PcmsoLinkStatusEnum, string> = {
  [PcmsoLinkStatusEnum.OK]: 'OK',
  [PcmsoLinkStatusEnum.ADJUSTMENT_RECOMMENDED]: 'Ajuste recomendado',
  [PcmsoLinkStatusEnum.RISK_NOT_CHARACTERIZED]: 'Risco fora da caracterização',
  [PcmsoLinkStatusEnum.NO_LIBRARY_REFERENCE]: 'Sem regra na Biblioteca',
};

export const pcmsoLinkStatusTooltips: Partial<
  Record<PcmsoLinkStatusEnum, string>
> = {
  [PcmsoLinkStatusEnum.RISK_NOT_CHARACTERIZED]:
    'Este vínculo usa um risco que não consta na caracterização atual da empresa/workspace.',
  [PcmsoLinkStatusEnum.NO_LIBRARY_REFERENCE]:
    'Risco caracterizado, mas sem regra ACTIVE correspondente na Biblioteca Risco × Exame.',
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

export const formatPcmsoSummaryRiskNotCharacterized = (count: number) =>
  `${count} fora da caracterização`;

export const formatPcmsoSummaryNoLibraryReference = (count: number) =>
  `${count} sem regra na Biblioteca`;

export const isPcmsoPendingStatus = (status?: PcmsoLinkStatusEnum) =>
  status === PcmsoLinkStatusEnum.ADJUSTMENT_RECOMMENDED ||
  status === PcmsoLinkStatusEnum.RISK_NOT_CHARACTERIZED;

export const resolvePcmsoLinkStatusTooltip = (
  status: PcmsoLinkStatusEnum,
  message?: string,
) => pcmsoLinkStatusTooltips[status] ?? message;
