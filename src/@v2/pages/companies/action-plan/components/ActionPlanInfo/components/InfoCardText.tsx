import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';

const schemaMap = {
  error: {
    color: 'error.dark',
    colorLabel: 'text.label',
  },
  normal: {
    color: 'text.main',
    colorLabel: 'text.label',
  },
};

export const InfoCardText = ({
  label,
  text,
  minWidth = 200,
  schema = 'normal',
}: {
  label: string;
  text: string;
  minWidth?: string | number;
  schema?: 'error' | 'normal';
}) => {
  return (
    <SFlex direction="column" gap={0} flex={1} minWidth={minWidth}>
      <SText ft={12} color={schemaMap[schema].colorLabel} mb={2}>
        {label}
      </SText>
      <SText color={schemaMap[schema].color}>{text}</SText>
    </SFlex>
  );
};
