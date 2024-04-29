/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';

import { floatMask } from 'core/utils/masks/float.mask';

import { IUseModalActivity } from '../../hooks/useModalAddActivity';
import { SelectForm } from 'components/molecules/form/select';
import SSelect from 'components/atoms/SSelect';
import { Box, ListSubheader, MenuItem } from '@mui/material';
import { RiskFactorActivities } from 'core/interfaces/api/IRiskFactors';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import SIconButton from 'components/atoms/SIconButton';
import SDeleteIcon from 'assets/icons/SDeleteIcon';

export const ActivityForm = (props: IUseModalActivity) => {
  const { control, data, setValue, watch } = props;

  const activities = watch('activities');

  return (
    <SFlex width={['100%', 600, 800]} direction="column" mt={8}>
      <SFlex
        sx={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: '1fr',
          mb: 10,
        }}
      >
        <Box width={['100%']}>
          <SSelect
            size="small"
            placeholder="selecione..."
            label="Atividade*"
            labelPosition="top"
            options={data.risk.activities || []}
            onChange={(e) => {
              const value = e.target.value as any;
              setValue(
                'activities',
                removeDuplicate([...(activities ? activities : []), value]),
              );
            }}
            fullWidth
            value={null}
            renderMenu={(option: RiskFactorActivities) => {
              const subActivities = option?.subActivities || [];

              if (!subActivities.length)
                return (
                  <MenuItem value={option.description}>
                    {option.description}
                  </MenuItem>
                );

              return [
                <ListSubheader>
                  <SText sx={{ color: 'grey.500' }}>{option.description}</SText>
                </ListSubheader>,
                ...(subActivities.map((sub) => (
                  <MenuItem
                    key={sub.description as any}
                    value={
                      {
                        id: option.description + sub.description,
                        description: option.description,
                        subActivity: sub.description,
                      } as any
                    }
                  >
                    {sub.description}
                  </MenuItem>
                )) || []),
              ];
            }}
          />
        </Box>
        {(activities ?? []).map((activity, index) => (
          <Box
            width={['100%']}
            sx={{
              position: 'relative',
              border: '1px solid',
              borderColor: 'grey.300',
              borderRadius: 1,
              p: 2,
              px: 5,
              backgroundColor: 'grey.200',
            }}
          >
            <SText color="grey.600" fontSize={13}>
              {activity.description}
            </SText>
            <SText>{activity.subActivity}</SText>
            <SIconButton
              onClick={() => {
                setValue(
                  'activities',
                  activities.filter((_, i) => i !== index),
                );
              }}
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
              }}
            >
              <SDeleteIcon sx={{ color: 'error.main', fontSize: 18 }} />
            </SIconButton>
          </Box>
        ))}
        <InputForm
          multiline
          minRows={3}
          maxRows={4}
          defaultValue={data.realActivity}
          setValue={setValue}
          label="Atividade Real"
          control={control}
          placeholder={'Descrição atividade real...'}
          name="realActivity"
          size="small"
        />
      </SFlex>
    </SFlex>
  );
};
