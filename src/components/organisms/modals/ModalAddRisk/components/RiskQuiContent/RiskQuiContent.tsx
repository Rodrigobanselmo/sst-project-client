/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { Box, Typography } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { InputForm } from 'components/molecules/form/input';

import { IUseAddRisk } from '../../hooks/useAddRisk';

const limitHelperTeto = 'utilizar "T" para indicar TETO';
const limitHelperLegacyCeiling =
  'Campo legado: se já houver limite Ceiling informado com C, ele será preservado. Para novos cadastros, prefira o campo ACGIH Ceiling.';

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

      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
        Limites NR-15
      </Typography>
      <SFlex mt={4}>
        <Box>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.nr15lt}
            label="NR-15 LT"
            control={control}
            placeholder={'valor...'}
            name="nr15lt"
            size="small"
            helperText={limitHelperTeto}
          />
        </Box>
      </SFlex>

      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
        Limites ACGIH
      </Typography>
      <SFlex mt={4}>
        <Box>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.twa}
            label="ACGIH TWA"
            control={control}
            placeholder={'valor...'}
            name="twa"
            size="small"
            helperText={limitHelperLegacyCeiling}
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
            helperText={limitHelperLegacyCeiling}
          />
        </Box>
        <Box>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.acgihCeiling}
            label="ACGIH Ceiling"
            control={control}
            placeholder={'valor...'}
            name="acgihCeiling"
            size="small"
          />
        </Box>
      </SFlex>

      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
        Limites NIOSH
      </Typography>
      <SFlex mt={4}>
        <Box>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.nioshRel}
            label="NIOSH REL"
            control={control}
            placeholder={'valor...'}
            name="nioshRel"
            size="small"
          />
        </Box>
        <Box>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.nioshStel}
            label="NIOSH STEL"
            control={control}
            placeholder={'valor...'}
            name="nioshStel"
            size="small"
          />
        </Box>
        <Box>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.nioshCeiling}
            label="NIOSH Ceiling"
            control={control}
            placeholder={'valor...'}
            name="nioshCeiling"
            size="small"
          />
        </Box>
      </SFlex>
      <Box mt={4}>
        <InputForm
          setValue={setValue}
          defaultValue={riskData.ipvs}
          label="NIOSH IDLH / IPVS"
          control={control}
          placeholder={'valor...'}
          name="ipvs"
          size="small"
        />
      </Box>

      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
        Limites OSHA
      </Typography>
      <SFlex mt={4}>
        <Box>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.oshaPel}
            label="OSHA PEL"
            control={control}
            placeholder={'valor...'}
            name="oshaPel"
            size="small"
          />
        </Box>
        <Box>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.oshaStel}
            label="OSHA STEL"
            control={control}
            placeholder={'valor...'}
            name="oshaStel"
            size="small"
          />
        </Box>
        <Box>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.oshaCeiling}
            label="OSHA Ceiling"
            control={control}
            placeholder={'valor...'}
            name="oshaCeiling"
            size="small"
          />
        </Box>
      </SFlex>

      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
        Limites AIHA
      </Typography>
      <SFlex mt={4}>
        <Box>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.aihaWeel}
            label="AIHA WEEL"
            control={control}
            placeholder={'valor...'}
            name="aihaWeel"
            size="small"
          />
        </Box>
        <Box>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.aihaWeelCeiling}
            label="AIHA WEEL-C"
            control={control}
            placeholder={'valor...'}
            name="aihaWeelCeiling"
            size="small"
          />
        </Box>
      </SFlex>

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
