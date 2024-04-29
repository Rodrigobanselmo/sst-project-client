/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react';

import { Box, Icon } from '@mui/material';
import { InputForm } from 'components/molecules/form/input';

import AddIcon, { SAddIcon } from 'assets/icons/SAddIcon';
import { SDeleteIcon } from 'assets/icons/SDeleteIcon';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import { useFieldArray } from 'react-hook-form';
import { IUseAddRisk } from '../../hooks/useAddRisk';

export const RiskActivityContent: FC<{ children?: any } & IUseAddRisk> = ({
  riskData,
  setRiskData,
  control,
  setValue,
  type,
}) => {
  const { fields, append } = useFieldArray({
    control,
    name: 'activities',
  });

  return (
    <Box mt={8}>
      {fields.map((activity, index) => (
        <Box mt={8} key={index}>
          <RiskSubActivityContent
            control={control}
            index={index}
            setValue={setValue}
          />
        </Box>
      ))}
      <STagButton
        width={300}
        ml={'auto'}
        mt={5}
        text={'Adicionar Atividade'}
        icon={AddIcon}
        onClick={() => append({ description: '', subActivities: [] })}
      />
    </Box>
  );
};

export const RiskSubActivityContent: FC<
  { children?: any; index: number } & Pick<IUseAddRisk, 'control' | 'setValue'>
> = ({ control, index, setValue }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `activities.${index}.subActivities`,
  });

  return (
    <Box mt={8}>
      <InputForm
        multiline
        minRows={2}
        maxRows={5}
        setValue={setValue}
        label={`Atividade ${index + 1}`}
        control={control}
        sx={{ width: ['100%', 600] }}
        placeholder={'Descrição da atividade ' + (index + 1)}
        name={`activities.${index}.description`}
        size="small"
        endAdornment={
          <SIconButton size="small" onClick={() => append({ description: '' })}>
            <Icon component={SAddIcon} sx={{ fontSize: '1rem' }} />
          </SIconButton>
        }
      />
      {fields.map((subActivity, _index) => (
        <Box mt={8} key={_index} pl={'30px'}>
          <InputForm
            multiline
            variant="outlined"
            label={_index == 0 ? 'Sub Atividade' : ''}
            minRows={2}
            maxRows={5}
            setValue={setValue}
            control={control}
            sx={{ width: ['100%', 570] }}
            placeholder={`(${
              _index + 1
            }) Descrição da sub atividade / área de risco`}
            name={`activities.${index}.subActivities.${_index}.description`}
            size="small"
            endAdornment={
              <SIconButton size="small" onClick={() => remove(_index)}>
                <Icon component={SDeleteIcon} sx={{ fontSize: '1rem' }} />
              </SIconButton>
            }
          />
        </Box>
      ))}
    </Box>
  );
};
