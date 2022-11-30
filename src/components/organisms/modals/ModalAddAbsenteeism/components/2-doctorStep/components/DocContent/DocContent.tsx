/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { InputForm } from 'components/molecules/form/input';
import { SelectForm } from 'components/molecules/form/select';
import { CidInputSelect } from 'components/organisms/inputSelect/CidSelect/CidSelect';
import { ProfessionalInputSelect } from 'components/organisms/inputSelect/ProfessionalSelect/ProfessionalSelect';

import { isAbsTraffic } from 'core/interfaces/api/IAbsenteeism';

import { IUseDoctorData } from '../../hooks/useDoctorData';

export const DocContent = (props: IUseDoctorData) => {
  const { control, setAbsenteeismData, absenteeismData } = props;
  return (
    <SFlex flexDirection="column" flexWrap="wrap" gap={5}>
      <Box maxWidth={800}>
        <ProfessionalInputSelect
          query={{ byCouncil: true, companyId: absenteeismData.companyId }}
          onChange={(prof) => {
            setAbsenteeismData((d) => ({ ...d, doc: prof, docId: prof?.id }));
          }}
          inputProps={{
            labelPosition: 'top',
            placeholder: 'selecione o médico...',
          }}
          simpleAdd
          unmountOnChangeDefault
          defaultValue={absenteeismData?.doc}
          name="doctor"
          docOnly
          label="Médico"
          control={control}
        />
      </Box>

      <Box maxWidth={800}>
        <CidInputSelect
          onChange={(cid) => {
            setAbsenteeismData((d) => ({ ...d, cid: cid, cidId: cid?.cid }));
          }}
          inputProps={{
            labelPosition: 'top',
            placeholder: 'selecione o CID...',
          }}
          defaultValue={absenteeismData.cid}
          name="cid"
          label="CID"
          control={control}
        />
      </Box>

      <InputForm
        defaultValue={absenteeismData?.local}
        label="Local"
        control={control}
        sx={{ width: ['100%', 800] }}
        placeholder={'local...'}
        name="local"
        size="small"
      />
    </SFlex>
  );
};
