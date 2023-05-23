/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { FilterTag } from 'components/atoms/STable/components/STableFilter/FilterTag/FilterTag';
import SText from 'components/atoms/SText';
import { SelectForm } from 'components/molecules/form/select';
import { getHomoGroupName } from 'components/organisms/main/Tree/OrgTree/components/Selects/GhoSelect';
import { GhoSelect } from 'components/organisms/tagSelects/GhoSelect';
import { HierarchySelect } from 'components/organisms/tagSelects/HierarchySelect';
import { ProtocolSelect } from 'components/organisms/tagSelects/ProtocolSelect';
import { RiskSelect } from 'components/organisms/tagSelects/RiskSelect';

import { matrixRiskMap } from 'core/constants/maps/matriz-risk.constant';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IGho } from 'core/interfaces/api/IGho';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { isQuantity } from 'core/utils/helpers/isQuantity';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

import { IUseEditProtocol } from '../../hooks/useEditProtocols';

export const ModalProtocolStep = ({
  protocolData,
  control,
  setProtocolData,
  companyId,
  setValue,
}: IUseEditProtocol) => {
  return (
    <SFlex direction="column" mt={8}>
      <Box flex={1} mb={10}>
        <SText color="text.label" fontSize={14} mb={3}>
          Protocolo
        </SText>
        <ProtocolSelect
          sx={{ minWidth: '100%' }}
          asyncLoad
          large
          text={protocolData.protocol?.name || 'selecione um protocolo'}
          error={protocolData.error.protocol}
          tooltipTitle={protocolData.protocol?.name || ''}
          multiple={false}
          onlyProtocol
          borderActive={protocolData.protocol?.id ? 'info' : undefined}
          handleSelect={(option: any) =>
            option?.id &&
            setProtocolData({
              ...protocolData,
              error: { ...protocolData.error, protocol: false },
              protocol: option,
              protocolId: option.id,
            })
          }
        />
      </Box>

      <SFlex
        gap={5}
        mt={10}
        p={10}
        border="1px solid"
        borderColor="divider"
        direction="column"
        borderRadius={1}
        flexWrap="wrap"
      >
        <Box flex={1}>
          <SText color="text.label" fontSize={14} mb={3}>
            Vinular ao Risco
          </SText>
          <RiskSelect
            sx={{ minWidth: '100%' }}
            large
            error={protocolData.error.risk}
            tooltipTitle={protocolData.risk?.name || ''}
            borderActive={protocolData.risk?.id ? 'info' : undefined}
            handleSelect={(option: any) =>
              option.id &&
              setProtocolData({
                ...protocolData,
                error: { ...protocolData.error, risk: false },
                risk: option,
                riskId: option.id,
              })
            }
            text={protocolData.risk?.name || 'selecione um risco'}
            multiple={false}
          />
        </Box>
        <SText color="text.label" fontSize={14} mb={3} mt={5}>
          Grau de risco mínimo
        </SText>
        <SFlex gap={5} mt={2} maxWidth={400} flexWrap="wrap">
          <Box flex={1} width={200}>
            <SelectForm
              defaultValue={String(protocolData.minRiskDegree || 1)}
              label="Qualitativo"
              control={control}
              placeholder="grau de risco..."
              setValue={setValue}
              name="minRiskDegree"
              labelPosition="center"
              size="small"
              options={Object.values(matrixRiskMap)
                .filter((m) => m.level > 0 && m.level < 6)
                .map((value) => ({
                  value: value.level,
                  content: value.label,
                }))}
            />
          </Box>
          <Box flex={1} maxWidth={200}>
            {isQuantity(protocolData.risk) && (
              <SelectForm
                fullWidth
                defaultValue={String(protocolData.minRiskDegreeQuantity || 1)}
                label="Quantitativo"
                setValue={setValue}
                control={control}
                placeholder="grau de risco..."
                name="minRiskDegreeQuantity"
                labelPosition="center"
                size="small"
                options={Object.values(matrixRiskMap)
                  .filter((m) => m.level > 0 && m.level < 6)
                  .map((value) => ({
                    value: value.level,
                    content: value.label,
                  }))}
              />
            )}
          </Box>
        </SFlex>
      </SFlex>

      <SFlex
        gap={5}
        mt={10}
        p={10}
        direction="column"
        flexWrap="wrap"
        border="1px solid"
        borderColor="divider"
        borderRadius={1}
      >
        <SText color="text.label" fontSize={14} mb={3}>
          Vinular ao cargo, setor...
        </SText>
        <HierarchySelect
          tooltipText={(textField) => textField}
          allFilters
          defaultFilter={HierarchyEnum.OFFICE}
          text="Adicionar um Cargo"
          large
          icon={null}
          maxWidth={'auto'}
          handleSelect={(hierarchy: IHierarchy) => {
            setProtocolData({
              ...protocolData,
              hierarchies: removeDuplicate(
                [...protocolData.hierarchies, hierarchy],
                { removeById: 'id' },
              ),
            });
          }}
          companyId={companyId}
          active={false}
        />
        {protocolData.hierarchies.map((h) => {
          return (
            <FilterTag
              key={h.id}
              onRemove={() => {
                setProtocolData({
                  ...protocolData,
                  hierarchies: protocolData.hierarchies.filter(
                    (hierarchy) => hierarchy.id !== h.id,
                  ),
                });
              }}
              tag={{
                name: h.name || '',
                filterValue: h.id,
              }}
            />
          );
        })}
      </SFlex>
      <SFlex
        gap={5}
        mt={10}
        p={10}
        direction="column"
        flexWrap="wrap"
        border="1px solid"
        borderColor="divider"
        borderRadius={1}
      >
        <SText color="text.label" fontSize={14} mb={3}>
          Vinular ao GSE, Ambiente...
        </SText>
        <GhoSelect
          allFilters
          tooltipText={(textField) => textField}
          defaultFilter={HomoTypeEnum.GSE}
          text="Adicionar um GSE, Ambiente..."
          large
          icon={null}
          maxWidth={'auto'}
          handleSelect={(gse: IGho) => {
            setProtocolData({
              ...protocolData,
              homoGroups: removeDuplicate([...protocolData.homoGroups, gse], {
                removeById: 'id',
              }),
            });
          }}
          companyId={companyId}
          active={false}
        />
        {protocolData.homoGroups.map((homoGroup) => {
          return (
            <FilterTag
              maxWidth="100%"
              key={homoGroup.id}
              onRemove={() => {
                setProtocolData({
                  ...protocolData,
                  homoGroups: protocolData.homoGroups.filter(
                    (h) => homoGroup.id !== h.id,
                  ),
                });
              }}
              tag={{
                name: getHomoGroupName(homoGroup) || '',
                filterValue: homoGroup.id,
              }}
            />
          );
        })}
      </SFlex>
    </SFlex>
  );
};
