import { FC, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Link,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { SAutocompleteSelect } from '@v2/components/forms/fields/SAutocompleteSelect/SAutocompleteSelect';
import { SInputFileDropZone } from '@v2/components/forms/fields/SInputFileDropZone/SInputFileDropZone';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useFetchHoMethodRiskSearch } from '@v2/services/occupational-hygiene/ho-method/hooks/useFetchHoMethodRiskSearch';
import { useDebouncedCallback } from 'use-debounce';
import {
  useMutateCreateHoMethod,
  useMutateUpdateHoMethod,
} from '@v2/services/occupational-hygiene/ho-method/hooks/useMutateHoMethod';
import { useFetchBrowseHoExtractionSolvents } from '@v2/services/occupational-hygiene/ho-method/hooks/useFetchHoCatalogs';
import { useFetchBrowseHoLaboratories } from '@v2/services/occupational-hygiene/ho-method/hooks/useFetchHoCatalogs';
import { useFetchBrowseHoSamplers } from '@v2/services/occupational-hygiene/ho-method/hooks/useFetchHoCatalogs';
import {
  createHoExtractionSolvent,
  createHoSampler,
  resolveHoMethodDocumentUrl,
  uploadHoMethodDocument,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.service';
import type {
  HoExtractionSolventRecord,
  HoLaboratoryRecord,
  HoMethodRecord,
  HoMethodWritePayload,
  HoSamplerRecord,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';
import {
  HoMethodAgentTypeEnum,
  HoMethodAvailabilityStatusEnum,
  HoMethodLaboratoryAvailabilityStatusEnum,
  HoMethodSourceEnum,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';
import { useQueryClient } from '@tanstack/react-query';
import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';
import { hoMethodQueryKeys } from '@v2/services/occupational-hygiene/ho-method/hooks/ho-method.query-keys';

import { HoMethodAdvancedSections } from './HoMethodAdvancedSections';
import { HoMethodAgentsSection } from './HoMethodAgentsSection';
import { HoLaboratoryFormModal } from './HoLaboratoryFormModal';
import {
  HO_METHOD_SOURCE_OPTIONS,
  HO_METHOD_STATUS_OPTIONS,
  HO_METHOD_TEMPERATURE_UNIT_OPTIONS,
  buildDefaultDisplayName,
  normalizeHoMethodTemperatureUnit,
} from '../maps/ho-method.maps';
import { getHoMethodApiErrorMessage } from '../utils/ho-method-error.util';
import {
  buildHoMethodSubmitPayload,
  emptyNumericInputs,
  numericInputsFromPayload,
  validateHoMethodForm,
  labNumericInputsFromLaboratories,
  applyLabNumericInputs,
  type HoMethodNumericInputs,
  type LabNumericInputs,
} from '../utils/ho-method-form-validation.util';
import {
  buildAgentsPayload,
  createMethodAgentFromRisk,
  methodAgentsFromRecord,
  syncLegacyAgentFields,
  type MethodAgentFormItem,
} from '../utils/ho-method-agents.util';
import {
  buildEvaluationDisplayOptions,
  inferEvaluationOptionsFromRisk,
  isChemicalRiskFactor,
  normalizeCas,
  HO_METHOD_CHEMICAL_ONLY_MESSAGE,
} from '../utils/ho-method-evaluation.util';

type HoMethodFormModalProps = {
  open: boolean;
  method: HoMethodRecord | null;
  onClose: () => void;
};

const emptyForm = (): HoMethodWritePayload => ({
  displayName: '',
  description: '',
  agentName: '',
  cas: '',
  riskFactorId: null,
  institution: HoMethodSourceEnum.NIOSH,
  methodCode: '',
  methodVersion: '',
  analyticalMethod: '',
  agentType: HoMethodAgentTypeEnum.CHEMICAL,
  prioritized: false,
  status: HoMethodAvailabilityStatusEnum.ACTIVE,
  samplerId: null,
  minimumFlowRate: null,
  maximumFlowRate: null,
  minimumVolume: null,
  maximumVolume: null,
  flowRateUnit: 'L/min',
  volumeUnit: 'L',
  storageTemperature: null,
  storageTemperatureUnit: '°C',
  stabilityDays: null,
  extractionSolventId: null,
  originalDocumentFileId: null,
  originalDocumentName: null,
  originalDocumentUploadedAt: null,
  notes: '',
  evaluationConditions: [],
  laboratories: [],
});

export const HoMethodFormModal: FC<HoMethodFormModalProps> = ({
  open,
  method,
  onClose,
}) => {
  const { companyId } = useGetCompanyId();
  const { isMasterAdmin } = useAuthShow();
  const queryClient = useQueryClient();
  const { showSnackBar } = useSystemSnackbar();

  const [form, setForm] = useState<HoMethodWritePayload>(emptyForm());
  const [numericInputs, setNumericInputs] = useState<HoMethodNumericInputs>(
    emptyNumericInputs(),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [methodAgents, setMethodAgents] = useState<MethodAgentFormItem[]>([]);
  const [activeAgentLocalId, setActiveAgentLocalId] = useState<string | null>(
    null,
  );
  const [agentPickerRisk, setAgentPickerRisk] = useState<IRiskFactors | null>(
    null,
  );
  const [riskSearch, setRiskSearch] = useState('');
  const [casSearch, setCasSearch] = useState('');
  const [casInput, setCasInput] = useState('');
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [extraSamplers, setExtraSamplers] = useState<HoSamplerRecord[]>([]);
  const [extraSolvents, setExtraSolvents] = useState<
    HoExtractionSolventRecord[]
  >([]);
  const [extraLaboratories, setExtraLaboratories] = useState<
    HoLaboratoryRecord[]
  >([]);
  const [laboratorySearch, setLaboratorySearch] = useState('');
  const [laboratoryModalOpen, setLaboratoryModalOpen] = useState(false);

  const [labNumericInputs, setLabNumericInputs] = useState<LabNumericInputs>({});

  const debouncedRiskSearch = useDebouncedCallback((value: string) => {
    setRiskSearch(value);
  }, 300);

  const debouncedCasSearch = useDebouncedCallback((value: string) => {
    setCasSearch(value);
  }, 300);

  const debouncedLaboratorySearch = useDebouncedCallback((value: string) => {
    setLaboratorySearch(value);
  }, 300);

  const activeRiskSearch = riskSearch.trim() || casSearch.trim();

  const { data: riskResults = [], isLoading: loadingRisks } =
    useFetchHoMethodRiskSearch(activeRiskSearch, companyId, open);

  const risks = useMemo(() => {
    const map = new Map<string, IRiskFactors>();
    riskResults.forEach((item) => {
      map.set(item.id, {
        id: item.id,
        name: item.name,
        cas: item.cas ?? undefined,
        synonymous: item.synonymous ?? [],
        type: item.type as IRiskFactors['type'],
        unit: item.unit ?? undefined,
        nr15lt: item.nr15lt ?? undefined,
        twa: item.twa ?? undefined,
        stel: item.stel ?? undefined,
      } as IRiskFactors);
    });
    methodAgents.forEach((agent) => map.set(agent.risk.id, agent.risk));
    return Array.from(map.values());
  }, [methodAgents, riskResults]);

  const chemicalRisks = useMemo(
    () => risks.filter((risk) => isChemicalRiskFactor(risk.type)),
    [risks],
  );

  const activeAgent = useMemo(() => {
    if (!methodAgents.length) return null;
    return (
      methodAgents.find((agent) => agent.localId === activeAgentLocalId) ??
      methodAgents[0]
    );
  }, [activeAgentLocalId, methodAgents]);

  const { data: samplers = [], isLoading: loadingSamplers } =
    useFetchBrowseHoSamplers('', open);
  const { data: solvents = [], isLoading: loadingSolvents } =
    useFetchBrowseHoExtractionSolvents('', open);
  const { data: laboratories = [], isLoading: loadingLaboratories } =
    useFetchBrowseHoLaboratories(laboratorySearch, open);

  const samplerOptions = useMemo(() => {
    const map = new Map<string, HoSamplerRecord>();
    [...samplers, ...extraSamplers].forEach((item) => map.set(item.id, item));

    if (method?.samplerId && method.samplerName) {
      map.set(method.samplerId, {
        id: method.samplerId,
        name: method.samplerName,
        description: null,
        type: null,
        notes: null,
        active: true,
      });
    }

    method?.laboratories?.forEach((lab) => {
      if (lab.samplerId && lab.samplerName) {
        map.set(lab.samplerId, {
          id: lab.samplerId,
          name: lab.samplerName,
          description: null,
          type: null,
          notes: null,
          active: true,
        });
      }
    });

    form.laboratories?.forEach((lab) => {
      if (lab.samplerId) {
        const existing = map.get(lab.samplerId);
        if (existing) map.set(existing.id, existing);
      }
    });

    if (form.samplerId) {
      const selected = map.get(form.samplerId);
      if (selected) map.set(selected.id, selected);
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [extraSamplers, form.laboratories, form.samplerId, method, samplers]);

  const solventOptions = useMemo(() => {
    const map = new Map<string, HoExtractionSolventRecord>();
    [...solvents, ...extraSolvents].forEach((item) => map.set(item.id, item));

    if (method?.extractionSolventId && method.extractionSolventName) {
      map.set(method.extractionSolventId, {
        id: method.extractionSolventId,
        name: method.extractionSolventName,
        description: null,
        synonyms: [],
        notes: null,
        active: true,
      });
    }

    method?.laboratories?.forEach((lab) => {
      if (lab.extractionSolventId && lab.extractionSolventName) {
        map.set(lab.extractionSolventId, {
          id: lab.extractionSolventId,
          name: lab.extractionSolventName,
          description: null,
          synonyms: [],
          notes: null,
          active: true,
        });
      }
    });

    form.laboratories?.forEach((lab) => {
      if (lab.extractionSolventId) {
        const existing = map.get(lab.extractionSolventId);
        if (existing) map.set(existing.id, existing);
      }
    });

    if (form.extractionSolventId) {
      const selected = map.get(form.extractionSolventId);
      if (selected) map.set(selected.id, selected);
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [extraSolvents, form.extractionSolventId, form.laboratories, method, solvents]);

  const laboratoryOptions = useMemo(() => {
    const map = new Map<string, HoLaboratoryRecord>();
    [...laboratories, ...extraLaboratories].forEach((item) =>
      map.set(item.id, item),
    );

    method?.laboratories?.forEach((lab) => {
      if (lab.laboratoryId) {
        map.set(lab.laboratoryId, {
          id: lab.laboratoryId,
          cnpj: lab.laboratoryCnpj,
          corporateName: lab.laboratoryCorporateName ?? lab.laboratoryName,
          tradeName: lab.laboratoryTradeName,
          email: null,
          phone: null,
          contactName: null,
          notes: null,
          status: 'ACTIVE',
        });
      }
    });

    form.laboratories?.forEach((lab) => {
      if (lab.laboratoryId) {
        const existing = map.get(lab.laboratoryId);
        if (existing) map.set(existing.id, existing);
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const labelA = a.tradeName || a.corporateName;
      const labelB = b.tradeName || b.corporateName;
      return labelA.localeCompare(labelB);
    });
  }, [extraLaboratories, form.laboratories, laboratories, method?.laboratories]);

  const createMutation = useMutateCreateHoMethod();
  const updateMutation = useMutateUpdateHoMethod();
  const isEditing = Boolean(method);
  const canReplaceDocument = isMasterAdmin;
  const canUploadDocument =
    !isEditing || !form.originalDocumentFileId || isMasterAdmin;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) return;

    if (method) {
      const nextForm = {
        displayName: method.displayName,
        description: method.description,
        agentName: method.agentName,
        cas: method.riskFactor?.cas ?? method.cas ?? '',
        riskFactorId: method.riskFactorId,
        institution: method.institution,
        methodCode: method.methodCode,
        methodVersion: method.methodVersion,
        analyticalMethod: method.analyticalMethod,
        agentType: method.agentType,
        prioritized: method.prioritized,
        status: method.status,
        samplerId: method.samplerId,
        minimumFlowRate: method.minimumFlowRate,
        maximumFlowRate: method.maximumFlowRate,
        minimumVolume: method.minimumVolume,
        maximumVolume: method.maximumVolume,
        flowRateUnit: method.flowRateUnit,
        volumeUnit: method.volumeUnit,
        storageTemperature: method.storageTemperature,
        storageTemperatureUnit: normalizeHoMethodTemperatureUnit(
          method.storageTemperatureUnit,
        ),
        stabilityDays: method.stabilityDays,
        extractionSolventId: method.extractionSolventId,
        originalDocumentFileId: method.originalDocumentFileId,
        originalDocumentName: method.originalDocumentName,
        originalDocumentUploadedAt: method.originalDocumentUploadedAt,
        notes: method.notes,
        evaluationConditions: method.evaluationConditions.map((item) => ({
          evaluationType: item.evaluationType,
          limitValue: item.limitValue,
          limitUnit: item.limitUnit,
          minimumFlowRate: item.minimumFlowRate,
          maximumFlowRate: item.maximumFlowRate,
          minimumVolume: item.minimumVolume,
          maximumVolume: item.maximumVolume,
          flowRateUnit: item.flowRateUnit,
          volumeUnit: item.volumeUnit,
          notes: item.notes,
        })),
        laboratories: method.laboratories.map((lab) => ({
          laboratoryId: lab.laboratoryId,
          laboratoryName: lab.laboratoryName,
          availabilityStatus: lab.availabilityStatus,
          lastConfirmationDate: lab.lastConfirmationDate
            ? lab.lastConfirmationDate.slice(0, 10)
            : null,
          notes: lab.notes,
          analyticalNotes: lab.analyticalNotes,
          samplerId: lab.samplerId,
          extractionSolventId: lab.extractionSolventId,
          minimumFlowRateOverride: lab.minimumFlowRateOverride,
          maximumFlowRateOverride: lab.maximumFlowRateOverride,
          minimumVolumeOverride: lab.minimumVolumeOverride,
          maximumVolumeOverride: lab.maximumVolumeOverride,
          storageTemperatureOverride: lab.storageTemperatureOverride,
          storageTemperatureUnitOverride: lab.storageTemperatureUnitOverride,
          stabilityDaysOverride: lab.stabilityDaysOverride,
        })),
      };
      setForm(nextForm);
      setNumericInputs(numericInputsFromPayload(nextForm));
      setLabNumericInputs(labNumericInputsFromLaboratories(nextForm.laboratories ?? []));
      const loadedAgents = methodAgentsFromRecord(method);
      setMethodAgents(loadedAgents);
      setActiveAgentLocalId(loadedAgents[0]?.localId ?? null);
      setAgentPickerRisk(null);
      setCasInput(loadedAgents[0]?.cas ?? nextForm.cas ?? '');
      setDocumentUrl(
        resolveHoMethodDocumentUrl({
          id: method.id,
          originalDocumentUrl: method.originalDocumentUrl,
          originalDocumentDownloadPath: method.originalDocumentDownloadPath,
        }),
      );
    } else {
      setForm(emptyForm());
      setNumericInputs(emptyNumericInputs());
      setLabNumericInputs({});
      setMethodAgents([]);
      setActiveAgentLocalId(null);
      setAgentPickerRisk(null);
      setCasInput('');
      setDocumentUrl(null);
    }

    setRiskSearch('');
    setCasSearch('');

    setFieldErrors({});
    setSubmitError(null);
    setExtraSamplers([]);
    setExtraSolvents([]);
  }, [open, method]);

  const inferredOptions = useMemo(
    () => inferEvaluationOptionsFromRisk(activeAgent?.risk),
    [activeAgent?.risk],
  );

  const evaluationDisplayOptions = useMemo(
    () =>
      buildEvaluationDisplayOptions(
        inferredOptions,
        activeAgent?.evaluationConditions ?? [],
      ),
    [activeAgent?.evaluationConditions, inferredOptions],
  );

  const syncAgentsToForm = (agents: MethodAgentFormItem[]) => {
    const legacy = syncLegacyAgentFields(agents);
    setForm((current) => ({
      ...current,
      ...legacy,
      agents: buildAgentsPayload(agents),
    }));
  };

  const addAgentFromRisk = (
    risk: IRiskFactors,
    options?: { preserveExisting?: boolean },
  ) => {
    if (!isChemicalRiskFactor(risk.type)) {
      showSnackBar(HO_METHOD_CHEMICAL_ONLY_MESSAGE, { type: 'error' });
      return;
    }

    const inferred = inferEvaluationOptionsFromRisk(risk);
    if (!inferred.length) {
      showSnackBar(
        'O agente químico selecionado não possui limites cadastrados para gerar condições de avaliação. Revise o cadastro do fator de risco antes de vinculá-lo ao método.',
        { type: 'error' },
      );
      return;
    }

    if (methodAgents.some((agent) => agent.riskFactorId === risk.id)) {
      setActiveAgentLocalId(
        methodAgents.find((agent) => agent.riskFactorId === risk.id)?.localId ??
          null,
      );
      setAgentPickerRisk(null);
      setCasInput(risk.cas ?? '');
      return;
    }

    const existingAgent = methodAgents.find(
      (agent) => agent.localId === activeAgentLocalId,
    );
    const nextAgent = createMethodAgentFromRisk(
      risk,
      options?.preserveExisting ? existingAgent?.evaluationConditions : undefined,
    );
    const nextAgents = [...methodAgents, nextAgent];
    setMethodAgents(nextAgents);
    setActiveAgentLocalId(nextAgent.localId);
    setAgentPickerRisk(null);
    setCasInput(nextAgent.cas);
    syncAgentsToForm(nextAgents);
    setFieldErrors((current) => {
      if (!current.riskFactorId && !current.evaluationConditions) {
        return current;
      }
      const next = { ...current };
      delete next.riskFactorId;
      delete next.evaluationConditions;
      return next;
    });
  };

  const computedDisplayName = useMemo(() => {
    if (form.displayName?.trim()) return form.displayName.trim();
    if (!form.methodCode?.trim()) return '';
    return buildDefaultDisplayName(form.institution, form.methodCode.trim());
  }, [form.displayName, form.institution, form.methodCode]);

  const updateField = <K extends keyof HoMethodWritePayload>(
    key: K,
    value: HoMethodWritePayload[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateNumericInput = (
    key: keyof HoMethodNumericInputs,
    value: string,
  ) => {
    setNumericInputs((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleSelectAgentToAdd = (risk: IRiskFactors | null) => {
    setAgentPickerRisk(risk);
    if (!risk) return;
    addAgentFromRisk(risk, { preserveExisting: isEditing });
  };

  const handleRemoveAgent = (localId: string) => {
    const nextAgents = methodAgents.filter((agent) => agent.localId !== localId);
    setMethodAgents(nextAgents);
    setActiveAgentLocalId(nextAgents[0]?.localId ?? null);
    setCasInput(nextAgents[0]?.cas ?? '');
    syncAgentsToForm(nextAgents);
  };

  const handleCasSearch = (value: string) => {
    setCasInput(value);
    debouncedCasSearch(value);
  };

  useEffect(() => {
    if (!open || !casSearch.trim() || !chemicalRisks.length) return;

    const normalizedInput = normalizeCas(casSearch);
    if (normalizedInput.length < 2) return;

    const exactMatch = chemicalRisks.find(
      (risk) => normalizeCas(risk.cas) === normalizedInput,
    );

    if (!exactMatch) return;
    if (methodAgents.some((agent) => agent.riskFactorId === exactMatch.id)) {
      setActiveAgentLocalId(
        methodAgents.find((agent) => agent.riskFactorId === exactMatch.id)
          ?.localId ?? null,
      );
      setCasInput(exactMatch.cas ?? casInput);
      return;
    }

    addAgentFromRisk(
      {
        id: exactMatch.id,
        name: exactMatch.name,
        cas: exactMatch.cas ?? undefined,
        synonymous: exactMatch.synonymous ?? [],
        type: exactMatch.type as IRiskFactors['type'],
        unit: exactMatch.unit ?? undefined,
        nr15lt: exactMatch.nr15lt ?? undefined,
        twa: exactMatch.twa ?? undefined,
        stel: exactMatch.stel ?? undefined,
      } as IRiskFactors,
      { preserveExisting: isEditing },
    );
  }, [casSearch, chemicalRisks, isEditing, methodAgents, open]);

  const handleUploadDocument = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (!companyId) {
      showSnackBar(
        'Empresa não identificada. Recarregue a página e tente novamente.',
        { type: 'error' },
      );
      return;
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showSnackBar('Selecione um arquivo PDF (.pdf).', { type: 'error' });
      return;
    }

    setUploadingDocument(true);
    try {
      const uploaded = await uploadHoMethodDocument({
        companyId,
        file,
      });
      updateField('originalDocumentFileId', uploaded.fileId);
      updateField('originalDocumentName', uploaded.name);
      updateField('originalDocumentUploadedAt', uploaded.uploadedAt);
      setDocumentUrl(uploaded.url || null);
      showSnackBar('Documento original anexado', { type: 'success' });
    } catch (error) {
      showSnackBar(
        getHoMethodApiErrorMessage(error, 'Não foi possível enviar o PDF'),
        { type: 'error' },
      );
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleQuickCreateSampler = async () => {
    const name = window.prompt('Nome do amostrador');
    if (!name?.trim()) return;
    try {
      const created = await createHoSampler({ name: name.trim() });
      setExtraSamplers((current) => [...current, created]);
      await queryClient.invalidateQueries({
        queryKey: hoMethodQueryKeys.samplers(''),
      });
      updateField('samplerId', created.id);
      showSnackBar('Amostrador cadastrado', { type: 'success' });
    } catch (error) {
      showSnackBar(
        getHoMethodApiErrorMessage(
          error,
          'Não foi possível cadastrar o amostrador',
        ),
        { type: 'error' },
      );
    }
  };

  const handleQuickCreateSolvent = async () => {
    const name = window.prompt('Nome do solvente de extração');
    if (!name?.trim()) return;
    try {
      const created = await createHoExtractionSolvent({ name: name.trim() });
      setExtraSolvents((current) => [...current, created]);
      await queryClient.invalidateQueries({
        queryKey: hoMethodQueryKeys.extractionSolvents(''),
      });
      updateField('extractionSolventId', created.id);
      showSnackBar('Solvente cadastrado', { type: 'success' });
    } catch (error) {
      showSnackBar(
        getHoMethodApiErrorMessage(
          error,
          'Não foi possível cadastrar o solvente',
        ),
        { type: 'error' },
      );
    }
  };

  const handleLaboratoryCreated = async (created: HoLaboratoryRecord) => {
    setExtraLaboratories((current) => [...current, created]);
    await queryClient.invalidateQueries({
      queryKey: hoMethodQueryKeys.laboratories(''),
    });

    const nextLabs = [...(form.laboratories ?? [])];
    const emptyIndex = nextLabs.findIndex(
      (lab) => !lab.laboratoryId && !lab.laboratoryName?.trim(),
    );
    const targetIndex = emptyIndex >= 0 ? emptyIndex : nextLabs.length;
    const displayName = created.tradeName?.trim() || created.corporateName;

    if (emptyIndex < 0) {
      nextLabs.push({
        laboratoryId: created.id,
        laboratoryName: displayName,
        availabilityStatus: HoMethodLaboratoryAvailabilityStatusEnum.UNKNOWN,
      });
    } else {
      nextLabs[targetIndex] = {
        ...nextLabs[targetIndex],
        laboratoryId: created.id,
        laboratoryName: displayName,
      };
    }

    updateField('laboratories', nextLabs);
    showSnackBar('Laboratório cadastrado e selecionado', { type: 'success' });
  };

  const handleSubmit = async () => {
    const { laboratories: parsedLabs, errors: labErrors } = applyLabNumericInputs(
      form.laboratories ?? [],
      labNumericInputs,
    );

    if (Object.keys(labErrors).length > 0) {
      setFieldErrors((current) => ({ ...current, ...labErrors }));
      showSnackBar(
        'Verifique os campos numéricos. Use valores como 0,2 ou 0.2.',
        { type: 'error' },
      );
      return;
    }

    const formWithLabs = { ...form, laboratories: parsedLabs };
    const formWithAgents = {
      ...formWithLabs,
      ...syncLegacyAgentFields(methodAgents),
      agents: buildAgentsPayload(methodAgents),
    };

    const validationErrors = validateHoMethodForm({
      form: formWithAgents,
      numericInputs,
    });
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setSubmitError(
        validationErrors.maximumFlowRate ||
          validationErrors.minimumFlowRate ||
          validationErrors.maximumVolume ||
          validationErrors.minimumVolume ||
          validationErrors.storageTemperature ||
          validationErrors.stabilityDays ||
          'Verifique os campos destacados antes de salvar.',
      );
      showSnackBar(
        'Verifique os campos numéricos. Use valores como 0,2 ou 0.2.',
        { type: 'error' },
      );
      return;
    }

    const payload = buildHoMethodSubmitPayload({
      form: formWithAgents,
      numericInputs,
      computedDisplayName,
    });

    setSubmitError(null);
    setFieldErrors({});

    try {
      if (isEditing && method) {
        await updateMutation.mutateAsync({ id: method.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      const message = getHoMethodApiErrorMessage(
        error,
        'Não foi possível salvar o método de HO',
      );
      setSubmitError(message);
      showSnackBar(message, { type: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle>
        {isEditing
          ? 'Editar Método de HO — Agentes Químicos'
          : 'Novo Método de HO — Agentes Químicos'}
      </DialogTitle>
      <DialogContent dividers>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Alert severity="info" sx={{ mb: 3 }}>
          Vazão e volume efetivamente utilizados em campo serão definidos
          futuramente na Estratégia de Amostragem, respeitando os limites
          permitidos pelo método.
        </Alert>

        <Typography variant="subtitle2" gutterBottom>
          Identificação
        </Typography>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              required
              label="Instituição / fonte"
              value={form.institution}
              error={Boolean(fieldErrors.institution)}
              helperText={fieldErrors.institution}
              onChange={(e) =>
                updateField(
                  'institution',
                  e.target.value as HoMethodSourceEnum,
                )
              }
            >
              {HO_METHOD_SOURCE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="Código do método"
              value={form.methodCode}
              error={Boolean(fieldErrors.methodCode)}
              helperText={fieldErrors.methodCode}
              onChange={(e) => updateField('methodCode', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Versão"
              value={form.methodVersion ?? ''}
              onChange={(e) => updateField('methodVersion', e.target.value)}
              placeholder="Issue 2 — 15 August 1994"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome exibido"
              value={form.displayName ?? ''}
              onChange={(e) => updateField('displayName', e.target.value)}
              placeholder={computedDisplayName || 'Ex.: NIOSH 1300'}
              helperText={
                computedDisplayName
                  ? `Padrão sugerido: ${computedDisplayName}`
                  : undefined
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Método analítico"
              value={form.analyticalMethod ?? ''}
              onChange={(e) => updateField('analyticalMethod', e.target.value)}
              placeholder="Gas Chromatography, FID"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Documento original
            </Typography>
            {(documentUrl ||
              form.originalDocumentName ||
              form.originalDocumentFileId) && (
              <Paper
                variant="outlined"
                sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}
              >
                <Typography variant="body2" gutterBottom>
                  Documento anexado
                  {form.originalDocumentName
                    ? `: ${form.originalDocumentName}`
                    : ''}
                </Typography>
                {documentUrl ? (
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Button
                      component={Link}
                      href={documentUrl}
                      target="_blank"
                      rel="noopener"
                      variant="contained"
                      size="small"
                    >
                      Visualizar método original
                    </Button>
                    <Button
                      component={Link}
                      href={documentUrl}
                      target="_blank"
                      rel="noopener"
                      variant="outlined"
                      size="small"
                    >
                      Baixar{' '}
                      {form.originalDocumentName || 'PDF'}
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Documento anexado, mas link indisponível. Verifique
                    armazenamento ou permissões.
                    {form.originalDocumentFileId
                      ? ` (fileId: ${form.originalDocumentFileId})`
                      : ''}
                  </Typography>
                )}
                {form.originalDocumentFileId && canReplaceDocument && (
                  <Button
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.pdf,application/pdf';
                      input.onchange = () => {
                        const file = input.files?.[0];
                        if (file) void handleUploadDocument([file]);
                      };
                      input.click();
                    }}
                    disabled={uploadingDocument || !companyId}
                  >
                    Substituir documento
                  </Button>
                )}
              </Paper>
            )}
            {canUploadDocument && (
              <SInputFileDropZone
                accept={{ 'application/pdf': ['.pdf'] }}
                label="Arraste o PDF do método original ou clique para selecionar"
                maxFiles={1}
                disabled={uploadingDocument || !companyId}
                onDrop={handleUploadDocument}
              />
            )}
            {!canUploadDocument && form.originalDocumentFileId && (
              <Typography variant="caption" color="text.secondary" display="block">
                Apenas usuários master podem substituir o documento original.
              </Typography>
            )}
            {!companyId && canUploadDocument && (
              <Typography variant="caption" color="error" display="block" mt={1}>
                Empresa não identificada na rota. O upload ficará indisponível
                até recarregar a página.
              </Typography>
            )}
          </Grid>
        </Grid>

        <HoMethodAgentsSection
          methodAgents={methodAgents}
          activeAgentLocalId={activeAgentLocalId}
          onChangeActiveAgent={(localId) => {
            setActiveAgentLocalId(localId);
            const agent = methodAgents.find((item) => item.localId === localId);
            setCasInput(agent?.cas ?? '');
          }}
          onRemoveAgent={handleRemoveAgent}
          agentPickerRisk={agentPickerRisk}
          riskOptions={chemicalRisks}
          loadingRisks={loadingRisks}
          casValue={casInput}
          onAgentSearchInput={(value) => debouncedRiskSearch(value)}
          onSelectAgentToAdd={handleSelectAgentToAdd}
          onCasChange={handleCasSearch}
          riskFactorError={fieldErrors.riskFactorId}
        />

        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Status"
              value={form.status}
              onChange={(e) =>
                updateField(
                  'status',
                  e.target.value as HoMethodAvailabilityStatusEnum,
                )
              }
            >
              {HO_METHOD_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <HoMethodAdvancedSections
          evaluationDisplayOptions={evaluationDisplayOptions}
          selectedConditions={activeAgent?.evaluationConditions ?? []}
          onChangeConditions={(conditions) => {
            if (!activeAgent) return;
            const nextAgents = methodAgents.map((agent) =>
              agent.localId === activeAgent.localId
                ? { ...agent, evaluationConditions: conditions }
                : agent,
            );
            setMethodAgents(nextAgents);
            syncAgentsToForm(nextAgents);
            if (conditions.length) {
              setFieldErrors((current) => {
                if (!current.evaluationConditions) return current;
                const next = { ...current };
                delete next.evaluationConditions;
                return next;
              });
            }
          }}
          activeAgentLabel={activeAgent?.agentName}
          conditionError={fieldErrors.evaluationConditions}
          laboratories={form.laboratories ?? []}
          onChangeLaboratories={(labs) => updateField('laboratories', labs)}
          labNumericInputs={labNumericInputs}
          onChangeLabNumericInputs={setLabNumericInputs}
          methodDefaults={{
            minimumFlowRate: form.minimumFlowRate,
            maximumFlowRate: form.maximumFlowRate,
            minimumVolume: form.minimumVolume,
            maximumVolume: form.maximumVolume,
            storageTemperature: form.storageTemperature,
            storageTemperatureUnit: form.storageTemperatureUnit,
            stabilityDays: form.stabilityDays,
            samplerId: form.samplerId,
            extractionSolventId: form.extractionSolventId,
          }}
          onQuickCreateSampler={handleQuickCreateSampler}
          onQuickCreateSolvent={handleQuickCreateSolvent}
          onQuickCreateLaboratory={() => setLaboratoryModalOpen(true)}
          onLaboratorySearch={debouncedLaboratorySearch}
          samplerOptions={samplerOptions}
          solventOptions={solventOptions}
          laboratoryOptions={laboratoryOptions}
          loadingSamplers={loadingSamplers}
          loadingSolvents={loadingSolvents}
          loadingLaboratories={loadingLaboratories}
          fieldErrors={fieldErrors}
        />

        <Typography variant="subtitle2" gutterBottom>
          Parâmetros originais do método
        </Typography>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={1}>
              <Box flex={1}>
                <SAutocompleteSelect
                  label="Amostrador padrão"
                  options={samplerOptions}
                  loading={loadingSamplers}
                  filterOptions={(options) => options}
                  value={
                    samplerOptions.find((item) => item.id === form.samplerId) ??
                    null
                  }
                  getOptionLabel={(option) => option.name}
                  onChange={(_, value) =>
                    updateField('samplerId', value?.id ?? null)
                  }
                />
              </Box>
              <Button sx={{ mt: 4 }} onClick={handleQuickCreateSampler}>
                +
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              inputMode="decimal"
              label="Vazão mínima permitida"
              value={numericInputs.minimumFlowRate}
              error={Boolean(fieldErrors.minimumFlowRate)}
              helperText={fieldErrors.minimumFlowRate}
              onChange={(e) =>
                updateNumericInput('minimumFlowRate', e.target.value)
              }
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              inputMode="decimal"
              label="Vazão máxima permitida"
              value={numericInputs.maximumFlowRate}
              error={Boolean(fieldErrors.maximumFlowRate)}
              helperText={fieldErrors.maximumFlowRate}
              onChange={(e) =>
                updateNumericInput('maximumFlowRate', e.target.value)
              }
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Unidade de vazão"
              value={form.flowRateUnit ?? ''}
              onChange={(e) => updateField('flowRateUnit', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              inputMode="decimal"
              label="Volume mínimo permitido"
              value={numericInputs.minimumVolume}
              error={Boolean(fieldErrors.minimumVolume)}
              helperText={fieldErrors.minimumVolume}
              onChange={(e) =>
                updateNumericInput('minimumVolume', e.target.value)
              }
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              inputMode="decimal"
              label="Volume máximo permitido"
              value={numericInputs.maximumVolume}
              error={Boolean(fieldErrors.maximumVolume)}
              helperText={fieldErrors.maximumVolume}
              onChange={(e) =>
                updateNumericInput('maximumVolume', e.target.value)
              }
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Unidade de volume"
              value={form.volumeUnit ?? ''}
              onChange={(e) => updateField('volumeUnit', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" gap={1}>
              <Box flex={1}>
                <SAutocompleteSelect
                  label="Solvente de extração padrão"
                  options={solventOptions}
                  loading={loadingSolvents}
                  filterOptions={(options) => options}
                  value={
                    solventOptions.find(
                      (item) => item.id === form.extractionSolventId,
                    ) ?? null
                  }
                  getOptionLabel={(option) => option.name}
                  onChange={(_, value) =>
                    updateField('extractionSolventId', value?.id ?? null)
                  }
                  placeholder="Selecione ou cadastre um solvente padronizado"
                />
              </Box>
              <Button sx={{ mt: 4 }} onClick={handleQuickCreateSolvent}>
                +
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              inputMode="decimal"
              label="Temperatura de estoque"
              value={numericInputs.storageTemperature}
              error={Boolean(fieldErrors.storageTemperature)}
              helperText={fieldErrors.storageTemperature}
              onChange={(e) =>
                updateNumericInput('storageTemperature', e.target.value)
              }
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Unidade de temperatura"
              value={normalizeHoMethodTemperatureUnit(form.storageTemperatureUnit)}
              onChange={(e) =>
                updateField('storageTemperatureUnit', e.target.value)
              }
            >
              {HO_METHOD_TEMPERATURE_UNIT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              inputMode="numeric"
              label="Estabilidade (dias)"
              value={numericInputs.stabilityDays}
              error={Boolean(fieldErrors.stabilityDays)}
              helperText={fieldErrors.stabilityDays}
              onChange={(e) =>
                updateNumericInput('stabilityDays', e.target.value)
              }
            />
          </Grid>
        </Grid>

        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Observações gerais"
          value={form.notes ?? ''}
          onChange={(e) => updateField('notes', e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button variant="contained" disabled={isSaving} onClick={handleSubmit}>
          {isSaving ? 'Salvando…' : isEditing ? 'Salvar alterações' : 'Cadastrar'}
        </Button>
      </DialogActions>
      <HoLaboratoryFormModal
        open={laboratoryModalOpen}
        onClose={() => setLaboratoryModalOpen(false)}
        onCreated={(created) => void handleLaboratoryCreated(created)}
      />
    </Dialog>
  );
};
