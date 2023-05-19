import React, { FC, useMemo, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { getStates } from '@brazilian-utils/brazilian-utils';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { InputForm } from 'components/molecules/form/input';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { councilSchema } from 'core/utils/schemas/council.schema';

interface IForm {
  councilUF: string;
  councilType: string;
}

export const initialCouncilModalState = {
  title: '',
  councilId: '',
  councilUF: '',
  councilType: '',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onConfirm: async (value: any) => {},
};

const modalName = ModalEnum.COUNCIL;

export const ModalAddCouncil: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();

  const { handleSubmit, setValue, control, reset } = useForm<IForm>({
    resolver: yupResolver(councilSchema),
  });

  const [data, setData] = useState({
    ...initialCouncilModalState,
  });

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialCouncilModalState>>(modalName);

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
      setData((oldData) => ({
        ...oldData,
        ...initialData,
      }));
    }
  }, [getModalData]);

  const onClose = () => {
    onCloseModal(modalName);
    setData(initialCouncilModalState);
    reset();
  };

  const onSubmit: SubmitHandler<IForm> = async (formData) => {
    data.onConfirm && (await data.onConfirm(formData));
    onClose();
  };

  const ufs = useMemo(() => {
    return getStates().map((state) => state.code);
  }, []);

  const buttons = [
    {},
    {
      text: 'Confirmar',
      variant: 'contained',
      type: 'submit',
      onClick: () => {},
    },
  ] as IModalButton[];

  return (
    <SModal {...registerModal(modalName)} keepMounted={false} onClose={onClose}>
      <SModalPaper
        onSubmit={(handleSubmit as any)(onSubmit)}
        component="form"
        center
        p={8}
        width={'fit-content'}
        minWidth={600}
      >
        <SModalHeader onClose={onClose} title={data.title || 'Adicionar'} />
        <SFlex mt={5} flexWrap="wrap" gap={5}>
          <Box flex={5}>
            <AutocompleteForm
              name="councilType"
              control={control}
              freeSolo
              getOptionLabel={(option) => String(option)}
              inputProps={{
                labelPosition: 'top',
                placeholder: 'Exemplo: CREA, CRM',
                name: 'councilType',
              }}
              setValue={(v) => setValue('councilType', v)}
              defaultValue={data.councilType || ''}
              sx={{ minWidth: [250] }}
              label="Conselho"
              options={['CRM', 'CREA', 'COREM', 'CRO', 'RMS']}
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
              control={control}
              placeholder={'estado...'}
              defaultValue={data.councilUF || ''}
              setValue={(v) => setValue('councilUF', v)}
              label="UF"
              sx={{ minWidth: [100] }}
              options={ufs}
              onChange={(e: typeof ufs[0]) =>
                setData((old) => ({
                  ...old,
                  councilUF: e,
                }))
              }
            />
          </Box>
          <Box flex={1}>
            <InputForm
              defaultValue={data.councilId}
              label="Identificação"
              labelPosition="top"
              sx={{ minWidth: [350] }}
              control={control}
              placeholder={'identificação...'}
              name="councilId"
              size="small"
            />
          </Box>
        </SFlex>
        <SModalButtons onClose={onClose} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
