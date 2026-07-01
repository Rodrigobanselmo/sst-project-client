import React, { FC, useState } from 'react';

import { Box, Button, Typography } from '@mui/material';
import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { InputForm } from 'components/molecules/form/input';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

import { RiskMap } from 'project/enum/risk.enums';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import { useMutateCreateRiskSubType } from '@v2/services/security/risk/sub-type/create-risk-sub-type/hooks/useMutateCreateRiskSubType';
import type { CreateRiskSubTypeResponse } from '@v2/services/security/risk/sub-type/create-risk-sub-type/service/create-risk-sub-type.types';

type ModalCreateRiskSubTypeProps = {
  open: boolean;
  onClose: () => void;
  riskType: RiskTypeEnum;
  onCreated: (subType: CreateRiskSubTypeResponse) => void;
};

type FormValues = {
  name: string;
  description?: string;
};

const schema = Yup.object({
  name: Yup.string().trim().required('Nome é obrigatório'),
  description: Yup.string().optional(),
});

export const ModalCreateRiskSubType: FC<ModalCreateRiskSubTypeProps> = ({
  open,
  onClose,
  riskType,
  onCreated,
}) => {
  const createMutation = useMutateCreateRiskSubType();
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset, setValue } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: '', description: '' },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const created = await createMutation.mutateAsync({
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        type: riskType,
      });
      onCreated(created);
      reset();
      onClose();
    } finally {
      setSubmitting(false);
    }
  });

  const typeLabel = RiskMap[riskType]?.name ?? riskType;

  return (
    <SModal open={open} onClose={handleClose}>
      <SModalPaper width={['100%', 480]} p={8} center>
        <SModalHeader title="Criar subtipo" onClose={handleClose} />
        <Box mt={4}>
          <Typography variant="body2" color="text.secondary" mb={4}>
            Tipo de risco: <strong>{typeLabel}</strong>
          </Typography>
          <InputForm
            label="Nome"
            name="name"
            control={control}
            setValue={setValue}
            placeholder="nome do subtipo..."
            size="small"
            sx={{ width: '100%', mb: 4 }}
          />
          <InputForm
            label="Descrição (opcional)"
            name="description"
            control={control}
            setValue={setValue}
            placeholder="descrição do subtipo..."
            size="small"
            multiline
            minRows={2}
            sx={{ width: '100%' }}
          />
          <Box mt={8} display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={handleClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={onSubmit}
              disabled={submitting || createMutation.isPending}
            >
              Salvar
            </Button>
          </Box>
        </Box>
      </SModalPaper>
    </SModal>
  );
};
