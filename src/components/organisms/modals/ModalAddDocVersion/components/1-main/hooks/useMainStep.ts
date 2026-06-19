import { useCallback, useEffect, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import clone from 'clone';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';

import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import {
  IUpsertPGRDocumentData,
  useMutUpsertPGRDocumentData,
} from 'core/services/hooks/mutations/checklist/documentData/useMutUpsertPGRDocumentData/useMutUpsertPGRDocumentData';
import { useMutUpsertPCSMODocumentData } from 'core/services/hooks/mutations/checklist/documentData/useMutUpsertPCSMOODocumentData/useMutUpsertPCSMODocumentData';
import { useMutUpsertPERICULOSIDADEDocumentData } from 'core/services/hooks/mutations/checklist/documentData/useMutUpsertPERICULOSIDADEDocumentData/useMutUpsertPERICULOSIDADEDocumentData';
import { useMutUpsertLTCATDocumentData } from 'core/services/hooks/mutations/checklist/documentData/useMutUpsertLTCATDocumentData/useMutUpsertLTCATDocumentData';
import { useMutUpsertINSALUBRIDADEDocumentData } from 'core/services/hooks/mutations/checklist/documentData/useMutUpsertINSALUBRIDADEDocumentData/useMutUpsertINSALUBRIDADEDocumentData';
import { useMutUpsertFRPSDocumentData } from 'core/services/hooks/mutations/checklist/documentData/useMutUpsertFRPSDocumentData/useMutUpsertFRPSDocumentData';
import { useMutAddQueueDocs } from 'core/services/hooks/mutations/checklist/documentData/useMutAddQueueDocs/useMutAddQueueDocs';
import { queryDocVersions } from 'core/services/hooks/queries/useQueryDocVersions/useQueryDocVersions';
import { queryGroupDocumentData } from 'core/services/hooks/queries/useQueryDocumentData/useQueryDocumentData';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { dateFormat } from 'core/utils/date/date-format';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { DocumentTypeEnum } from 'project/enum/document.enums';

import {
  computeValidityEnd,
  CREATION_DATE_LOCKED_MESSAGE,
  DocumentVersionFamily,
  EMISSION_BEFORE_CREATION_MESSAGE,
  hasCreationDateChanged,
  isEmissionBeforeCreation,
} from '../../../helpers/document-dates.helpers';
import {
  resolveDocumentDateFromForm,
  shouldWarnRevisionDateChange,
} from '../../../helpers/document-version.helpers';
import { IUseMainActionsModal } from '../../../hooks/useMainActions';
import { useDocumentFormDates } from './useDocumentFormDates';
import {
  DocumentFilterSelection,
  emptyDocumentFilterSelection,
} from '../../last-version/document-filter.types';

const REVISION_DATE_WARNING_MESSAGE = `Você está gerando uma nova revisão de um documento que possui controle de versões.

A data informada poderá ficar anterior ou posterior às revisões já existentes no documento.

Confirme que essa data está correta antes de continuar.`;

export const useMainStep = ({
  data,
  setData,
  initialDataRef,
  doc,
  onClose,
  ...rest
}: IUseMainActionsModal) => {
  const { data: company } = useQueryCompany(data.companyId);
  const { trigger, getValues, setValue, control, setError, reset } =
    useFormContext();
  const { enqueueSnackbar } = useSnackbar();
  const { showConfirmation } = useConfirmationModal();
  const [documentFilters, setDocumentFilters] = useState<DocumentFilterSelection>(
    () => emptyDocumentFilterSelection(),
  );
  const documentFiltersRef = useRef(documentFilters);
  const emissionDateManuallyEditedRef = useRef(false);

  useEffect(() => {
    documentFiltersRef.current = documentFilters;
  }, [documentFilters]);

  const onFamilyDefaultsApplied = useCallback(() => {
    emissionDateManuallyEditedRef.current = false;
  }, []);

  const {
    creationDateLocked,
    lockedCreationDate,
    nextVersion,
    onVersionFamilyChange,
  } = useDocumentFormDates({
    data,
    setData,
    doc,
    onFamilyDefaultsApplied,
  });

  const updateMutation = useMutUpsertPGRDocumentData();
  const updatePcmsoMutation = useMutUpsertPCSMODocumentData();
  const updatePericulosidadeMutation = useMutUpsertPERICULOSIDADEDocumentData();
  const updateLtcatMutation = useMutUpsertLTCATDocumentData();
  const updateInsalubridadeMutation = useMutUpsertINSALUBRIDADEDocumentData();
  const updateFrpsMutation = useMutUpsertFRPSDocumentData();
  const createDoc = useMutAddQueueDocs();

  const watchedCreationDate = useWatch({ control, name: 'documentCreatedAt' });
  const watchedEmissionDate = useWatch({ control, name: 'documentDate' });
  const isSyncingEmissionRef = useRef(false);

  // Primeira versão da série: emissão deve ser sempre igual à criação.
  useEffect(() => {
    if (!watchedCreationDate || creationDateLocked) return;

    if (
      !watchedEmissionDate ||
      !dayjs(watchedEmissionDate).isSame(watchedCreationDate, 'day')
    ) {
      isSyncingEmissionRef.current = true;
      setValue('documentDate', watchedCreationDate);
    }
  }, [
    watchedCreationDate,
    watchedEmissionDate,
    creationDateLocked,
    setValue,
  ]);

  // Revisões seguintes: emissão editável (padrão = hoje).
  useEffect(() => {
    if (!creationDateLocked || !watchedEmissionDate) return;

    if (isSyncingEmissionRef.current) {
      isSyncingEmissionRef.current = false;
      return;
    }

    if (
      watchedCreationDate &&
      !dayjs(watchedEmissionDate).isSame(watchedCreationDate, 'day')
    ) {
      emissionDateManuallyEditedRef.current = true;
    }
  }, [creationDateLocked, watchedCreationDate, watchedEmissionDate]);

  const fields = [
    'name',
    'doc_description',
    'approvedBy',
    'elaboratedBy',
    'revisionBy',
    'coordinatorBy',
    'legalResponsibleBy',
    'versionFamily',
    'version',
    'documentCreatedAt',
    'documentDate',
    'validityYears',
    'validityMonths',
  ];

  const onCloseUnsaved = async () => {
    rest.onCloseUnsaved();
    reset();
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);
    if (!isValid) return;

    const {
      name,
      doc_description,
      approvedBy,
      elaboratedBy,
      revisionBy,
      coordinatorBy,
      legalResponsibleBy,
      documentCreatedAt,
      documentDate,
      validityYears,
      validityMonths,
      version,
    } = getValues();

    const creationDate =
      documentCreatedAt instanceof Date
        ? documentCreatedAt
        : new Date(documentCreatedAt);

    if (
      creationDateLocked &&
      lockedCreationDate &&
      hasCreationDateChanged(lockedCreationDate, creationDate)
    ) {
      return enqueueSnackbar(CREATION_DATE_LOCKED_MESSAGE, {
        variant: 'error',
      });
    }

    if (isEmissionBeforeCreation(documentCreatedAt, documentDate)) {
      return enqueueSnackbar(EMISSION_BEFORE_CREATION_MESSAGE, {
        variant: 'error',
      });
    }

    if (!data.modelId)
      return setError('model', { message: 'Campo obrigatório' });

    const validityEnd = computeValidityEnd(
      creationDate,
      Number(validityYears),
      Number(validityMonths),
    );

    const submitData: IUpsertPGRDocumentData = {
      id: data.id,
      companyId: data.companyId,
      workspaceId: data.workspaceId,
      name,
      modelId: data.modelId,

      validityStart: dateFormat(creationDate.toISOString()),
      validityEnd: dateFormat(validityEnd.toISOString()),
      validityYears: Number(validityYears),
      validityMonths: Number(validityMonths),
      professionals: data.professionals,

      approvedBy,
      elaboratedBy,
      revisionBy,
      coordinatorBy,
      json: {
        ...(data as any)?.json,
        legalResponsibleBy: legalResponsibleBy?.trim() || undefined,
      },
    };

    const upsertMutation =
      data.type == DocumentTypeEnum.PCSMO
        ? updatePcmsoMutation
        : data.type == DocumentTypeEnum.PERICULOSIDADE
          ? updatePericulosidadeMutation
          : data.type == DocumentTypeEnum.LTCAT
            ? updateLtcatMutation
            : data.type == DocumentTypeEnum.INSALUBRIDADE
              ? updateInsalubridadeMutation
              : data.type == DocumentTypeEnum.FRPS
                ? updateFrpsMutation
                : updateMutation;

    let documentDataId = data.id;

    try {
      const response = await upsertMutation.mutateAsync(submitData);
      documentDataId = response?.id as string;

      const emissionIso = resolveDocumentDateFromForm(documentDate);

      const normalizedVersion = String(version || nextVersion).replace(
        '+ ',
        '',
      );

      const previousVersionsResponse = documentDataId
        ? await queryDocVersions(
            { take: 50, skip: 0 },
            {
              companyId: data.companyId,
              documentDataId: [documentDataId],
              type: data.type,
            },
          )
        : {
            data: [] as {
              version: string;
              documentDate?: string | null;
              created_at: Date;
            }[],
          };

      const documentData =
        data.workspaceId && data.type
          ? await queryGroupDocumentData({
              companyId: data.companyId,
              workspaceId: data.workspaceId,
              type: data.type,
            })
          : undefined;

      if (
        shouldWarnRevisionDateChange(
          normalizedVersion,
          emissionIso,
          previousVersionsResponse.data,
          documentData?.officialRevisionSeries ?? 1,
        ) &&
        !(await showConfirmation({
          title: 'Atenção',
          message: REVISION_DATE_WARNING_MESSAGE,
          confirmText: 'Continuar',
          cancelText: 'Cancelar',
          variant: 'warning',
        }))
      ) {
        return;
      }

      if (data.type) {
        const activeDocumentFilters = documentFiltersRef.current;
        const ghoIds = activeDocumentFilters.selecteds.length
          ? activeDocumentFilters.selecteds.map((group) => group.id)
          : undefined;

        await createDoc.mutateAsync({
          version: normalizedVersion,
          description: doc_description,
          name,
          companyId: data.companyId,
          workspaceId: data.workspaceId,
          workspaceName: data.workspaceName,
          documentDataId,
          type: data.type,
          ghoIds,
          documentDate: emissionIso,
        });
      }

      onClose();
    } catch {
      // mutations já exibem snackbar de erro
    }
  };

  const onAddArray = (professional: IProfessional, type: 'professionals') => {
    let value: any;

    if (Array.isArray(professional)) {
      value = professional.map((p) => ({
        ...p,
        professionalDocumentDataSignature: {
          professionalId: p.id,
          isSigner: true,
          isElaborator: true,
        },
      }));
    } else {
      value = {
        ...professional,
        professionalDocumentDataSignature: {
          ...(professional?.professionalDocumentDataSignature || {}),
          professionalId: professional.id,
          isSigner: true,
          isElaborator: true,
        },
      } as IProfessional;
    }

    setData({
      ...data,
      [type]: removeDuplicate([...(data as any)[type], ...value], {
        removeById: 'id',
      }),
    });
  };

  const onDeleteArray = (value: IProfessional, type: 'professionals') => {
    setData({
      ...data,
      [type]: [
        ...(data as any)[type].filter(
          (item: IProfessional) => item.id !== value.id,
        ),
      ],
    });
  };

  const onAddSigner = (
    professional: IProfessional,
    check: boolean,
    type: 'professionals',
  ) => {
    const dataCopy = clone(data);

    const value = {
      ...professional,
      professionalDocumentDataSignature: {
        ...(professional?.professionalDocumentDataSignature || {}),
        professionalId: professional.id,
        isSigner: check,
      },
    } as IProfessional;

    const index = dataCopy[type]?.findIndex((item) => item.id === value.id);
    if (index != -1) {
      dataCopy[type][index] = value;
    }

    setData({
      ...dataCopy,
    });
  };

  const onAddElaborator = (
    professional: IProfessional,
    check: boolean,
    type: 'professionals',
  ) => {
    const dataCopy = clone(data);

    const value = {
      ...professional,
      professionalDocumentDataSignature: {
        ...(professional?.professionalDocumentDataSignature || {}),
        professionalId: professional.id,
        isElaborator: check,
      },
    } as IProfessional;

    const index = dataCopy[type]?.findIndex((item) => item.id === value.id);
    if (index != -1) {
      dataCopy[type][index] = value;
    }

    setData({
      ...dataCopy,
    });
  };

  const clearDocumentFilters = useCallback(() => {
    setDocumentFilters(emptyDocumentFilterSelection(documentFilters.viewDataType));
  }, [documentFilters.viewDataType]);

  const removeDocumentFilterItem = useCallback(
    (item: DocumentFilterSelection['selecteds'][number]) => {
      setDocumentFilters((current) => ({
        ...current,
        selecteds: current.selecteds.filter((selected) => selected.id !== item.id),
      }));
    },
    [],
  );

  return {
    onSubmit,
    loading:
      updateMutation.isLoading ||
      updatePcmsoMutation.isLoading ||
      updateFrpsMutation.isLoading ||
      createDoc.isLoading,
    control,
    onCloseUnsaved,
    onAddArray,
    onDeleteArray,
    onAddSigner,
    onAddElaborator,
    data,
    setData,
    initialDataRef,
    setValue,
    company,
    creationDateLocked,
    lockedCreationDate,
    nextVersion,
    onVersionFamilyChange,
    documentFilters,
    setDocumentFilters,
    clearDocumentFilters,
    removeDocumentFilterItem,
  };
};

export type IUseMainStep = ReturnType<typeof useMainStep>;
