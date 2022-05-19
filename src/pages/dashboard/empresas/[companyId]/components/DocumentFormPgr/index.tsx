import { Box } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import { InputForm } from 'components/molecules/form/input';
import { useRouter } from 'next/router';

import { usePgrForm } from './hooks/usePgrForm';
import { STBox } from './styles';
import { INextStepButtonProps } from './types';

export const DocumentFormPgr = ({ ...props }: INextStepButtonProps) => {
  const { query } = useRouter();

  const { onSave, loading, handleSubmit, onSubmitNewVersion, control } =
    usePgrForm(query.docId as string);

  return (
    <STBox
      onSubmit={handleSubmit(onSubmitNewVersion)}
      component={'form'}
      {...props}
    >
      <InputForm
        // defaultValue={generateSourceData.name}
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
          // defaultValue={companyData.name}
          label="Fonte"
          control={control}
          placeholder={'local onde os dados foram obtidos...'}
          name="source"
          size="small"
          smallPlaceholder
        />
        <InputForm
          // defaultValue={companyData.name}
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
          // defaultValue={companyData.name}
          label="Elabora por"
          control={control}
          placeholder={'nome do elaborador do documento...'}
          name="elaboratedBy"
          size="small"
          smallPlaceholder
        />
        <InputForm
          // defaultValue={companyData.name}
          label="Revisado por"
          control={control}
          placeholder={'nome do resonsável pela revisão do documento...'}
          name="revisionBy"
          size="small"
          smallPlaceholder
        />
        <InputForm
          // defaultValue={companyData.name}
          label="Aprovado por"
          control={control}
          placeholder={'nome de quem aprovou o documento...'}
          name="approvedBy"
          size="small"
          smallPlaceholder
        />
      </Box>
      <SButton
        variant={'outlined'}
        size="small"
        loading={loading}
        onClick={onSave}
      >
        Salvar
      </SButton>
      <SButton
        variant={'contained'}
        size="small"
        type="submit"
        onClick={onSave}
      >
        Gerar Nova Versão
      </SButton>
    </STBox>
  );
};
