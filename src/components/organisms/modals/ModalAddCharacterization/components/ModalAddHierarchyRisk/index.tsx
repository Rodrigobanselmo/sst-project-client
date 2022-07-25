/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box, CircularProgress, Icon, styled } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STag } from 'components/atoms/STag';
import { STagAction } from 'components/atoms/STagAction';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import { SDisplaySimpleArray } from 'components/molecules/SDisplaySimpleArray';
import { STagSelect } from 'components/molecules/STagSelect';
import { IUseEditCharacterization } from 'components/organisms/modals/ModalAddCharacterization/hooks/useEditCharacterization';
import { EnvironmentTypeEnum } from 'project/enum/environment-type.enum';

import SAddIcon from 'assets/icons/SAddIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';
import { SEditIcon } from 'assets/icons/SEditIcon';
import SOrderIcon from 'assets/icons/SOrderIcon';

import { environmentMap } from 'core/constants/maps/environment.map';
import { floatMask } from 'core/utils/masks/float.mask';

import { IUseEditEnvironment } from '../../../ModalAddEnvironment/hooks/useEditEnvironment';
import { ModalParametersContentBasic } from '../ModalParametersBasic';

const StyledImage = styled('img')`
  width: 100px;
  border: 2px solid ${({ theme }) => theme.palette.grey[300]};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.4);
  margin-bottom: 8px;
  border-radius: 8px;
  object-fit: contain;
`;

export const ModalAddHierarchyRisk = ({
  onAddHierarchy,
  onAddRisk,
  hierarchies,
  query: characterizationQuery,
  dataLoading: characterizationLoading,
}: IUseEditEnvironment | IUseEditCharacterization) => {
  const loading = !!characterizationLoading;
  const dataQuery = characterizationQuery;

  return (
    <>
      <SFlex
        gap={8}
        direction="column"
        mt={8}
        p={5}
        borderRadius={1}
        border="1px solid"
        borderColor="grey.300"
        sx={{ backgroundColor: 'background.paper' }}
      >
        <SFlex>
          <STag action="info" text="Cargos" />
          <SText color="text.label" fontSize={14}>
            Vincular cargos ao ambiente
          </SText>
        </SFlex>
        {!loading && !!hierarchies?.length && (
          <SFlex gap={8} mt={0} flexWrap="wrap">
            {hierarchies.map((hierarchy) => {
              const fromTree = hierarchy && 'label' in hierarchy;
              const name = fromTree ? hierarchy.label : hierarchy.name;
              return (
                <SText
                  component="span"
                  key={hierarchy.id}
                  sx={{
                    fontSize: 12,
                    p: 4,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 1,
                    backgroundColor: 'background.box',
                  }}
                >
                  {name}
                </SText>
              );
            })}
          </SFlex>
        )}
        {loading && <CircularProgress color="primary" size={18} />}
        <STagButton
          large
          icon={SAddIcon}
          text="Adicionar cargos, setores ..."
          iconProps={{ sx: { fontSize: 17 } }}
          onClick={() => onAddHierarchy?.()}
          disabled={loading}
        />
      </SFlex>

      <SFlex
        gap={8}
        direction="column"
        mt={8}
        p={5}
        borderRadius={1}
        border="1px solid"
        borderColor="grey.300"
        sx={{ backgroundColor: 'background.paper' }}
      >
        <SFlex>
          <STag action="warning" text="Riscos" />
          <SText color="text.label" fontSize={14}>
            Vincular Fatores de Risco / Perigos ao ambiente
          </SText>
        </SFlex>
        {!loading &&
          dataQuery &&
          !!dataQuery.riskData &&
          !!dataQuery.riskData.length && (
            <SFlex gap={8} mt={0} flexWrap="wrap">
              {dataQuery.riskData.map((riskData) => {
                if (!riskData.riskFactor) return null;

                return (
                  <SText
                    component="span"
                    key={riskData.id}
                    sx={{
                      fontSize: 12,
                      p: 4,
                      border: '1px solid',
                      borderColor: 'grey.300',
                      borderRadius: 1,
                      backgroundColor: 'background.box',
                    }}
                  >
                    {riskData.riskFactor.name}
                  </SText>
                );
              })}
            </SFlex>
          )}
        {loading && <CircularProgress color="primary" size={18} />}
        <STagButton
          large
          icon={SAddIcon}
          text="Adicionar Fatores de risco e/ou Perigos ..."
          iconProps={{ sx: { fontSize: 17 } }}
          onClick={() => onAddRisk?.()}
          disabled={loading}
        />
      </SFlex>
    </>
  );
};
