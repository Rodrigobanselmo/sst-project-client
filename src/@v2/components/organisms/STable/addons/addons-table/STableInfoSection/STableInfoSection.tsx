import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { STableInfoSectionProps } from './STableInfoSection.types';

export function STableInfoSection({
  children,
  ...props
}: STableInfoSectionProps) {
  return (
    <SFlex flexDirection="column" gap={4} {...props}>
      {children}
    </SFlex>
  );
}
