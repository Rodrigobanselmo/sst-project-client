import { FC } from 'react';

import SFlex from 'components/atoms/SFlex';
import SSelect from 'components/atoms/SSelect';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';

import { IUseEditWorkspace } from '../../hooks/useEditWorkspace';

const FIRST_AID_OPTIONS = [
  { content: 'Sim', value: 'true' },
  { content: 'Não', value: 'false' },
  { content: 'Não informado', value: 'null' },
];

const mapFirstAidValue = (value?: boolean | null) => {
  if (value === true) return 'true';
  if (value === false) return 'false';
  return 'null';
};

const mapFirstAidSelection = (value: string): boolean | null => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
};

export const WorkspaceFirstAidSection: FC<IUseEditWorkspace> = ({
  companyData,
  setCompanyData,
  control,
  setValue,
}) => {
  if (!companyData.id) return null;

  return (
    <SFlex direction="column" gap={6} mt={8}>
      <SText color="text.label" fontSize={14}>
        Primeiros socorros no estabelecimento
      </SText>

      <SSelect
        label="Existe posto de atendimento / primeiros socorros no estabelecimento?"
        labelPosition="top"
        width={600}
        value={mapFirstAidValue(companyData.hasFirstAidService)}
        options={FIRST_AID_OPTIONS}
        optionsFieldName={{ valueField: 'value', contentField: 'content' }}
        onChange={(event) => {
          const value = mapFirstAidSelection(String(event.target.value));
          setCompanyData((oldData) => ({
            ...oldData,
            hasFirstAidService: value,
          }));
        }}
      />

      <InputForm
        multiline
        minRows={3}
        maxRows={8}
        label="Observação sobre primeiros socorros"
        labelPosition="top"
        placeholder="Ex.: O estabelecimento está localizado em shopping/condomínio/unidade que dispõe de estrutura de apoio para atendimento inicial de ocorrências."
        defaultValue={companyData.firstAidServiceDescription || ''}
        setValue={setValue}
        control={control}
        name="firstAidServiceDescription"
        sx={{ minWidth: ['100%', 600] }}
        onChange={(event) => {
          setCompanyData((oldData) => ({
            ...oldData,
            firstAidServiceDescription: event.target.value,
          }));
        }}
      />
    </SFlex>
  );
};
