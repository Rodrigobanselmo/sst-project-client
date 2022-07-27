/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import dayjs from 'dayjs';

import { IUseEditEpi } from '../../hooks/useEditEpis';

export const ModalEpiStep = ({
  epiData,
  onSelectCheck,
  control,
  onSelectAllChecked,
  isAllSelected,
  isExpired,
}: IUseEditEpi) => {
  return (
    <SFlex gap={8} direction="column" mt={8}>
      <SText color="text.label" fontSize={14}>
        Dados
      </SText>
      <SFlex minWidth={['100%', 600, 800]} flexWrap="wrap" gap={5}>
        <Box flex={5}>
          <InputForm
            autoFocus
            defaultValue={epiData.equipment}
            label="Equipamento"
            maxRows={3}
            multiline
            fullWidth
            sx={{ display: 'flex', flex: 1, width: '100%' }}
            labelPosition="center"
            control={control}
            name="equipment"
            size="small"
            uneditable
          />
        </Box>
        <Box flex={1}>
          <InputForm
            defaultValue={epiData.ca}
            fullWidth
            label="CA"
            labelPosition="center"
            control={control}
            name="ca"
            size="small"
            uneditable
          />
        </Box>
      </SFlex>
      <SFlex minWidth={['100%', 600, 800]} flexWrap="wrap" gap={5}>
        <Box flex={4}>
          <InputForm
            autoFocus
            defaultValue={epiData.report}
            label="Laudo"
            maxRows={3}
            multiline
            fullWidth
            sx={{ display: 'flex', flex: 1, width: '100%' }}
            labelPosition="center"
            control={control}
            name="equipment"
            size="small"
            uneditable
          />
        </Box>
        {epiData.expiredDate && (
          <Box flex={1}>
            <InputForm
              defaultValue={dayjs(epiData.expiredDate).format('DD/MM/YYYY')}
              fullWidth
              label="Expira em"
              labelPosition="center"
              control={control}
              name="ca"
              size="small"
              uneditable
              error={isExpired}
              helperText={isExpired ? 'CA Vencido' : ''}
            />
          </Box>
        )}
      </SFlex>
      {epiData.restriction && (
        <InputForm
          defaultValue={epiData.restriction}
          fullWidth
          label="Restrições"
          labelPosition="center"
          control={control}
          name="ca"
          size="small"
          uneditable
        />
      )}

      <SFlex direction="column" ml={6}>
        <SFlex>
          <SSwitch
            label="Selecionar todos?"
            sx={{ mr: 6 }}
            color="text.light"
            onChange={(e) => onSelectAllChecked(e.target.checked)}
            checked={isAllSelected}
          />
        </SFlex>
        <SText mb={6} ml={15} component="span" fontSize={12} color="text.light">
          Os items abaixo serão enviados ao <b>eSocial</b>, ao selecioana-los
          você estará se <br />
          responsabilizando pela veracidade das informações
        </SText>
        <SSwitch
          onChange={(e) => onSelectCheck(e.target.checked, 'efficientlyCheck')}
          checked={!!epiData.epiRiskData?.efficientlyCheck}
          label="Eficaz?"
          sx={{ mr: 6 }}
          color="text.light"
        />
        <SSwitch
          onChange={(e) => onSelectCheck(e.target.checked, 'epcCheck')}
          checked={!!epiData.epiRiskData?.epcCheck}
          label="Foi tentada a implementação de medidas de proteção coletiva, de caráter administrativo ou de organização, ...?"
          sx={{ mr: 6 }}
          color="text.light"
        />
        <SSwitch
          onChange={(e) => onSelectCheck(e.target.checked, 'longPeriodsCheck')}
          checked={!!epiData.epiRiskData?.longPeriodsCheck}
          label="Foram observadas as condições de funcionamento e do uso ininterrupto do EPI ao longo do tempo, ...?"
          sx={{ mr: 6 }}
          color="text.light"
        />
        <SSwitch
          onChange={(e) => onSelectCheck(e.target.checked, 'validationCheck')}
          checked={!!epiData.epiRiskData?.validationCheck}
          label="Foi observado o prazo de validade, conforme Certificado de Aprovação - CA do MTE?"
          sx={{ mr: 6 }}
          color="text.light"
        />
        <SSwitch
          onChange={(e) => onSelectCheck(e.target.checked, 'tradeSignCheck')}
          checked={!!epiData.epiRiskData?.tradeSignCheck}
          label="Foi observada a periodicidade de troca definida pelos programas ambientais, comprovada mediante recibo assinado pelo usuário em época própria?"
          sx={{ mr: 6 }}
          color="text.light"
        />
        <SSwitch
          onChange={(e) => onSelectCheck(e.target.checked, 'sanitationCheck')}
          checked={!!epiData.epiRiskData?.sanitationCheck}
          label="Foi observada a higienização?"
          sx={{ mr: 6 }}
          color="text.light"
        />
        <SSwitch
          onChange={(e) => onSelectCheck(e.target.checked, 'maintenanceCheck')}
          checked={!!epiData.epiRiskData?.maintenanceCheck}
          label="É observada a manutenção conforme orientação do fabricante nacional ou importador?"
          sx={{ mr: 6 }}
          color="text.light"
        />
        <SSwitch
          onChange={(e) => onSelectCheck(e.target.checked, 'unstoppedCheck')}
          checked={!!epiData.epiRiskData?.unstoppedCheck}
          label="Foi observado o uso ininterrupto do EPI ao longo do tempo?"
          sx={{ mr: 6 }}
          color="text.light"
        />
        <SSwitch
          onChange={(e) => onSelectCheck(e.target.checked, 'trainingCheck')}
          checked={!!epiData.epiRiskData?.trainingCheck}
          label="Treinamento"
          sx={{ mr: 6 }}
          color="text.light"
        />
      </SFlex>
    </SFlex>
  );
};
