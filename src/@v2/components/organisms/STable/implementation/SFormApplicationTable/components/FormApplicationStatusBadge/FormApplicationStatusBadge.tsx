import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';

import { FormApplicationStatusMap } from '../../maps/form-application-status-map';

type Props = {
  status: FormApplicationStatusEnum;
  compact?: boolean;
};

export function FormApplicationStatusBadge({
  status,
  compact = false,
}: Props) {
  const config = FormApplicationStatusMap[status];

  return (
    <SFlex
      align="center"
      justify="center"
      px={compact ? 3 : 4}
      py={compact ? 0.5 : 1}
      width="fit-content"
      maxWidth="100%"
      sx={{
        borderRadius: '5px',
        borderColor: config.schema.borderColor,
        backgroundColor: config.schema.backgroundColor,
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
    >
      <SText
        color={config.schema.color}
        fontSize={compact ? 10 : 12}
        lineNumber={1}
        fontWeight={600}
      >
        {config.label}
      </SText>
    </SFlex>
  );
}
