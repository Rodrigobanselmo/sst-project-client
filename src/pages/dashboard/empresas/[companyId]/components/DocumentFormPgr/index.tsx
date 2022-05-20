import { Box } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { InputForm } from 'components/molecules/form/input';

import { useFetchFeedback } from 'core/hooks/useFetchFeedback';
import { useQueryRiskGroupDataOne } from 'core/services/hooks/queries/useQueryRiskGroupDataOne';

import { usePgrForm } from './hooks/usePgrForm';
import { STBox } from './styles';
import { INextStepButtonProps } from './types';

export const DocumentFormPgr = ({
  riskGroupId,
  ...props
}: INextStepButtonProps) => {
  const { data } = useQueryRiskGroupDataOne(riskGroupId as string);

  const { onSave, loading, handleSubmit, onSubmitNewVersion, control } =
    usePgrForm(riskGroupId);

  useFetchFeedback(!data);

  if (!data) return null;
  return (
    <STBox
      onSubmit={handleSubmit(onSubmitNewVersion)}
      component={'form'}
      {...props}
    >
      <InputForm
        defaultValue={data?.name}
        multiline
        minRows={2}
        maxRows={4}
        label="Descrição"
        control={control}
        placeholder={'descrição...'}
        name="name"
        size="small"
        smallPlaceholder
      />
      <Box
        mt={5}
        sx={{
          gap: 10,
          display: 'grid',
          gridTemplateColumns: 'minmax(20rem, 7fr) minmax(10rem, 2fr)',
        }}
      >
        <InputForm
          defaultValue={data?.source || ''}
          label="Fonte"
          control={control}
          placeholder={'local onde os dados foram obtidos...'}
          name="source"
          size="small"
          smallPlaceholder
        />
        <InputForm
          defaultValue={data?.visitDate || ''}
          label="Data da vista"
          control={control}
          placeholder={'data em que os dados foram obtidos...'}
          name="visitDate"
          size="small"
          smallPlaceholder
        />
      </Box>

      <Box
        mt={5}
        sx={{
          gap: 10,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))',
        }}
      >
        <InputForm
          defaultValue={data?.elaboratedBy || ''}
          label="Elabora por"
          control={control}
          placeholder={'nome do elaborador do documento...'}
          name="elaboratedBy"
          size="small"
          smallPlaceholder
        />
        <InputForm
          defaultValue={data?.revisionBy || ''}
          label="Revisado por"
          control={control}
          placeholder={' nome do resonsável pela revisão do documento...'}
          name="revisionBy"
          size="small"
          smallPlaceholder
        />
        <InputForm
          defaultValue={data?.approvedBy || ''}
          label="Aprovado por"
          control={control}
          placeholder={'nome de quem aprovou o documento...'}
          name="approvedBy"
          size="small"
          smallPlaceholder
        />
      </Box>
      <SFlex gap={5} mt={10} justifyContent="flex-end" width="100%">
        <SButton
          disabled={true}
          variant={'outlined'}
          size="small"
          type="submit"
        >
          Gerar Nova Versão
        </SButton>
        <SButton
          size="small"
          variant={'contained'}
          loading={loading}
          onClick={onSave}
        >
          Salvar
        </SButton>
      </SFlex>
    </STBox>
  );
};
