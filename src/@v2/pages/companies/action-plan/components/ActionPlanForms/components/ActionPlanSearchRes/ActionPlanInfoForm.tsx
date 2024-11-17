import { useRouter } from 'next/router';

import { Box } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SText } from '@v2/components/atoms/SText/SText';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { SModalButtons } from '@v2/components/organisms/SModal/components/SModalButtons/SModalButtons';
import { SModalHeader } from '@v2/components/organisms/SModal/components/SModalHeader/SModalHeader';
import { SModalPaper } from '@v2/components/organisms/SModal/components/SModalPaper/SModalPaper';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { SDatePicker } from '@v2/components/forms/fields/SDatePicker/SDatePicker';
import { CForm } from '@v2/components/forms/providers/SFormProvide';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import {
  actionPlanInfoFormInitialValues,
  schemaActionPlanInfoForm,
} from './ActionPlanInfoForm.schema';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';

export const ActionPlanInfoForm = () => {
  const router = useRouter();
  const { closeModal } = useModal();

  const form = useForm({
    resolver: yupResolver(schemaActionPlanInfoForm),
    defaultValues: actionPlanInfoFormInitialValues,
  });

  return (
    <SModalPaper>
      <SModalHeader
        title="Editar Plano de Ação"
        onClose={() => closeModal(ModalKeyEnum.EDIT_ACTION_PLAN_INFO)}
      />
      <CForm form={form}>
        <SSearchSelectForm
          name="searchSelect"
          loading={true}
          getOptionValue={(option) => option.label}
          label="Estado"
          getOptionLabel={(option) => option.label}
          renderItem={({ option }) => (
            <Box>
              <SText>{option.label}</SText>
            </Box>
          )}
          onInputChange={(value) => console.log(value)}
          placeholder="Estado (UF)"
          options={[1, 2, 3, 4, 5, 6, 7, 8].map((num) => ({
            label: `Rodrigo ${num}`,
          }))}
        />

        <SDatePicker onChange={(date) => {}} label="Validade" />
        <SModalButtons>
          <SButton color="primary" variant="outlined" size="l" text="Salvar" />
          <SButton
            color="primary"
            variant="contained"
            size="l"
            text="2Salvar"
          />
        </SModalButtons>
      </CForm>
    </SModalPaper>
  );
};
