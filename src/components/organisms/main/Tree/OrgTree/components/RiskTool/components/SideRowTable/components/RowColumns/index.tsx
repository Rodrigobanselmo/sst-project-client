/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { STag } from 'components/atoms/STag';
import { ITagActionColors } from 'components/atoms/STag/types';

import { IdsEnum } from 'core/enums/ids.enums';
import { getMatrizRisk } from 'core/utils/helpers/matriz';

import { useRowColumns } from '../../../../hooks/useRowColumns';
import { STGridItem } from '../../styles';
import { AdmColumn } from '../columns/AdmColumn';
import { EngColumn } from '../columns/EngColumn';
import { EpiColumn } from '../columns/EpiColumn';
import { ExamColumn } from '../columns/ExamColumn';
import { ProbabilityAfterColumn } from '../columns/ProbabilityAfterColumn';
import { ProbabilityColumn } from '../columns/ProbabilityColumn';
import { RecColumn } from '../columns/RecColumn';
import { SourceColumn } from '../columns/SourceColumn';
import { RowColumnsProps } from './types';

export const RowColumns: FC<RowColumnsProps> = ({
  handleSelect,
  handleRemove,
  riskData,
  risk,
  handleEditEpi,
  handleEditEngs,
  handleEditExams,
  handleHelp,
  isSelected,
  hide,
  selectedRisks,
  isRepresentAll,
  ...props
}) => {
  const { columns } = useRowColumns();

  //! can improve by using riskData.ro (cant use now because need to include risk on risk data, to do that is good to change the actual risk load to be partial load - to not load risk twice)
  //! problem is that will lose the risk / rec / med fuse search and need to see alternative on postgres
  const actualMatrixLevel = getMatrizRisk(
    riskData?.probability,
    risk?.severity,
  );

  const actualMatrixLevelAfter = getMatrizRisk(
    riskData?.probabilityAfter,
    risk?.severity,
  );

  return (
    <STGridItem
      sx={{ gridTemplateColumns: columns.map((row) => row.grid).join(' ') }}
      onClick={() =>
        risk?.id ? null : document.getElementById(IdsEnum.RISK_SELECT)?.click()
      }
      selected={isSelected ? 1 : 0}
      {...props}
    >
      {!hide && (
        <>
          {!isRepresentAll ? (
            <SourceColumn
              handleSelect={handleSelect}
              handleRemove={handleRemove}
              data={riskData}
              risk={risk}
            />
          ) : (
            <div />
          )}
          <EpiColumn
            handleSelect={handleSelect}
            handleEdit={handleEditEpi}
            handleRemove={handleRemove}
            data={riskData}
            risk={risk}
          />
          <EngColumn
            handleSelect={handleSelect}
            handleEdit={handleEditEngs}
            handleRemove={handleRemove}
            data={riskData}
            risk={risk}
          />
          <AdmColumn
            handleSelect={handleSelect}
            handleRemove={handleRemove}
            data={riskData}
            risk={risk}
          />
          {!isRepresentAll ? (
            <>
              <ProbabilityColumn
                handleHelp={handleHelp}
                handleSelect={handleSelect}
                data={riskData}
                risk={risk && (selectedRisks?.length ?? 1) === 1 ? risk : null}
              />
              <STag
                action={
                  String(
                    actualMatrixLevel?.level,
                  ) as unknown as ITagActionColors
                }
                text={actualMatrixLevel?.label || '--'}
                maxHeight={24}
              />
            </>
          ) : (
            <>
              <div />
              <div />
            </>
          )}
          <ExamColumn
            handleSelect={handleSelect}
            handleEdit={handleEditExams}
            handleRemove={handleRemove}
            data={riskData}
            risk={risk}
            hideStandard={isRepresentAll}
          />
          <RecColumn
            handleSelect={handleSelect}
            handleRemove={handleRemove}
            data={riskData}
            risk={risk}
          />
          {!isRepresentAll ? (
            <>
              <ProbabilityAfterColumn
                handleSelect={handleSelect}
                data={riskData}
              />
              <STag
                action={
                  String(
                    actualMatrixLevelAfter?.level,
                  ) as unknown as ITagActionColors
                }
                maxHeight={24}
                text={actualMatrixLevelAfter?.label || '--'}
              />
            </>
          ) : (
            <>
              <div />
              <div />
            </>
          )}
        </>
      )}
    </STGridItem>
  );
};
