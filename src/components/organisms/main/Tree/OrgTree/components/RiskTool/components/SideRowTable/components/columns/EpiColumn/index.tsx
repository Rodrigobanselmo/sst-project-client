import React, { FC } from 'react';

import { Box } from '@mui/material';
import { EpiSelect, isNaEpi } from 'components/organisms/tagSelects/EpiSelect';
import dayjs from 'dayjs';

import { IEpi } from 'core/interfaces/api/IEpi';

import { SelectedTableItem } from '../../SelectedTableItem';
import { EpiColumnProps } from './types';

export const EpiColumn: FC<EpiColumnProps> = ({
  handleSelect,
  data,
  handleRemove,
  handleEdit,
  risk,
}) => {
  return (
    <Box>
      <EpiSelect
        asyncLoad
        disabled={!risk?.id}
        text={'adicionar'}
        tooltipTitle=""
        multiple={false}
        handleSelect={(options: IEpi) => {
          if (options.id)
            handleSelect(
              {
                epis: [{ ...options?.epiRiskData, epiId: options.id }],
              },
              options,
            );
        }}
      />
      {data &&
        data.epis?.map((epi) => {
          const isExpired = dayjs(epi.expiredDate).isBefore(dayjs());
          return (
            <SelectedTableItem
              key={epi.ca}
              isExpired={isExpired}
              handleEdit={() => handleEdit(epi)}
              name={isNaEpi(epi.ca) ? `${epi.equipment}` : `CA: ${epi.ca}`}
              tooltip={
                isNaEpi(epi.ca)
                  ? ''
                  : `CA ${epi.ca} - validade:(${dayjs(epi.expiredDate).format(
                      'DD/MM/YYYY',
                    )}) - ${epi.equipment}`
              }
              handleRemove={() =>
                handleRemove({
                  epis: [epi.epiRiskData],
                })
              }
            />
          );
        })}
    </Box>
  );
};
