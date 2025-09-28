import { useEffect, useImperativeHandle, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Grid } from '@mui/material';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { SInputForm } from '@v2/components/forms/controlled/SInputForm/SInputForm';
import { FormParticipantsBrowseResultModel } from '@v2/models/form/models/form-participants/form-participants-browse-result.model';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { EmployeeFormData } from '../../hooks/useEmployeeEditModal';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { maskPhone } from '@v2/utils/@masks/phone.mask';

interface EmployeeEditFormProps {
  employee: IEmployee;
  participantData: FormParticipantsBrowseResultModel;
  companyId: string;
  onSubmit?: (data: EmployeeFormData) => void;
}

const schema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Email inválido'),
  phone: yup.string(),
  cpf: yup.string().required('CPF é obrigatório'),
  hierarchyId: yup.string().required('Hierarquia é obrigatória'),
});

export const EmployeeEditForm = forwardRef<
  { onSubmit: () => void },
  EmployeeEditFormProps
>(({ employee, onSubmit: onSubmitProp }, ref) => {
  const form = useForm<EmployeeFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      cpf: employee.cpf || '',
      hierarchyId: employee.hierarchyId || '',
    },
  });

  const { handleSubmit, reset } = form;

  // Update form values when employee data changes
  useEffect(() => {
    if (employee) {
      reset({
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        cpf: employee.cpf || '',
        hierarchyId: employee.hierarchyId || '',
      });
    }
  }, [employee, reset]);

  // Expose submit function to parent
  useImperativeHandle(ref, () => ({
    onSubmit: () => {
      handleSubmit((data) => {
        if (onSubmitProp) {
          onSubmitProp(data);
        }
      })();
    },
  }));

  return (
    <SForm form={form}>
      <Box sx={{ p: 2 }}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <SInputForm
              name="name"
              label="Nome Completo"
              placeholder="Digite o nome completo"
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <SInputForm
              name="email"
              label="Email"
              placeholder="Digite o email"
              type="email"
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <SInputForm
              name="phone"
              label="Telefone"
              transformation={maskPhone}
              placeholder="Digite o telefone"
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <SInputForm
              name="cpf"
              label="CPF"
              placeholder="Digite o CPF"
              fullWidth
              disabled // CPF usually shouldn't be editable
            />
          </Grid>

          {/* <Grid item xs={12} md={6}>
            <SInputForm
              name="hierarchyId"
              label="Hierarquia"
              placeholder="ID da Hierarquia"
              fullWidth
              disabled // For now, make this read-only
            />
          </Grid> */}
        </Grid>
      </Box>
    </SForm>
  );
});
