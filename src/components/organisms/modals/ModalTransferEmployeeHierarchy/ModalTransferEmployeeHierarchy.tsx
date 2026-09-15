/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { SelectForm } from 'components/molecules/form/select';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { HierarchySelect } from 'components/organisms/tagSelects/HierarchySelect';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { dateToDate, dateToString } from 'core/utils/date/date-format';

import { useTransferEmployeeHierarchy } from './hooks/useTransferEmployeeHierarchy';
import { employeeHierarchyTransferMotiveList } from './transfer-motives';

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <Box>
      <SText color="text.label" fontSize={12} mb={1}>
        {label}
      </SText>
      <SText fontSize={14}>{value || '—'}</SText>
    </Box>
  );
}

export const ModalTransferEmployeeHierarchy = () => {
  const {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading,
    data,
    setData,
    control,
    handleSubmit,
    modalName,
    companyId,
    companyWorkspaces,
    currentAllocation,
    setValue,
  } = useTransferEmployeeHierarchy();

  const buttons = [
    {},
    {
      text: 'Alterar lotação',
      variant: 'contained',
      type: 'submit',
      onClick: () => setData({ ...data }),
    },
  ] as IModalButton[];

  const destinationReady = !!data.workspaceId;

  return (
    <SModal
      {...registerModal(modalName)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper
        center
        width={['100%', 860]}
        sx={{
          minHeight: ['100%', 480],
          display: 'flex',
          flexDirection: 'column',
        }}
        p={8}
        component="form"
        onSubmit={(handleSubmit as any)(onSubmit)}
      >
        <SModalHeader
          tag="edit"
          onClose={onCloseUnsaved}
          title="Alterar lotação"
        />

        <SFlex gap={8} flexWrap="wrap" mb={6}>
          <Box
            sx={{
              flex: 1,
              minWidth: 280,
              p: 5,
              border: '1px solid',
              borderColor: 'background.divider',
              borderRadius: 1,
            }}
          >
            <SText fontWeight={700} mb={4}>
              DE
            </SText>
            {currentAllocation.isSharedAcrossWorkspaces ? (
              <Box mb={4}>
                <SText color="text.label" fontSize={12} mb={1}>
                  Estabelecimentos
                </SText>
                <SText fontSize={14} mb={1}>
                  {currentAllocation.workspaces
                    .map((workspace) => workspace.name)
                    .join(', ')}
                </SText>
                <SText fontSize={12} color="text.secondary">
                  Este cargo está vinculado a mais de um estabelecimento. A
                  lotação atual não escolhe um estabelecimento automaticamente.
                </SText>
              </Box>
            ) : (
              <Box mb={4}>
                <ReadOnlyField
                  label="Estabelecimento"
                  value={currentAllocation.workspaces[0]?.name}
                />
              </Box>
            )}
            <SFlex direction="column" gap={3}>
              <ReadOnlyField label="Setor" value={currentAllocation.sectorName} />
              <ReadOnlyField label="Cargo" value={currentAllocation.officeName} />
              {currentAllocation.developedRoleNames.length > 0 && (
                <ReadOnlyField
                  label="Cargo desenvolvido"
                  value={currentAllocation.developedRoleNames.join(', ')}
                />
              )}
            </SFlex>
            {!currentAllocation.hierarchyId && (
              <SText mt={4} fontSize={12} color="text.secondary">
                Não há lotação atual neste funcionário.
              </SText>
            )}
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: 280,
              p: 5,
              border: '1px solid',
              borderColor: 'background.divider',
              borderRadius: 1,
            }}
          >
            <SText fontWeight={700} mb={4}>
              PARA
            </SText>
            <SelectForm
              defaultValue={String(data.workspaceId || '')}
              setValue={setValue}
              label="Estabelecimento destino"
              control={control}
              placeholder="Selecione o estabelecimento"
              name="workspaceId"
              labelPosition="top"
              size="small"
              onChange={(e) => {
                const workspaceId = String(e.target.value || '');
                setData({
                  ...data,
                  workspaceId,
                  sector: undefined,
                  hierarchy: undefined,
                  hierarchyId: undefined,
                  subOffice: undefined,
                  errors: {
                    ...data.errors,
                    workspace: false,
                    sector: false,
                    hierarchy: false,
                  },
                });
              }}
              options={companyWorkspaces.map((workspace) => ({
                value: workspace.id,
                content: workspace.name,
              }))}
            />
            {!destinationReady && (
              <SText mt={3} fontSize={12} color="text.secondary">
                Selecione o estabelecimento destino para filtrar setor e cargo.
              </SText>
            )}
            <SFlex
              direction="column"
              gap={4}
              mt={5}
              sx={{ opacity: destinationReady ? 1 : 0.55 }}
            >
              <HierarchySelect
                key={`sector-${data.workspaceId || 'none'}`}
                tooltipText={(textField) => textField}
                filterOptions={[HierarchyEnum.SECTOR]}
                defaultFilter={HierarchyEnum.SECTOR}
                text={
                  data.sector?.name ? data.sector.name : 'Selecione um setor'
                }
                large
                icon={null}
                error={data.errors.sector}
                maxWidth={'auto'}
                workspaceId={data.workspaceId}
                disabled={!destinationReady}
                handleSelect={(hierarchy: IHierarchy) =>
                  setData({
                    ...data,
                    sector: hierarchy,
                    hierarchy: undefined,
                    hierarchyId: undefined,
                    subOffice: undefined,
                    errors: { ...data.errors, sector: false },
                  })
                }
                companyId={companyId}
                selectedId={data.sector?.id}
                borderActive={data.sector?.id ? 'info' : undefined}
                active={false}
                bg={'background.paper'}
              />
              <HierarchySelect
                key={`office-${data.workspaceId || 'none'}-${data.sector?.id || 'none'}`}
                tooltipText={(textField) => textField}
                filterOptions={[HierarchyEnum.OFFICE]}
                defaultFilter={HierarchyEnum.OFFICE}
                text="Selecione um cargo"
                large
                icon={null}
                maxWidth={'auto'}
                parentId={data.sector?.id}
                workspaceId={data.workspaceId}
                disabled={!destinationReady}
                error={data.errors.hierarchy}
                handleSelect={(hierarchy: IHierarchy, parents) => {
                  const parentSector =
                    parents &&
                    parents.find(
                      (item) => item.type == HierarchyEnum.SECTOR,
                    );

                  setData({
                    ...data,
                    hierarchy,
                    hierarchyId: hierarchy?.id || undefined,
                    sector: parentSector || data.sector,
                    subOffice: undefined,
                    errors: {
                      ...data.errors,
                      sector: false,
                      hierarchy: false,
                    },
                  });
                }}
                companyId={companyId}
                selectedId={data.hierarchy?.id}
                active={false}
                borderActive={data.hierarchy?.id ? 'info' : undefined}
                bg={'background.paper'}
              />
              {data.hierarchy?.id && (
                <HierarchySelect
                  key={`sub-${data.hierarchy.id}`}
                  tooltipText={(textField) => textField}
                  filterOptions={[HierarchyEnum.SUB_OFFICE]}
                  defaultFilter={HierarchyEnum.SUB_OFFICE}
                  text="Selecione um cargo desenvolvido"
                  large
                  icon={null}
                  maxWidth={'auto'}
                  parentId={data.hierarchy?.id}
                  workspaceId={data.workspaceId}
                  handleSelect={(hierarchy: IHierarchy) => {
                  setData({
                    ...data,
                    subOffice: hierarchy?.id ? hierarchy : undefined,
                  });
                }}
                  companyId={companyId}
                  selectedId={data.subOffice?.id}
                  active={false}
                  borderActive={data.subOffice?.id ? 'info' : undefined}
                  bg={'background.paper'}
                />
              )}
            </SFlex>
          </Box>
        </SFlex>

        <SFlex gap={8} flexWrap="wrap" mb={4} align="flex-start">
          <DatePickerForm
            setValue={setValue}
            label="Data de início"
            control={control}
            defaultValue={dateToDate(data.startDate)}
            sx={{ maxWidth: 200 }}
            placeholderText="__/__/__"
            name="startDate"
            labelPosition="top"
            onChange={(date) => {
              setData({
                ...data,
                startDate: date instanceof Date ? date : undefined,
              });
            }}
          />
          <Box flex={1} minWidth={220}>
            <SelectForm
              defaultValue={String(data.motive || '')}
              setValue={setValue}
              label="Motivo"
              control={control}
              placeholder="Selecione o motivo"
              name="motive"
              labelPosition="top"
              onChange={(e) => {
                if (e.target.value)
                  setData({
                    ...data,
                    motive: (e as any).target.value,
                  });
              }}
              size="small"
              options={employeeHierarchyTransferMotiveList}
            />
          </Box>
        </SFlex>

        {currentAllocation.lastStartDate && (
          <SText fontSize={12} color="text.secondary" mb={5}>
            Última movimentação em{' '}
            {dateToString(new Date(currentAllocation.lastStartDate))}. A data
            de início precisa ser posterior, conforme a regra da API.
          </SText>
        )}

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
