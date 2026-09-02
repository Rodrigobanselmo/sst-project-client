import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useSnackbar } from 'notistack';

import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useModal } from 'core/hooks/useModal';
import { IWorkspaceEmergencyPlan } from 'core/interfaces/api/IWorkspaceEmergencyPlan';
import { useMutUploadWorkspaceEmergencyMap } from 'core/services/hooks/mutations/manager/workspaceEmergencyPlan/useMutUploadWorkspaceEmergencyMap/useMutUploadWorkspaceEmergencyMap';
import {
  upsertWorkspaceEmergencyPlan,
  useMutUpsertWorkspaceEmergencyPlan,
} from 'core/services/hooks/mutations/manager/workspaceEmergencyPlan/useMutUpsertWorkspaceEmergencyPlan/useMutUpsertWorkspaceEmergencyPlan';
import { useQueryWorkspaceEmergencyPlan } from 'core/services/hooks/queries/useQueryWorkspaceEmergencyPlan/useQueryWorkspaceEmergencyPlan';
import { queryClient } from 'core/services/queryClient';
import { initialPhotoState } from 'components/organisms/modals/ModalUploadPhoto';

import {
  buildEmergencyPlanPayload,
  createEmptyAlarm,
  createEmptyContact,
  createEmptyEmergencyPlanForm,
  createEmptyPoint,
  EmergencyPlanFormAlarm,
  EmergencyPlanFormContact,
  EmergencyPlanFormMap,
  EmergencyPlanFormPoint,
  EmergencyPlanFormState,
  mapPlanFromApi,
  mergeMapsAfterUpload,
  moveFormItem,
  validateEmergencyPlanForm,
} from './emergency-plan.form';

type UseEditWorkspaceEmergencyPlanProps = {
  companyId?: string;
  workspaceId?: string;
};

const serializeForm = (state: EmergencyPlanFormState) => JSON.stringify(state);

export function useEditWorkspaceEmergencyPlan({
  companyId,
  workspaceId,
}: UseEditWorkspaceEmergencyPlanProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { onStackOpenModal } = useModal();
  const upsertMutation = useMutUpsertWorkspaceEmergencyPlan();
  const uploadMutation = useMutUploadWorkspaceEmergencyMap();
  const query = useQueryWorkspaceEmergencyPlan(workspaceId, companyId);

  const [form, setForm] = useState<EmergencyPlanFormState>(
    createEmptyEmergencyPlanForm,
  );
  const [hydratedKey, setHydratedKey] = useState('');
  const baselineRef = useRef(serializeForm(createEmptyEmergencyPlanForm()));
  const baselineMapsRef = useRef<EmergencyPlanFormMap[]>([]);
  const sessionUploadedMapIdsRef = useRef<string[]>([]);

  const hydrateKey = `${companyId || ''}:${workspaceId || ''}`;
  const isHydrated = hydratedKey === hydrateKey && !!query.data;
  const isDirty = isHydrated && serializeForm(form) !== baselineRef.current;

  useEffect(() => {
    return () => {
      const uploadedIds = sessionUploadedMapIdsRef.current;
      if (!uploadedIds.length || !workspaceId || !companyId) return;

      const maps = buildEmergencyPlanPayload({
        ...createEmptyEmergencyPlanForm(),
        maps: baselineMapsRef.current,
      }).maps;

      sessionUploadedMapIdsRef.current = [];

      void upsertWorkspaceEmergencyPlan(
        { workspaceId, companyId, maps },
        companyId,
      )
        .then((resp) => {
          if (!resp) return;
          queryClient.setQueryData(
            [QueryEnum.WORKSPACE_EMERGENCY_PLAN, companyId, workspaceId],
            resp,
          );
        })
        .catch(() => undefined);
    };
  }, [companyId, workspaceId]);

  useEffect(() => {
    setHydratedKey('');
    baselineRef.current = serializeForm(createEmptyEmergencyPlanForm());
    setForm(createEmptyEmergencyPlanForm());
  }, [hydrateKey]);

  useEffect(() => {
    if (!query.data || !workspaceId) return;
    if (query.data.workspaceId !== workspaceId) return;
    if (hydratedKey === hydrateKey) return;

    const next = mapPlanFromApi(query.data);
    setHydratedKey(hydrateKey);
    baselineRef.current = serializeForm(next);
    baselineMapsRef.current = next.maps;
    sessionUploadedMapIdsRef.current = [];
    setForm(next);
  }, [query.data, workspaceId, hydrateKey, hydratedKey]);

  const applyServerPlan = useCallback((plan: IWorkspaceEmergencyPlan) => {
    const next = mapPlanFromApi(plan);
    setForm(next);
    baselineRef.current = serializeForm(next);
    baselineMapsRef.current = next.maps;
    sessionUploadedMapIdsRef.current = [];
  }, []);

  const updateField = useCallback(
    <K extends keyof EmergencyPlanFormState>(
      key: K,
      value: EmergencyPlanFormState[K],
    ) => {
      setForm((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const updateAlarm = useCallback(
    (localKey: string, patch: Partial<EmergencyPlanFormAlarm>) => {
      setForm((current) => ({
        ...current,
        alarms: current.alarms.map((item) =>
          item.localKey === localKey ? { ...item, ...patch } : item,
        ),
      }));
    },
    [],
  );

  const updatePoint = useCallback(
    (localKey: string, patch: Partial<EmergencyPlanFormPoint>) => {
      setForm((current) => ({
        ...current,
        points: current.points.map((item) =>
          item.localKey === localKey ? { ...item, ...patch } : item,
        ),
      }));
    },
    [],
  );

  const updateContact = useCallback(
    (localKey: string, patch: Partial<EmergencyPlanFormContact>) => {
      setForm((current) => ({
        ...current,
        contacts: current.contacts.map((item) =>
          item.localKey === localKey ? { ...item, ...patch } : item,
        ),
      }));
    },
    [],
  );

  const updateMap = useCallback(
    (localKey: string, patch: Partial<EmergencyPlanFormMap>) => {
      setForm((current) => ({
        ...current,
        maps: current.maps.map((item) =>
          item.localKey === localKey ? { ...item, ...patch } : item,
        ),
      }));
    },
    [],
  );

  const addAlarm = useCallback(() => {
    setForm((current) => ({
      ...current,
      alarms: [...current.alarms, createEmptyAlarm(current.alarms.length)],
    }));
  }, []);

  const addPoint = useCallback(() => {
    setForm((current) => ({
      ...current,
      points: [...current.points, createEmptyPoint(current.points.length)],
    }));
  }, []);

  const addContact = useCallback(() => {
    setForm((current) => ({
      ...current,
      contacts: [
        ...current.contacts,
        createEmptyContact(current.contacts.length),
      ],
    }));
  }, []);

  const removeAlarm = useCallback((localKey: string) => {
    setForm((current) => ({
      ...current,
      alarms: current.alarms
        .filter((item) => item.localKey !== localKey)
        .map((item, sortOrder) => ({ ...item, sortOrder })),
    }));
  }, []);

  const removePoint = useCallback((localKey: string) => {
    setForm((current) => ({
      ...current,
      points: current.points
        .filter((item) => item.localKey !== localKey)
        .map((item, sortOrder) => ({ ...item, sortOrder })),
    }));
  }, []);

  const removeContact = useCallback((localKey: string) => {
    setForm((current) => ({
      ...current,
      contacts: current.contacts
        .filter((item) => item.localKey !== localKey)
        .map((item, sortOrder) => ({ ...item, sortOrder })),
    }));
  }, []);

  const removeMap = useCallback((localKey: string) => {
    setForm((current) => ({
      ...current,
      maps: current.maps
        .filter((item) => item.localKey !== localKey)
        .map((item, sortOrder) => ({ ...item, sortOrder })),
    }));
  }, []);

  const moveAlarm = useCallback((index: number, direction: -1 | 1) => {
    setForm((current) => ({
      ...current,
      alarms: moveFormItem(current.alarms, index, direction),
    }));
  }, []);

  const movePoint = useCallback((index: number, direction: -1 | 1) => {
    setForm((current) => ({
      ...current,
      points: moveFormItem(current.points, index, direction),
    }));
  }, []);

  const moveContact = useCallback((index: number, direction: -1 | 1) => {
    setForm((current) => ({
      ...current,
      contacts: moveFormItem(current.contacts, index, direction),
    }));
  }, []);

  const moveMap = useCallback((index: number, direction: -1 | 1) => {
    setForm((current) => ({
      ...current,
      maps: moveFormItem(current.maps, index, direction),
    }));
  }, []);

  const handleUploadMap = useCallback(() => {
    if (!workspaceId || !isHydrated) return;

    onStackOpenModal(ModalEnum.UPLOAD_PHOTO, {
      name: 'Mapa de emergência',
      title: 'Mapa de emergência',
      showInputName: true,
      freeAspect: true,
      saveAsIs: true,
      imageExtension: 'png',
      accept: ['image/*', '.heic'],
      compressProps: {
        maxWidth: 5000,
        maxHeight: 5000,
      },
      onConfirm: async (photo) => {
        if (!photo.file || !workspaceId) return;

        const resp = await uploadMutation
          .mutateAsync({
            file: photo.file,
            workspaceId,
            companyId,
            title: photo.name || 'Mapa de emergência',
          })
          .catch(() => null);

        if (!resp) return;

        setForm((current) => {
          const previousIds = new Set(
            current.maps
              .map((item) => item.id)
              .filter((id): id is string => !!id),
          );
          const maps = mergeMapsAfterUpload(current.maps, resp);
          const uploadedIds = maps
            .map((item) => item.id)
            .filter((id): id is string => !!id && !previousIds.has(id));
          sessionUploadedMapIdsRef.current = [
            ...sessionUploadedMapIdsRef.current,
            ...uploadedIds,
          ];
          return { ...current, maps };
        });
      },
    } as Partial<typeof initialPhotoState>);
  }, [companyId, isHydrated, onStackOpenModal, uploadMutation, workspaceId]);

  const handleSave = useCallback(async () => {
    if (!workspaceId) return;
    if (!isHydrated) {
      enqueueSnackbar(
        'Aguarde o carregamento do plano de emergência antes de salvar.',
        { variant: 'warning' },
      );
      return;
    }

    const validationError = validateEmergencyPlanForm(form);
    if (validationError) {
      enqueueSnackbar(validationError, { variant: 'error' });
      return;
    }

    const payload = buildEmergencyPlanPayload(form);
    const resp = await upsertMutation
      .mutateAsync({
        ...payload,
        workspaceId,
        companyId,
      })
      .catch(() => null);

    if (resp) applyServerPlan(resp);
  }, [
    applyServerPlan,
    companyId,
    enqueueSnackbar,
    form,
    isHydrated,
    upsertMutation,
    workspaceId,
  ]);

  const summary = useMemo(
    () => ({
      alarms: form.alarms.length,
      points: form.points.length,
      contacts: form.contacts.length,
      maps: form.maps.length,
    }),
    [form.alarms.length, form.contacts.length, form.maps.length, form.points.length],
  );

  return {
    form,
    summary,
    isHydrated,
    isDirty,
    isLoading: !isHydrated && !query.isError,
    isError: query.isError,
    isSaving: upsertMutation.isLoading,
    isUploading: uploadMutation.isLoading,
    updateField,
    updateAlarm,
    updatePoint,
    updateContact,
    updateMap,
    addAlarm,
    addPoint,
    addContact,
    removeAlarm,
    removePoint,
    removeContact,
    removeMap,
    moveAlarm,
    movePoint,
    moveContact,
    moveMap,
    handleUploadMap,
    handleSave,
  };
}
