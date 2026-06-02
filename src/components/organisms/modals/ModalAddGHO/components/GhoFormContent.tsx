/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Wizard } from 'react-use-wizard';

import { Box } from '@mui/material';
import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { HierarchyHomoTable } from 'components/organisms/tables/HierarchyHomoTable/HierarchyHomoTable';
import { useRouter } from 'next/router';

import { IdsEnum } from 'core/enums/ids.enums';
import { IGho } from 'core/interfaces/api/IGho';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import {
  Control,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormSetValue,
} from 'react-hook-form';

import { EditGhoSelects } from './EditGhoSelects';
import { RiskToolForGse } from './RiskToolForGse';
import { initialAddGhoState } from '../hooks/useAddGho';

export type GhoAddLayout = 'modal' | 'page';

type GhoFormContentProps = {
  layout: GhoAddLayout;
  ghoData: typeof initialAddGhoState;
  ghoQuery: IGho;
  setGhoData: React.Dispatch<React.SetStateAction<typeof initialAddGhoState>>;
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  handleSubmit: UseFormHandleSubmit<any>;
  onSubmit: SubmitHandler<{ name: string; description: string }>;
  onCloseUnsaved: () => void;
  onRemove: () => void;
  onAddHierarchy: () => void;
  hierarchies: IHierarchy[];
  loadingQuery: boolean;
  loading: boolean;
};

export const GhoFormContent = ({
  layout,
  ghoData,
  ghoQuery,
  setGhoData,
  control,
  setValue,
  handleSubmit,
  onSubmit,
  onCloseUnsaved,
  onRemove,
  onAddHierarchy,
  hierarchies,
  loadingQuery,
  loading,
}: GhoFormContentProps) => {
  const router = useRouter();
  const companyId = router.query.companyId as string;
  const title = ghoData.id ? 'Editar GSE' : 'Grupo similar de exposição';
  const submitLabel = ghoData.id ? 'Salvar' : 'Criar';
  const isPage = layout === 'page';
  const isEdit = !!ghoData.id;
  const risksTabDisabled = !isEdit;

  const wizardTabsOptions = isPage
    ? [
        { label: 'Dados' },
        { label: 'Cargos' },
        { label: 'Fatores de Riscos', disabled: risksTabDisabled },
      ]
    : [{ label: 'Dados' }, { label: 'Cargos' }];

  const wizard = (
    <Wizard
      header={
        <WizardTabs
          shadow
          {...(isPage && {
            onChangeTab: (index, cb) =>
              risksTabDisabled && index === 2 ? undefined : cb(index),
          })}
          options={wizardTabsOptions}
        />
      }
    >
      <Box sx={{ px: isPage ? 0 : 2, pt: 6, pb: 4 }}>
        <SFlex gap={8} direction="column">
          <InputForm
            setValue={setValue}
            autoFocus
            defaultValue={ghoData.name}
            minRows={2}
            maxRows={4}
            label="Nome"
            control={control}
            sx={{ width: '100%' }}
            placeholder="nome do GSE..."
            name="name"
            size="small"
          />
          <InputForm
            multiline
            defaultValue={ghoData.description || ghoQuery.description}
            minRows={2}
            setValue={setValue}
            maxRows={4}
            label="Descrição"
            control={control}
            sx={{ width: '100%' }}
            placeholder="descrição do GSE..."
            name="description"
            size="small"
          />
          <EditGhoSelects
            ghoQuery={ghoQuery}
            ghoData={ghoData}
            setGhoData={setGhoData}
          />
        </SFlex>
      </Box>

      <Box sx={{ px: isPage ? 0 : 2, pt: 6, pb: 4 }}>
        <HierarchyHomoTable
          onAdd={onAddHierarchy}
          loading={loadingQuery}
          hierarchies={hierarchies as any}
        />
      </Box>

      {isPage && (
        <Box sx={{ px: 0, pb: 4 }}>
          {!isEdit ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 200,
              }}
            >
              <SText variant="body1" textAlign="center">
                Salve o GSE antes de vincular fatores de risco.
              </SText>
            </Box>
          ) : (
            <RiskToolForGse
              companyId={companyId}
              ghoId={ghoData.id}
              ghoName={ghoData.name || ghoQuery.name}
              gho={ghoQuery?.id ? (ghoQuery as IGho) : null}
            />
          )}
        </Box>
      )}
    </Wizard>
  );

  if (isPage) {
    return (
      <Box
        component="form"
        onSubmit={(handleSubmit as any)(onSubmit)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          width: '100%',
        }}
      >
        <SFlex
          align="center"
          justify="space-between"
          gap={3}
          flexWrap="wrap"
          sx={{ flexShrink: 0, mb: 4 }}
        >
          <SPageHeader mb={0} title={title} onBack={onCloseUnsaved} />
          <SFlex align="center" gap={3} flexWrap="wrap" justifyContent="flex-end">
            {ghoData.id && (
              <SButton variant="outlined" onClick={onRemove}>
                Excluir
              </SButton>
            )}
            <SButton
              variant="outlined"
              style={{ minWidth: 100 }}
              id={IdsEnum.CANCEL_BUTTON}
              onClick={onCloseUnsaved}
            >
              Cancelar
            </SButton>
            <SButton
              variant="contained"
              type="submit"
              style={{ minWidth: 100 }}
              loading={loading}
              onClick={() => setGhoData({ ...ghoData })}
            >
              {submitLabel}
            </SButton>
          </SFlex>
        </SFlex>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            pr: 0.5,
          }}
        >
          {wizard}
        </Box>
      </Box>
    );
  }

  return <Box mt={6}>{wizard}</Box>;
};
