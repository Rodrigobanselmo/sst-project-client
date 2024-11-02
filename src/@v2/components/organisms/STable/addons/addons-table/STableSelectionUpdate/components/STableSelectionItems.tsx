import { SIconClose } from '@v2/assets/icons/SIconClose/SIconClose';
import { SButton } from '@v2/components/atoms/SButton/SButton';

export interface STableSelectionItemsProps {
  onClick?: () => void;
  selectedNumber?: number;
}

export const STableSelectionItems = ({
  onClick,
  selectedNumber,
}: STableSelectionItemsProps) => {
  return (
    <SButton
      onClick={onClick}
      text={`${selectedNumber} itens selecionados`}
      rightIcon={() => <SIconClose fontSize={16} color="text.main" />}
      color="normal"
    />
  );
};
