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
import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import {
  actionPlanInfoFormInitialValues,
  schemaActionPlanInfoForm,
} from './ActionPlanInfoForm.schema';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { useFetchBrowseCoordinator } from '@v2/services/security/action-plan/browse-coordinators/hooks/useFetchBrowseCoordinators';
import { SDatePickerForm } from '@v2/components/forms/controlled/SDatePickerForm/SDatePickerForm';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SFormSection } from '@v2/components/forms/components/SFormSection/SFormSection';
import { SFormRow } from '@v2/components/forms/components/SFormRow/SFormRow';
import { SAutocompleteSelect } from '@v2/components/forms/fields/SAutocompleteSelect/SAutocompleteSelect';

export const ActionPlanInfoForm = () => {
  const router = useRouter();
  const { closeModal } = useModal();

  const companyId = router.query.companyId as string;

  const { coordinators, isLoading } = useFetchBrowseCoordinator({
    companyId,
    pagination: {
      page: 1,
      limit: 10,
    },
  });

  const form = useForm({
    resolver: yupResolver(schemaActionPlanInfoForm),
    defaultValues: actionPlanInfoFormInitialValues,
  });

  const onSubmit = (second: any) => {
    console.log(second);
  };

  return (
    <SModalPaper>
      <SModalHeader
        title="Editar Plano de Ação"
        onClose={() => closeModal(ModalKeyEnum.EDIT_ACTION_PLAN_INFO)}
      />
      <CForm form={form}>
        <SFormSection>
          <SSearchSelectForm
            name="coordinator"
            loading={!coordinators?.results || isLoading}
            getOptionValue={(option) => option.name}
            label="Coordenador"
            getOptionLabel={(option) => option.name}
            // renderItem={({ option }) => (
            //   <Box>
            //     <SText>{option.name}</SText>
            //   </Box>
            // )}
            onInputChange={(value) => console.log(value)}
            placeholder="Selecionar Coordenador"
            options={coordinators?.results || []}
          />

          <SFormRow>
            <SDatePickerForm name="validityStart" label="Início da Validade" />
            <SDatePickerForm
              name="validityEnd"
              label="Fim da Validade"
              textFieldProps={{ sx: { width: 50, maxWidth: 50 } }}
            />
          </SFormRow>
          <SFormRow>
            <SAutocompleteSelect
              label="Estado"
              value={'dwedw'}
              getOptionLabel={(option) => option}
              onChange={(_, option) => {
                console.log(option);
                // setValue(option);
              }}
              onInputChange={(e, value, reason) => console.log(value, reason)}
              placeholder="Estado (UF)"
              options={['klmkl', 'nionionio ']}
            />
          </SFormRow>
        </SFormSection>
      </CForm>
      <SModalButtons>
        <SButton
          onClick={form.handleSubmit(onSubmit)}
          minWidth={100}
          color="primary"
          variant="outlined"
          size="l"
          text="Cancelar"
        />
        <SButton
          onClick={form.handleSubmit(onSubmit)}
          minWidth={100}
          color="primary"
          variant="contained"
          size="l"
          text="Salvar"
        />
      </SModalButtons>
    </SModalPaper>
  );
};
