/* eslint-disable quotes */
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import SDownloadIcon from 'assets/icons/SDownloadIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { useMutUpsertRiskGroupData } from 'core/services/hooks/mutations/checklist/useMutUpsertRiskGroupData';
import { useMutCopyCompany } from 'core/services/hooks/mutations/manager/useMutCopyCompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

import { StatusSelect } from '../../tagSelects/StatusSelect';
import { EmptyHierarchyData } from '../empty/EmptyHierarchyData';
import { initialCompanySelectState } from '../ModalSelectCompany';
import { initialDocPgrSelectState } from '../ModalSelectDocPgr';

export const initialRiskGroupState = {
  name: '',
  status: StatusEnum.PROGRESS,
  error: '',
  id: '',
  goTo: '',
};

export const ModalAddRiskGroup = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onOpenModal } = useModal();
  const mutation = useMutUpsertRiskGroupData();
  const { push } = useRouter();
  const initialDataRef = useRef(initialRiskGroupState);
  const { data: company } = useQueryCompany();
  const copyMutation = useMutCopyCompany();

  const { preventUnwantedChanges, preventWarn } = usePreventAction();
  const { enqueueSnackbar } = useSnackbar();

  const [riskGroupData, setRiskGroupData] = useState(initialRiskGroupState);

  const onClose = useCallback(() => {
    onCloseModal(ModalEnum.RISK_GROUP_ADD);
    setRiskGroupData(initialRiskGroupState);
  }, [onCloseModal]);

  const onSave = async () => {
    if (!riskGroupData.name) {
      setRiskGroupData({
        ...riskGroupData,
        error: 'A descrição é obrigatório',
      });
      return enqueueSnackbar('Descrição não pode estar vazio!', {
        variant: 'error',
      });
    }

    const doc = await mutation
      .mutateAsync({
        id: riskGroupData.id,
        name: riskGroupData.name,
        status: riskGroupData.status,
      })
      .catch(() => {});

    if (riskGroupData.goTo && doc)
      push(riskGroupData.goTo.replace(':docId', doc.id));

    onClose();
  };

  const onCloseUnsaved = () => {
    if (preventUnwantedChanges(riskGroupData, initialDataRef.current, onClose))
      return;
    onClose();
  };

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialRiskGroupState>>(
      ModalEnum.RISK_GROUP_ADD,
    );

    if (initialData) {
      setRiskGroupData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData]);

  const handleCopyCompany = useCallback(() => {
    onOpenModal(ModalEnum.COMPANY_SELECT, {
      onSelect: (company: ICompany) =>
        onOpenModal(ModalEnum.DOC_PGR_SELECT, {
          companyId: company.id,
          removeIds: [riskGroupData.id],
          title: 'Selecione de qual documento PGR deseja copiar',
          onSelect: (docPgr: IRiskGroupData) =>
            preventWarn(
              <SText textAlign={'justify'}>
                Você tem certeza que deseja importar da empresa{' '}
                <b> {company.name}</b> todos os dados de:
                <ul>
                  <li>Caracterização Básica</li>
                  <li>Grupos homogênios</li>
                  <li>Fatores de riscos/perigos</li>
                </ul>
                <br />
                <b>OBS:</b> Serão importados somente os dados que estiverem
                vincúlados a <b>cargos, setores, etc</b> que possuirem
                exatamente o mesmo nome e hierarquia.
              </SText>,
              () =>
                copyMutation
                  .mutateAsync({
                    copyFromCompanyId: company.id,
                    docId: docPgr.id,
                  })
                  .then((doc) => {
                    if (riskGroupData.goTo && doc)
                      push(riskGroupData.goTo.replace(':docId', doc.id));
                    onClose();
                  })
                  .catch(() => {}),
              { confirmText: 'Importar' },
            ),
        } as Partial<typeof initialDocPgrSelectState>),
    } as Partial<typeof initialCompanySelectState>);
  }, [
    copyMutation,
    onClose,
    onOpenModal,
    preventWarn,
    push,
    riskGroupData.goTo,
    riskGroupData.id,
  ]);

  const buttons = [
    {},
    {
      text: 'ok',
      onClick: onSave,
      variant: 'contained',
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.RISK_GROUP_ADD)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper p={8}>
        <SModalHeader
          tag={riskGroupData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={riskGroupData.id ? 'PGR' : 'Novo documento PGR'}
        />
        {company.hierarchyCount ? (
          <>
            <Box mt={8}>
              <SInput
                autoFocus
                value={riskGroupData.name}
                onChange={(e) =>
                  setRiskGroupData((data) => ({
                    ...data,
                    error: '',
                    name: e.target.value,
                  }))
                }
                error={!!riskGroupData.error}
                helperText={riskGroupData.error}
                sx={{ width: ['100%', 600] }}
                placeholder={'Nome do documento PGR...'}
              />
            </Box>
            <SFlex gap={8} mt={10} align="center">
              <StatusSelect
                selected={riskGroupData.status}
                statusOptions={[
                  StatusEnum.PROGRESS,
                  StatusEnum.ACTIVE,
                  StatusEnum.INACTIVE,
                ]}
                handleSelectMenu={(option) =>
                  setRiskGroupData({ ...riskGroupData, status: option.value })
                }
              />
              <STagButton
                icon={SDownloadIcon}
                text="Importar de outra empresa"
                large
                onClick={handleCopyCompany}
              />
            </SFlex>
          </>
        ) : (
          <EmptyHierarchyData />
        )}

        <SModalButtons
          loading={mutation.isLoading || copyMutation.isLoading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
