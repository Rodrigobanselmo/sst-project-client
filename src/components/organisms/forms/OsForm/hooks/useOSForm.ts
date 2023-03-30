import { useEffect, useState } from 'react';

import { initialCompanySelectState } from 'components/organisms/modals/ModalSelectCompany';
import { useRouter } from 'next/router';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { ICompany } from 'core/interfaces/api/ICompany';
import { useMutCopyOs } from 'core/services/hooks/mutations/manager/os/useMutCopyOs';
import { useMutUpsertOs } from 'core/services/hooks/mutations/manager/os/useMutUpsertOs/useMutUpsertOs';
import { useQueryOs } from 'core/services/hooks/queries/useQueryOs/useQueryOs';

export const osList = [
  {
    label: 'MEDIDAS DE CONTROLE EXISTENTE E EPIS DE USO OBRIGATÓRIO',
    field: 'med',
  },
  {
    label: 'RECOMENDAÇÕES',
    field: 'rec',
  },
  {
    label:
      'OBRIGAÇÕES DO FUNCIONÁRIO/SANÇÕES ADOTADAS AO NÃO CUMPRIMENTO DAS NORMAS E PROCEDIMENTOS DE SEGURANÇA',
    field: 'obligations',
  },
  {
    label: 'PROIBIÇÕES',
    field: 'prohibitions',
  },
  {
    label: 'PROCEDIMENTOS EM CASO DE ACIDENTE DO TRABALHO',
    field: 'procedures',
  },
  {
    label: 'ATRIBUIÇÕES DO MEMBRO DA CIPA',
    field: 'cipa',
  },
  {
    label: 'DECLARAÇÃO DO TRABALHADOR EXECUTANTE DAS OPERAÇÕES',
    field: 'declaration',
  },
];

export const romansNumbers = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
];

export const onDownloadOS = async (id: number, companyId?: string) => {
  if (companyId) {
    const path = RoutesEnum.PDF_OS.replace(':employeeId', String(id)).replace(
      ':companyId',
      companyId,
    );

    window.open(path, '_blank');
  }
};

export const useOSForm = () => {
  const { data: os, isLoading } = useQueryOs();
  const [data, setData] = useState(os || undefined);
  const { onStackOpenModal } = useModal();
  const { companyId } = useGetCompanyId();

  useEffect(() => {
    setData(os || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [os]);

  const updateMutation = useMutUpsertOs();
  const copyMutation = useMutCopyOs();

  const onSave = async () => {
    const dt = { ...data };
    if (dt) {
      Object.keys(dt).forEach((k) => {
        if (!(dt as any)[k]) (dt as any)[k] = '';
      });

      await updateMutation
        .mutateAsync(dt as any)
        .then(() => {})
        .catch(() => {});
    }
  };

  const onCopy = async () => {
    onStackOpenModal(ModalEnum.COMPANY_SELECT, {
      onSelect: (companySelected: ICompany) => {
        copyMutation
          .mutateAsync({ copyFromCompanyId: companySelected.id })
          .then(() => {})
          .catch(() => {});
      },
    } as Partial<typeof initialCompanySelectState>);
  };

  return {
    loading: updateMutation.isLoading || isLoading,
    onSave,
    data,
    setData,
    onCopy,
    onDownloadOS,
    companyId,
  };
};

export type IUseOsReturn = ReturnType<typeof useOSForm>;
