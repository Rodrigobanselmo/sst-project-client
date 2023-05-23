import React from 'react';
import {
  Control,
  FieldValues,
  useForm,
  UseFormSetValue,
} from 'react-hook-form';

import { Box, BoxProps, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { InputForm } from 'components/molecules/form/input';
import { initialCouncilModalState } from 'components/organisms/modals/ModalAddCouncil';

import { SAddIcon } from 'assets/icons/SAddIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IProfessionalCouncil } from 'core/interfaces/api/IProfessional';

export const CouncilShow = ({
  onAdd,
  onDelete,
  disabled,
  initialValues,
  control: control2,
  setValue: setValue2,
  loading,
  onEdit,
  ...props
}: BoxProps & {
  data?: IProfessionalCouncil[];
  disabled?: boolean;
  loading?: boolean;
  initialValues?: Partial<typeof initialCouncilModalState>;
  onAdd?: (value: Partial<IProfessionalCouncil>) => void;
  onEdit?: (value: Partial<IProfessionalCouncil>, index: number) => void;
  control?: Control<FieldValues, object>;
  setValue?: UseFormSetValue<FieldValues>;
  onDelete?: (value: Partial<IProfessionalCouncil>) => void;
}) => {
  const { setValue: setValue1, control: control1 } = useForm();
  const { onStackOpenModal } = useModal();

  const setValue = setValue2 || setValue1;
  const control = control2 || control1;

  const onOpenModal = (value?: Partial<IProfessionalCouncil>) => {
    if (disabled) return;

    onStackOpenModal(ModalEnum.COUNCIL, {
      onConfirm: onAdd,
      ...initialValues,
      ...value,
    } as typeof initialCouncilModalState);
  };

  const onEditOpenModal = (
    value: Partial<IProfessionalCouncil>,
    index: number,
  ) => {
    if (disabled) return;

    onStackOpenModal(ModalEnum.COUNCIL, {
      onConfirm: (v) => onEdit?.(v, index),
      ...initialValues,
      ...value,
    } as typeof initialCouncilModalState);
  };

  const councils = props?.data?.filter(
    (v) => v && v.councilId && v.councilType && v.councilUF,
  );

  return (
    <Box>
      {councils?.map((userData, index) => {
        return (
          <SFlex
            key={
              userData?.councilId + userData?.councilType + userData?.councilUF
            }
            mt={5}
            flexWrap="wrap"
            gap={5}
            onClick={() => onEditOpenModal(userData, index)}
          >
            <Box flex={3}>
              <AutocompleteForm
                name={index + 'councilType'}
                control={control}
                freeSolo
                disabled={true}
                getOptionLabel={(option) => String(option)}
                inputProps={{
                  labelPosition: 'top',
                  placeholder: 'Exemplo: CREA, CRM',
                  name: index + 'councilType',
                }}
                setValue={(v) => setValue(index + 'councilType', v)}
                defaultValue={userData?.councilType || ''}
                sx={{ minWidth: [200] }}
                label={index ? '' : 'Conselho'}
                options={['CRM', 'CREA', 'COREM']}
              />
            </Box>
            <Box flex={1}>
              <AutocompleteForm
                name={index + 'councilUF'}
                inputProps={{
                  labelPosition: 'top',
                  placeholder: '__',
                  name: index + 'councilUF',
                }}
                freeSolo
                disabled={true}
                control={control}
                placeholder={'estado...'}
                defaultValue={userData?.councilUF}
                setValue={(v) => setValue(index + 'councilUF', v)}
                label={index ? '' : 'UF'}
                sx={{ minWidth: [100] }}
                options={[]}
              />
            </Box>
            <Box flex={4}>
              <InputForm
                defaultValue={userData?.councilId}
                label={index ? '' : 'Identificação'}
                labelPosition="top"
                setValue={setValue}
                disabled={true}
                sx={{ minWidth: [250] }}
                control={control}
                placeholder={'identificação...'}
                name={index + 'councilId'}
                size="small"
                endAdornment={
                  <SIconButton
                    loading={loading}
                    tooltip="deletar"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(userData);
                    }}
                    disabled={disabled}
                  >
                    <Icon component={SDeleteIcon} sx={{ fontSize: '1.2rem' }} />
                  </SIconButton>
                }
              />
            </Box>
          </SFlex>
        );
      })}

      {councils?.length === 0 && (
        <SFlex mt={5} flexWrap="wrap" gap={5} onClick={() => onOpenModal()}>
          <Box flex={5}>
            <AutocompleteForm
              name="councilType"
              onClick={() => onOpenModal()}
              control={control}
              freeSolo
              disabled={true}
              getOptionLabel={(option) => String(option)}
              inputProps={{
                labelPosition: 'top',
                placeholder: 'Exemplo: CREA, CRM',
                name: 'councilType',
              }}
              setValue={(v) => setValue('councilType', v)}
              sx={{ minWidth: [200] }}
              label="Conselho"
              options={['CRM', 'CREA', 'COREM', 'CRO', 'RMS']}
            />
          </Box>
          <Box flex={1}>
            <AutocompleteForm
              name="councilUF"
              onClick={() => onOpenModal()}
              inputProps={{
                labelPosition: 'top',
                placeholder: '__',
                name: 'councilUF',
              }}
              freeSolo
              setValue={(v) => setValue('councilUF', v)}
              disabled={true}
              control={control}
              placeholder={'estado...'}
              label="UF"
              sx={{ minWidth: [100] }}
              options={[]}
            />
          </Box>
          <Box flex={1}>
            <InputForm
              label="Identificação"
              labelPosition="top"
              onClick={() => onOpenModal()}
              disabled={true}
              sx={{ minWidth: [250] }}
              control={control}
              placeholder={'identificação...'}
              name="councilId"
              size="small"
              setValue={setValue}
            />
          </Box>
        </SFlex>
      )}

      {councils && councils?.length > 0 && (
        <STagButton
          sx={{ mt: 3 }}
          tooltipTitle=""
          disabled={disabled}
          icon={SAddIcon}
          text="Adicionar Conselho"
          iconProps={{ sx: { fontSize: 17 } }}
          onClick={() => onOpenModal()}
        />
      )}
    </Box>
  );
};
