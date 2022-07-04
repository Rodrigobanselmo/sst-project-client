import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import {
  initialInputModalState,
  TypeInputModal,
} from 'components/organisms/modals/ModalSingleInput';

import AddIcon from 'assets/icons/SAddIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

interface ISDisplaySimpleArrayProps {
  values: string[];
  label?: string;
  onAdd: (value: string) => void;
  onDelete: (value: string) => void;
  disabled?: boolean;
  buttonLabel?: string;
  modalLabel?: string;
  placeholder?: string;
  type?: TypeInputModal;
}

export const SDisplaySimpleArray = ({
  values,
  onAdd,
  label,
  onDelete,
  disabled,
  placeholder,
  modalLabel,
  buttonLabel,
  type = TypeInputModal.TEXT,
}: ISDisplaySimpleArrayProps) => {
  const { onOpenModal } = useModal();
  return (
    <Box
      sx={{
        border: '2px solid',
        borderColor: 'background.divider',
        p: 5,
        borderRadius: 1,
      }}
    >
      {label && (
        <SText color={'grey.500'} mb={3} fontSize={14}>
          {label}
        </SText>
      )}

      <SFlex direction="column">
        {removeDuplicate(values).map((value) => (
          <SFlex
            sx={{ backgroundColor: 'background.paper', borderRadius: '4px' }}
            my={2}
            key={value}
            align="center"
          >
            <SIconButton
              disabled={disabled}
              onClick={() => onDelete(value)}
              size="small"
            >
              <Icon component={SDeleteIcon} sx={{ fontSize: '1.2rem' }} />
            </SIconButton>
            <SText>{value}</SText>
          </SFlex>
        ))}
        <STagButton
          large
          disabled={disabled}
          icon={AddIcon}
          text={buttonLabel || 'Adicionar'}
          iconProps={{ sx: { fontSize: 17 } }}
          onClick={() => {
            onOpenModal(ModalEnum.SINGLE_INPUT, {
              onConfirm: onAdd,
              placeholder,
              label: modalLabel,
              type,
            } as typeof initialInputModalState);
          }}
        />
      </SFlex>
    </Box>
  );
};
