import { FC } from 'react';

import STooltip from 'components/atoms/STooltip';
import { STag } from 'components/atoms/STag';

import {
  pcmsoLinkStatusColors,
  pcmsoLinkStatusLabels,
} from '@v2/services/medicine/company-exam-risk-link-status/pcmso-link-status-display.util';
import { PcmsoLinkStatusEnum } from '@v2/services/medicine/company-exam-risk-link-status/company-exam-risk-link-status.types';

type Props = {
  status?: PcmsoLinkStatusEnum;
  message?: string;
  loading?: boolean;
};

export const PcmsoLinkStatusChip: FC<Props> = ({
  status,
  message,
  loading,
}) => {
  if (loading) {
    return <STag text="..." action="info" />;
  }

  if (!status) {
    return <STag text="—" />;
  }

  const chip = (
    <STag
      text={pcmsoLinkStatusLabels[status]}
      action={pcmsoLinkStatusColors[status]}
    />
  );

  if (!message) return chip;

  return (
    <STooltip title={message} minLength={0} withWrapper placement="top">
      {chip}
    </STooltip>
  );
};
