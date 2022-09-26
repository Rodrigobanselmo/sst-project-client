import { ReactNode } from 'react';

import { Box, BoxProps, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import {
  initialInputModalState,
  TypeInputModal,
} from 'components/organisms/modals/ModalSingleInput';

import AddIcon from 'assets/icons/SAddIcon';
import SArrowNextIcon from 'assets/icons/SArrowNextIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';
import { SEditIcon } from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';

import { useAddEntities } from './hooks/useAddEntities';

function swapElement(array: any[], indexA: number, indexB: number) {
  const copy = [...array];
  if (!copy[indexA] || !copy[indexB]) return array;

  const tmp = copy[indexA];
  copy[indexA] = copy[indexB];
  copy[indexB] = tmp;

  return copy;
}

function editElement(
  value: string,
  array: any[],
  index: number,
  valueField?: string,
) {
  const copy = [...array];
  if (!copy[index]) return array;

  if (typeof copy[index] === 'string') {
    copy[index] = value;
  }

  if (typeof copy[index] === 'object' && valueField) {
    copy[index][valueField] = value;
  }

  return copy;
}

interface ISDisplaySimpleArrayProps {
  values: any[];
  label?: string;
  onAdd: (value: string, data?: any) => void;
  onDelete: (value: string, data?: any) => void;
  onEdit?: (value: string, values: any[], data?: any) => void;
  renderText?: (data?: any) => ReactNode;
  disabled?: boolean;
  buttonLabel?: string;
  modalLabel?: string;
  placeholder?: string;
  type?: TypeInputModal;
  valueField?: string;
  paragraphSelect?: boolean;
  onRenderStartElement?: (value: any | string) => JSX.Element;
  onRenderEndElement?: (value: any | string) => JSX.Element;
  onRenderAddButton?: (
    onAdd: (value: string, data?: any) => void,
    values: any[],
    props: { disabled?: boolean; text?: string },
  ) => JSX.Element;
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
  onRenderEndElement,
  onEdit,
  renderText,
  onRenderAddButton,
  ...props
}: ISDisplaySimpleArrayProps & Partial<BoxProps>) {
  const { onStackOpenModal } = useModal();
  const { onSelectProfessionalUser } = useAddEntities({ onAdd, values });

  return (
    <Box
      {...props}
      sx={{
        border: '2px solid',
        borderColor: 'background.divider',
        p: 5,
        borderRadius: 1,
        backgroundColor: 'background.paper',
        ...props?.sx,
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

          const displayText = renderText ? renderText(v) : value;

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
              {typeof displayText === 'string' ? (
                <SText ml={5} fontSize={14} mr={'auto'} color={'grey.600'}>
                  {displayText}
                </SText>
              ) : (
                displayText
              )}
              <SFlex gap={2} flexWrap="wrap" center>
                {onEdit && (
                  <STooltip placement="left" withWrapper title="subir posição">
                    <SIconButton
                      disabled={disabled}
                      onClick={() =>
                        onEdit(value, swapElement(values, index, index - 1), v)
                      }
                      size="small"
                    >
                      <Icon
                        component={SArrowNextIcon}
                        sx={{ fontSize: '1rem', transform: 'rotate(-90deg)' }}
                      />
                    </SIconButton>
                  </STooltip>
                )}

                {onEdit && (
                  <STooltip placement="left" withWrapper title="descer posição">
                    <SIconButton
                      disabled={disabled}
                      onClick={() =>
                        onEdit(value, swapElement(values, index, index + 1), v)
                      }
                      size="small"
                    >
                      <Icon
                        component={SArrowNextIcon}
                        sx={{ fontSize: '1rem', transform: 'rotate(90deg)' }}
                      />
                    </SIconButton>
                  </STooltip>
                )}

                <STooltip withWrapper title="remover" placement="left">
                  <SIconButton
                    disabled={disabled}
                    onClick={() => onDelete(value, v)}
                    size="small"
                  >
                    <Icon component={SDeleteIcon} sx={{ fontSize: '1.2rem' }} />
                  </SIconButton>
                </STooltip>

                {onEdit && (
                  <STooltip withWrapper title="editar" placement="left">
                    <SIconButton
                      disabled={disabled}
                      size="small"
                      onClick={() => {
                        onStackOpenModal(ModalEnum.SINGLE_INPUT, {
                          onConfirm: (newValue: string) => {
                            onEdit?.(
                              newValue,
                              editElement(newValue, values, index, valueField),
                              v,
                            );
                          },
                          placeholder,
                          label: modalLabel,
                          type,
                          name: value,
                        } as typeof initialInputModalState);
                      }}
                    >
                      <Icon component={SEditIcon} sx={{ fontSize: '1.2rem' }} />
                    </SIconButton>
                  </STooltip>
                )}
                {onRenderEndElement && onRenderEndElement(v)}
              </SFlex>
            </SFlex>
          );
        })}
        {!onRenderAddButton && (
          <STagButton
            large
            disabled={disabled}
            icon={AddIcon}
            text={buttonLabel || 'Adicionar'}
            iconProps={{ sx: { fontSize: 17 } }}
            onClick={() => {
              if (type === TypeInputModal.PROFESSIONAL) {
                return onSelectProfessionalUser();
              }
              // if (type === TypeInputModal.COUNCIL) {
              //   return onSelectProfessionalUser();
              // }

              onStackOpenModal(ModalEnum.SINGLE_INPUT, {
                onConfirm: onAdd,
                placeholder,
                label: modalLabel,
                type,
              } as typeof initialInputModalState);
            }}
          />
        )}
        {onRenderAddButton &&
          onRenderAddButton(onAdd, values, { disabled, text: buttonLabel })}
      </SFlex>
    </Box>
  );
}
