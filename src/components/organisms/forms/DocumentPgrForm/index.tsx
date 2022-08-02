import { Box } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { InputForm } from 'components/molecules/form/input';

import { useFetchFeedback } from 'core/hooks/useFetchFeedback';
import { useQueryRiskGroupDataOne } from 'core/services/hooks/queries/useQueryRiskGroupDataOne';
import { dateToString } from 'core/utils/date/date-format';

import { usePgrForm } from './hooks/usePgrForm';
import { STBox } from './styles';
import { INextStepButtonProps } from './types';

export const DocumentPgrForm = ({
  riskGroupId,
  ...props
}: INextStepButtonProps) => {
  const { data } = useQueryRiskGroupDataOne(riskGroupId as string);

  const {
    onSave,
    onGenerateVersion,
    loading,
    handleSubmit,
    onSubmitNewVersion,
    control,
    uneditable,
    onEdit,
  } = usePgrForm(riskGroupId, data);

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
        uneditable={uneditable}
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
          defaultValue={data?.source}
          uneditable={uneditable}
          label="Fonte"
          control={control}
          placeholder={'local onde os dados foram obtidos...'}
          name="source"
          size="small"
          smallPlaceholder
        />
        <InputForm
          defaultValue={dateToString(data?.visitDate)}
          uneditable={uneditable}
          label="Data da visita"
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
          defaultValue={data?.elaboratedBy}
          uneditable={uneditable}
          label="Elabora por"
          control={control}
          placeholder={'nome do elaborador do documento...'}
          name="elaboratedBy"
          size="small"
          smallPlaceholder
        />
        <InputForm
          defaultValue={data?.revisionBy}
          uneditable={uneditable}
          label="Revisado por"
          control={control}
          placeholder={' nome do resonsável pela revisão do documento...'}
          name="revisionBy"
          size="small"
          smallPlaceholder
        />
        <InputForm
          defaultValue={data?.approvedBy}
          uneditable={uneditable}
          label="Aprovado por"
          control={control}
          placeholder={'nome de quem aprovou o documento...'}
          name="approvedBy"
          size="small"
          smallPlaceholder
        />
      </Box>
      <SFlex gap={5} mt={10} justifyContent="flex-end" width="100%">
        <SButton variant={'outlined'} size="small" onClick={onGenerateVersion}>
          Gerar Nova Versão
        </SButton>
        <SButton
          size="small"
          variant={uneditable ? 'contained' : 'outlined'}
          loading={loading}
          onClick={onEdit}
        >
          {uneditable ? 'Editar' : 'Cancelar'}
        </SButton>
        <SButton
          size="small"
          variant={'contained'}
          loading={loading}
          onClick={onSave}
          disabled={uneditable}
        >
          Salvar
        </SButton>
      </SFlex>
    </STBox>
  );
};
