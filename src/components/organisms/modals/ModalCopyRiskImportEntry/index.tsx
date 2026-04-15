import React, { FC, useEffect, useMemo, useRef, useState } from 'react';

import {
  Autocomplete,
  Box,
  TextField,
  createFilterOptions,
} from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { initialCompanySelectState } from 'components/organisms/modals/ModalSelectCompany';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { QueryEnum } from 'core/enums/query.enums';
import { ICompany, IWorkspace } from 'core/interfaces/api/ICompany';
import { queryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQuery } from 'react-query';

export const initialCopyRiskImportEntryState = {
  onContinue: (_ctx: { sourceCompanyId: string; workspaceId?: string }) => {},
  defaultCompanyId: '' as string,
  defaultWorkspaceId: '' as string | undefined,
};

const modalName = ModalEnum.COPY_RISK_IMPORT_ENTRY;

const workspaceFilterOptions = createFilterOptions<IWorkspace>({
  stringify: (option) => option.name || option.id,
});

/** Popper do Autocomplete no body: z-index acima do SModal deste fluxo (5000). */
const workspaceAutocompletePopperProps = {
  sx: { zIndex: 6000 },
} as const;

export const ModalCopyRiskImportEntry: FC = () => {
  const { registerModal, getModalData, findModalData, currentModal } =
    useRegisterModal();
  const { onCloseModal, onStackOpenModal } = useModal();
  const [selectData, setSelectData] = useState(initialCopyRiskImportEntryState);
  const [sourceCompanyId, setSourceCompanyId] = useState('');
  const [workspaceId, setWorkspaceId] = useState<string | undefined>(undefined);
  /** Evita sobrescrever a empresa escolhida ao voltar do COMPANY_SELECT (getModalData reaplica defaultCompanyId). */
  const skipDefaultCompanyHydrateRef = useRef(false);

  useEffect(() => {
    const fromTop = getModalData(
      modalName,
    ) as typeof initialCopyRiskImportEntryState;
    const fromStack = findModalData(
      modalName,
    ) as typeof initialCopyRiskImportEntryState;
    const initialData =
      fromTop && Object.keys(fromTop).length ? fromTop : fromStack;

    if (
      initialData &&
      Object.keys(initialData).length &&
      !(initialData as any).passBack
    ) {
      setSelectData((prev) => ({ ...prev, ...initialData }));
      if (!skipDefaultCompanyHydrateRef.current) {
        setSourceCompanyId(initialData.defaultCompanyId || '');
        setWorkspaceId(initialData.defaultWorkspaceId);
      }
    }
  }, [currentModal, findModalData, getModalData]);

  const { data: sourceCompany } = useQuery(
    [QueryEnum.COMPANY, 'copy-risk-import', sourceCompanyId],
    () => queryCompany(sourceCompanyId),
    {
      enabled: !!sourceCompanyId,
      staleTime: 1000 * 60 * 5,
    },
  );

  const workspaces = (sourceCompany as ICompany | undefined)?.workspace || [];

  const sortedWorkspaces = useMemo(
    () =>
      [...workspaces].sort((a, b) =>
        (a.name || a.id).localeCompare(b.name || b.id, 'pt-BR', {
          sensitivity: 'base',
        }),
      ),
    [workspaces],
  );

  const showWorkspaceSelect = workspaces.length > 1;

  const effectiveWorkspaceId = useMemo(() => {
    if (!workspaces.length) return undefined;
    if (workspaces.length === 1) return String(workspaces[0].id);
    return workspaceId;
  }, [workspaces, workspaceId]);

  useEffect(() => {
    if (showWorkspaceSelect && workspaceId) {
      const ok = sortedWorkspaces.some((w) => String(w.id) === workspaceId);
      if (!ok && sortedWorkspaces[0])
        setWorkspaceId(String(sortedWorkspaces[0].id));
    }
    if (showWorkspaceSelect && !workspaceId && sortedWorkspaces[0]) {
      setWorkspaceId(String(sortedWorkspaces[0].id));
    }
  }, [showWorkspaceSelect, sortedWorkspaces, workspaceId]);

  const onCloseNoSelect = () => {
    skipDefaultCompanyHydrateRef.current = false;
    setSelectData(initialCopyRiskImportEntryState);
    setSourceCompanyId('');
    setWorkspaceId(undefined);
    onCloseModal(modalName);
  };

  const handleOtherCompany = () => {
    skipDefaultCompanyHydrateRef.current = true;
    onStackOpenModal(ModalEnum.COMPANY_SELECT, {
      multiple: false,
      onSelect: (company: ICompany) => {
        setSourceCompanyId(company.id);
        setWorkspaceId(undefined);
        onCloseModal(ModalEnum.COMPANY_SELECT);
      },
    } as Partial<typeof initialCompanySelectState>);
  };

  const handleContinue = () => {
    if (!sourceCompanyId) return;
    selectData.onContinue({
      sourceCompanyId,
      workspaceId: effectiveWorkspaceId,
    });
    onCloseNoSelect();
  };

  const buttons = [
    {},
    {
      text: 'Continuar',
      variant: 'contained',
      onClick: handleContinue,
      disabled: !sourceCompanyId || (showWorkspaceSelect && !effectiveWorkspaceId),
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(modalName)}
      keepMounted
      onClose={onCloseNoSelect}
      sx={{ zIndex: 5000 }}
    >
      <SModalPaper sx={{ minWidth: ['95%', 480, 520] }} center p={8}>
        <SModalHeader
          tag="select"
          onClose={onCloseNoSelect}
          title="Importar riscos — origem"
        />
        <Box mt={6}>
          <SText fontSize={14} color="text.light" mb={2}>
            Empresa de origem (cópia)
          </SText>
          <SText fontWeight={600} fontSize={16}>
            {sourceCompany?.name || '—'}
          </SText>
          <SButton
            variant="text"
            size="small"
            sx={{ mt: 1, p: 0, minWidth: 0 }}
            onClick={handleOtherCompany}
          >
            Usar outra empresa
          </SButton>

          {showWorkspaceSelect ? (
            <Autocomplete<IWorkspace, false, false, false>
              fullWidth
              size="small"
              sx={{ mt: 4 }}
              options={sortedWorkspaces}
              filterOptions={workspaceFilterOptions}
              getOptionLabel={(w) => w.name || w.id}
              value={
                sortedWorkspaces.find((w) => String(w.id) === workspaceId) ??
                null
              }
              onChange={(_, option) => {
                setWorkspaceId(option ? String(option.id) : undefined);
              }}
              isOptionEqualToValue={(a, b) => String(a.id) === String(b.id)}
              componentsProps={{
                popper: workspaceAutocompletePopperProps,
              }}
              ListboxProps={{ style: { maxHeight: 320 } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Estabelecimento de origem"
                  placeholder="Buscar por nome…"
                />
              )}
            />
          ) : null}

          <SText fontSize={12} color="text.light" mt={4}>
            Na próxima etapa você escolhe o grupo de riscos (caracterização) de
            origem na empresa e estabelecimento indicados acima. A empresa e o
            estabelecimento da tela atual não são alterados.
          </SText>
        </Box>
        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
