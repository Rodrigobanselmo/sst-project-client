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
  ...props
}: BoxProps & {
  data?: IProfessionalCouncil[];
  disabled?: boolean;
  initialValues?: Partial<typeof initialCouncilModalState>;
  onAdd?: (value: Partial<IProfessionalCouncil>) => void;
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

  console.log(props?.data);
  return (
    <Box>
      {props?.data
        ?.filter((i) => i)
        .map((userData, index) => {
          return (
            <SFlex
              key={userData?.councilId + userData?.councilType}
              mt={5}
              flexWrap="wrap"
              gap={5}
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
                  disabled={true}
                  sx={{ minWidth: [250] }}
                  control={control}
                  placeholder={'identificação...'}
                  name={index + 'councilId'}
                  size="small"
                  endAdornment={
                    <SIconButton
                      tooltip="deletar"
                      onClick={() => onDelete?.(userData)}
                      disabled={disabled}
                    >
                      <Icon
                        component={SDeleteIcon}
                        sx={{ fontSize: '1.2rem' }}
                      />
                    </SIconButton>
                  }
                />
              </Box>
            </SFlex>
          );
        })}

      {props?.data?.length === 0 && (
        <SFlex mt={5} flexWrap="wrap" gap={5} onClick={() => onOpenModal()}>
          <Box flex={5}>
            <AutocompleteForm
              name="councilType"
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
              options={['CRM', 'CREA', 'COREM']}
            />
          </Box>
          <Box flex={1}>
            <AutocompleteForm
              name="councilUF"
              inputProps={{
                labelPosition: 'top',
                placeholder: '__',
                name: 'councilUF',
              }}
              freeSolo
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
              disabled={true}
              sx={{ minWidth: [250] }}
              control={control}
              placeholder={'identificação...'}
              name="councilId"
              size="small"
            />
          </Box>
        </SFlex>
      )}

      {props?.data && props?.data?.length > 0 && (
        <STagButton
          sx={{ mt: 3 }}
          tooltipTitle="Rotacionar sentido horário"
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
