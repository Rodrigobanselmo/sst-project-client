import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { initialUsersSelectState } from 'components/organisms/modals/ModalSelectUsers';
import {
  initialInputModalState,
  TypeInputModal,
} from 'components/organisms/modals/ModalSingleInput';

import AddIcon from 'assets/icons/SAddIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IUser } from 'core/interfaces/api/IUser';

interface ISDisplaySimpleArrayProps {
  values: any[];
  label?: string;
  onAdd: (value: string, data?: IUser) => void;
  onDelete: (value: string, data?: IUser) => void;
  disabled?: boolean;
  buttonLabel?: string;
  modalLabel?: string;
  placeholder?: string;
  type?: TypeInputModal;
  valueField?: string;
  paragraphSelect?: boolean;
  onRenderStartElement?: (value: object | string) => JSX.Element;
}

export function SDisplaySimpleArray({
  values,
  onAdd,
  label,
  onDelete,
  disabled,
  placeholder,
  modalLabel,
  buttonLabel,
  type = TypeInputModal.TEXT,
  valueField,
  onRenderStartElement,
}: ISDisplaySimpleArrayProps) {
  const { onStackOpenModal } = useModal();
  return (
    <Box
      sx={{
        border: '2px solid',
        borderColor: 'background.divider',
        p: 5,
        borderRadius: 1,
        backgroundColor: 'background.paper',
      }}
    >
      {label && (
        <SText color={'grey.500'} mb={3} fontSize={14}>
          {label}
        </SText>
      )}

      <SFlex direction="column">
        {values.map((v, index) => {
          let value = '';
          if (typeof v === 'string') {
            value = v;
          }

          if (!value && valueField) {
            value = v[valueField];
          }

          return (
            <SFlex
              sx={{
                border: '1px solid',
                borderRadius: '4px 4px 4px 4px',
                borderColor: 'grey.300',
                backgroundColor: 'background.box',
              }}
              my={2}
              key={value + index}
              align="center"
            >
              {onRenderStartElement && onRenderStartElement(v)}
              <SText ml={5} fontSize={14} mr={'auto'} color={'grey.600'}>
                {value}
              </SText>
              <STooltip withWrapper title="remover">
                <SIconButton
                  disabled={disabled}
                  onClick={() => onDelete(value)}
                  size="small"
                  sx={{ mr: 3 }}
                >
                  <Icon component={SDeleteIcon} sx={{ fontSize: '1.2rem' }} />
                </SIconButton>
              </STooltip>
            </SFlex>
          );
        })}
        <STagButton
          large
          disabled={disabled}
          icon={AddIcon}
          text={buttonLabel || 'Adicionar'}
          iconProps={{ sx: { fontSize: 17 } }}
          onClick={() => {
            if (type === TypeInputModal.PROFESSIONAL) {
              return onStackOpenModal(ModalEnum.PROFESSIONAL_SELECT, {
                title:
                  'Selecione os profissionais responsavel pela elaboração do documento',
                onSelect: (user: IUser | IUser) => {
                  if (Array.isArray(user)) {
                    user.forEach((user) =>
                      onAdd(`${user.name} - ${user?.cpf || ''}`, user),
                    );
                    return;
                  }

                  onAdd(`${user.name} - ${user?.cpf || ''}`, user);
                },
                multiple: true,
              } as typeof initialUsersSelectState);
            }
            onStackOpenModal(ModalEnum.SINGLE_INPUT, {
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
}
