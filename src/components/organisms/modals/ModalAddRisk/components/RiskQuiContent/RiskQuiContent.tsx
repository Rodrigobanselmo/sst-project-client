/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useMemo } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { InputForm } from 'components/molecules/form/input';
import { RadioFormText } from 'components/molecules/form/radio-text';
import { Esocial24RiskSelect } from 'components/organisms/inputSelect/Esocial24RiskSelect/Esocial24RiskSelect';
import { RiskEnum, UnMedList } from 'project/enum/risk.enums';
import { SeverityEnum } from 'project/enum/severity.enums';

import { enumToArray } from 'core/utils/helpers/convertEnum';
import { getTimeList } from 'core/utils/helpers/times';
import { timeMask } from 'core/utils/masks/date.mask';

import { IUseAddRisk } from '../../hooks/useAddRisk';

export const RiskQuiContent: FC<{ children?: any } & IUseAddRisk> = ({
  riskData,
  control,
  setValue,
}) => {
  return (
    <>
      <SFlex mt={8}>
        <Box>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.cas}
            label="Nº CAS"
            control={control}
            placeholder={'número CAS...'}
            name="cas"
            size="small"
          />
        </Box>
      </SFlex>

      <SFlex mt={8}>
        <Box>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.nr15lt}
            label="NR-15 LT (ppm)"
            control={control}
            placeholder={'valor...'}
            name="nr15lt"
            size="small"
            helperText={'utilizar "T" para indicar TETO'}
          />
        </Box>
        <Box>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.twa}
            label="ACGIH TWA"
            control={control}
            placeholder={'valor...'}
            name="twa"
            size="small"
          />
        </Box>
        <Box>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.stel}
            label="ACGIH STEL"
            control={control}
            placeholder={'valor...'}
            name="stel"
            size="small"
            helperText={'utilizar "C" para indicar "CEILLING"'}
          />
        </Box>
      </SFlex>

      <Box mt={8}>
        <InputForm
          setValue={setValue}
          defaultValue={riskData.ipvs}
          label="IPVS/IDHL"
          control={control}
          placeholder={'...'}
          name="ipvs"
          size="small"
        />
      </Box>

      <SFlex mt={8}>
        <Box>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.pv}
            label="PV (mmHg)"
            control={control}
            placeholder={'valor PV...'}
            name="pv"
            size="small"
          />
        </Box>
        <Box>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.pe}
            label="PE (ºC)"
            control={control}
            placeholder={'valor PE...'}
            name="pe"
            size="small"
          />
        </Box>
      </SFlex>

      <SFlex mt={8}>
        <Box>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.carnogenicityACGIH}
            label="Carcinogenicidade ACGIH"
            control={control}
            placeholder={'...'}
            name="carnogenicityACGIH"
            size="small"
          />
        </Box>
        <Box>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.carnogenicityLinach}
            label="Carcinogenicidade LINACH "
            control={control}
            placeholder={'número CAS...'}
            name="carnogenicityLinach"
            size="small"
          />
        </Box>
      </SFlex>

      <SFlex mt={8}>
        <Box>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.breather}
            label="Respirador/Filtro"
            control={control}
            placeholder={'...'}
            name="breather"
            size="small"
          />
        </Box>
        <Box>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.fraction}
            label="Fração"
            control={control}
            placeholder={'...'}
            name="fraction"
            size="small"
          />
        </Box>
      </SFlex>
      <Box mt={8}>
        <InputForm
          setValue={setValue}
          defaultValue={riskData.coments}
          label="Comentários respirador/filtro"
          control={control}
          placeholder={'comentários...'}
          name="coments"
          size="small"
        />
      </Box>
    </>
  );
};
