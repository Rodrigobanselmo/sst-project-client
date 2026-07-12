import React, { FC, useState } from 'react';

import { Box } from '@mui/material';
import { EpiCaDetailModal } from 'components/molecules/EpiCaDetail';
import { EpiSelect } from 'components/organisms/tagSelects/EpiSelect';
import dayjs from 'dayjs';
import { isNaEpi } from 'project/utils/isNa';

import { IEpi } from 'core/interfaces/api/IEpi';

import { SelectedTableItem } from '../../SelectedTableItem';
import { EpiColumnProps } from './types';

export const EpiColumn: FC<{ children?: any } & EpiColumnProps> = ({
  handleSelect,
  data,
  handleRemove,
  handleEdit,
  risk,
}) => {
  const [detailEpi, setDetailEpi] = useState<IEpi | null>(null);

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
        (data.epis ?? [])
          .filter((epi) => !!epi && (!!epi.id || !!epi.ca || !!epi.equipment))
          .map((epi) => {
            const isExpired = dayjs(epi.expiredDate).isBefore(dayjs());
            const isNa = isNaEpi(epi.ca);
            return (
              <SelectedTableItem
                key={epi.id || epi.ca || epi.equipment}
                isExpired={isExpired}
                handleEdit={() => !isNa && handleEdit(epi)}
                handleInfo={isNa ? undefined : () => setDetailEpi(epi)}
                infoTooltip="Ver detalhe completo do CA"
                name={isNa ? `${epi.equipment || 'EPI'}` : `CA: ${epi.ca}`}
                tooltip={
                  isNa
                    ? ''
                    : `CA ${epi.ca} - validade:(${dayjs(epi.expiredDate).format(
                        'DD/MM/YYYY',
                      )}) - ${epi.equipment}`
                }
                handleRemove={() =>
                  handleRemove({
                    epis: [epi.epiRiskData || epi],
                  })
                }
              />
            );
          })}
      <EpiCaDetailModal
        epi={detailEpi}
        open={!!detailEpi}
        onClose={() => setDetailEpi(null)}
      />
    </Box>
  );
};
