/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';

import { IUseModalActivity } from '../../hooks/useModalAddActivity';
import SSelect from 'components/atoms/SSelect';
import { Box, ListSubheader, MenuItem } from '@mui/material';
import {
  RiskFactorActivities,
  ActivityTypeEnum,
} from 'core/interfaces/api/IRiskFactors';
import SIconButton from 'components/atoms/SIconButton';
import SDeleteIcon from 'assets/icons/SDeleteIcon';

export const ActivityForm = (props: IUseModalActivity) => {
  const { control, data, setValue, watch } = props;

  const activities = watch('activities') || [];

  // Filter activities by type
  const periculosaActivities = (data.risk.activities || []).filter(
    (activity) => activity.activityType === ActivityTypeEnum.PERICULOSIDADE,
  );
  const insalubreActivities = (data.risk.activities || []).filter(
    (activity) => activity.activityType === ActivityTypeEnum.INSALUBRIDADE,
  );

  // Filter selected activities by type
  const selectedPericulosas = activities.filter(
    (activity: any) =>
      activity.activityType === ActivityTypeEnum.PERICULOSIDADE,
  );
  const selectedInsalubres = activities.filter(
    (activity: any) => activity.activityType === ActivityTypeEnum.INSALUBRIDADE,
  );

  const renderActivityMenu = (option: RiskFactorActivities) => {
    const subActivities = option?.subActivities || [];

    if (!subActivities.length)
      return (
        <MenuItem
          value={
            {
              id: option.description,
              description: option.description,
              activityType: option.activityType,
            } as any
          }
        >
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
              activityType: option.activityType,
            } as any
          }
        >
          {sub.description}
        </MenuItem>
      )) || []),
    ];
  };

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
        {/* Atividade Periculosa Selector */}
        {periculosaActivities.length > 0 && (
          <>
            <Box width={['100%']}>
              <SSelect
                size="small"
                placeholder="selecione..."
                label="Atividade Periculosa"
                labelPosition="top"
                options={periculosaActivities}
                onChange={(e) => {
                  const value = e.target.value as any;
                  // Check if already selected
                  const isDuplicate = activities.some(
                    (activity: any) => activity.id === value.id,
                  );
                  if (!isDuplicate) {
                    const newActivities = [...activities, value];
                    setValue('activities', newActivities);
                  }
                }}
                fullWidth
                value={null}
                renderMenu={renderActivityMenu}
              />
            </Box>

            {/* Display selected Periculosa activities */}
            {selectedPericulosas.map((activity: any, index: number) => {
              const globalIndex = activities.findIndex(
                (a: any) => a.id === activity.id,
              );
              return (
                <Box
                  key={activity.id || index}
                  width={['100%']}
                  sx={{
                    position: 'relative',
                    border: '2px solid',
                    borderColor: 'error.light',
                    minHeight: 40,
                    borderRadius: 1,
                    p: 2,
                    px: 5,
                    backgroundColor: 'error.lighter',
                  }}
                >
                  <SText color="error.dark" fontSize={13} fontWeight={600}>
                    {activity.description}
                  </SText>
                  <SText color="error.main">{activity.subActivity}</SText>
                  <SIconButton
                    onClick={() => {
                      setValue(
                        'activities',
                        activities.filter(
                          (_: any, i: number) => i !== globalIndex,
                        ),
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
              );
            })}
          </>
        )}

        {/* Atividade Insalubre Selector */}
        {insalubreActivities.length > 0 && (
          <>
            <Box width={['100%']}>
              <SSelect
                size="small"
                placeholder="selecione..."
                label="Atividade Insalubre"
                labelPosition="top"
                options={insalubreActivities}
                onChange={(e) => {
                  const value = e.target.value as any;
                  // Check if already selected
                  const isDuplicate = activities.some(
                    (activity: any) => activity.id === value.id,
                  );
                  if (!isDuplicate) {
                    const newActivities = [...activities, value];
                    setValue('activities', newActivities);
                  }
                }}
                fullWidth
                value={null}
                renderMenu={renderActivityMenu}
              />
            </Box>

            {/* Display selected Insalubre activities */}
            {selectedInsalubres.map((activity: any, index: number) => {
              const globalIndex = activities.findIndex(
                (a: any) => a.id === activity.id,
              );
              return (
                <Box
                  key={activity.id || index}
                  width={['100%']}
                  sx={{
                    position: 'relative',
                    border: '2px solid',
                    borderColor: 'warning.light',
                    borderRadius: 1,
                    minHeight: 40,
                    p: 2,
                    px: 5,
                    backgroundColor: 'warning.lighter',
                  }}
                >
                  <SText color="warning.dark" fontSize={13} fontWeight={600}>
                    {activity.description}
                  </SText>
                  <SText color="warning.main">{activity.subActivity}</SText>
                  <SIconButton
                    onClick={() => {
                      setValue(
                        'activities',
                        activities.filter(
                          (_: any, i: number) => i !== globalIndex,
                        ),
                      );
                    }}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                    }}
                  >
                    <SDeleteIcon sx={{ color: 'warning.main', fontSize: 18 }} />
                  </SIconButton>
                </Box>
              );
            })}
          </>
        )}

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
