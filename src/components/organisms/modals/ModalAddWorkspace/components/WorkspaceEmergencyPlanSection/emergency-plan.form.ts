import {
  IUpsertWorkspaceEmergencyPlan,
  IWorkspaceEmergencyContact,
  IWorkspaceEmergencyMap,
  IWorkspaceEmergencyPlan,
  IWorkspaceEmergencyAlarm,
  IWorkspaceEmergencyPoint,
  WorkspaceEmergencyPointType,
  WorkspaceEmergencySignalType,
} from 'core/interfaces/api/IWorkspaceEmergencyPlan';

export type EmergencyPlanFormAlarm = {
  id?: string;
  localKey: string;
  name: string;
  signalCount: string;
  signalType: WorkspaceEmergencySignalType | '';
  durationSeconds: string;
  meaning: string;
  guidance: string;
  sortOrder: number;
};

export type EmergencyPlanFormPoint = {
  id?: string;
  localKey: string;
  type: WorkspaceEmergencyPointType;
  code: string;
  name: string;
  description: string;
  guidance: string;
  sortOrder: number;
};

export type EmergencyPlanFormContact = {
  id?: string;
  localKey: string;
  name: string;
  area: string;
  phone: string;
  mobile: string;
  radioChannel: string;
  zone: string;
  observation: string;
  sortOrder: number;
};

export type EmergencyPlanFormMap = {
  id?: string;
  localKey: string;
  title: string;
  caption: string;
  photoUrl: string;
  sortOrder: number;
};

export type EmergencyPlanFormState = {
  enabled: boolean;
  generalGuidance: string;
  incidentGuidance: string;
  alarms: EmergencyPlanFormAlarm[];
  points: EmergencyPlanFormPoint[];
  contacts: EmergencyPlanFormContact[];
  maps: EmergencyPlanFormMap[];
};

const createLocalKey = () =>
  `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const createEmptyEmergencyPlanForm = (): EmergencyPlanFormState => ({
  enabled: false,
  generalGuidance: '',
  incidentGuidance: '',
  alarms: [],
  points: [],
  contacts: [],
  maps: [],
});

export const createEmptyAlarm = (
  sortOrder: number,
): EmergencyPlanFormAlarm => ({
  localKey: createLocalKey(),
  name: '',
  signalCount: '',
  signalType: '',
  durationSeconds: '',
  meaning: '',
  guidance: '',
  sortOrder,
});

export const createEmptyPoint = (
  sortOrder: number,
  type: WorkspaceEmergencyPointType = 'ENCONTRO',
): EmergencyPlanFormPoint => ({
  localKey: createLocalKey(),
  type,
  code: '',
  name: '',
  description: '',
  guidance: '',
  sortOrder,
});

export const createEmptyContact = (
  sortOrder: number,
): EmergencyPlanFormContact => ({
  localKey: createLocalKey(),
  name: '',
  area: '',
  phone: '',
  mobile: '',
  radioChannel: '',
  zone: '',
  observation: '',
  sortOrder,
});

const textOrEmpty = (value?: string | null) => value ?? '';

const toNull = (value?: string | null) => {
  const trimmed = value?.trim() ?? '';
  return trimmed.length ? trimmed : null;
};

export const sanitizePositiveIntInput = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const parsed = Number(digits);
  if (!Number.isInteger(parsed) || parsed < 1) return '';
  return String(parsed);
};

const parsePositiveInt = (value?: string | number | null): number | null => {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 1) {
    return value;
  }
  const match = String(value ?? '').match(/\d+/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : null;
};

const parseSignalType = (
  value?: string | null,
): WorkspaceEmergencySignalType | '' => {
  if (value === 'INTERMITENTE' || value === 'CONTINUO_LONGO' || value === 'CUSTOM') {
    return value;
  }
  const text = value?.toLowerCase() || '';
  if (text.includes('intermit')) return 'INTERMITENTE';
  if (text.includes('contínu') || text.includes('continu')) return 'CONTINUO_LONGO';
  return '';
};

const intToForm = (value?: string | number | null) => {
  const parsed = parsePositiveInt(value);
  return parsed ? String(parsed) : '';
};

const formatSignalPattern = (
  signalCount: number | null,
  signalType: WorkspaceEmergencySignalType | '',
) => {
  if (signalType === 'INTERMITENTE' && signalCount) {
    return signalCount === 1
      ? '1 toque intermitente'
      : `${signalCount} toques intermitentes`;
  }
  if (signalType === 'CONTINUO_LONGO') {
    if (!signalCount || signalCount === 1) return 'Toque contínuo longo';
    return `${signalCount} toques contínuos longos`;
  }
  return null;
};

const formatDuration = (durationSeconds: number | null) => {
  if (!durationSeconds) return null;
  return durationSeconds === 1 ? '1 segundo' : `${durationSeconds} segundos`;
};

export const mapAlarmFromApi = (
  item: IWorkspaceEmergencyAlarm,
): EmergencyPlanFormAlarm => {
  const signalType =
    parseSignalType(item.signalType) || parseSignalType(item.signalPattern);
  const signalCount =
    intToForm(item.signalCount) ||
    intToForm(item.signalPattern) ||
    (signalType === 'CONTINUO_LONGO' ? '1' : '');

  return {
    id: item.id,
    localKey: item.id,
    name: textOrEmpty(item.name),
    signalCount,
    signalType,
    durationSeconds: intToForm(item.durationSeconds) || intToForm(item.duration),
    meaning: textOrEmpty(item.meaning),
    guidance: textOrEmpty(item.guidance),
    sortOrder: item.sortOrder ?? 0,
  };
};

export const mapPointFromApi = (
  item: IWorkspaceEmergencyPoint,
): EmergencyPlanFormPoint => ({
  id: item.id,
  localKey: item.id,
  type: item.type,
  code: textOrEmpty(item.code),
  name: textOrEmpty(item.name),
  description: textOrEmpty(item.description),
  guidance: textOrEmpty(item.guidance),
  sortOrder: item.sortOrder ?? 0,
});

export const mapContactFromApi = (
  item: IWorkspaceEmergencyContact,
): EmergencyPlanFormContact => ({
  id: item.id,
  localKey: item.id,
  name: textOrEmpty(item.name),
  area: textOrEmpty(item.area),
  phone: textOrEmpty(item.phone),
  mobile: textOrEmpty(item.mobile),
  radioChannel: textOrEmpty(item.radioChannel),
  zone: textOrEmpty(item.zone),
  observation: textOrEmpty(item.observation),
  sortOrder: item.sortOrder ?? 0,
});

export const mapMapFromApi = (
  item: IWorkspaceEmergencyMap,
): EmergencyPlanFormMap => ({
  id: item.id,
  localKey: item.id,
  title: textOrEmpty(item.title),
  caption: textOrEmpty(item.caption),
  photoUrl: item.photoUrl,
  sortOrder: item.sortOrder ?? 0,
});

export const mapPlanFromApi = (
  plan?: IWorkspaceEmergencyPlan | null,
): EmergencyPlanFormState => {
  if (!plan) return createEmptyEmergencyPlanForm();

  return {
    enabled: !!plan.enabled,
    generalGuidance: textOrEmpty(plan.generalGuidance),
    incidentGuidance: textOrEmpty(plan.incidentGuidance),
    alarms: (plan.alarms || []).map(mapAlarmFromApi),
    points: (plan.points || []).map(mapPointFromApi),
    contacts: (plan.contacts || []).map(mapContactFromApi),
    maps: (plan.maps || []).map(mapMapFromApi),
  };
};

export const moveFormItem = <T extends { sortOrder: number }>(
  items: T[],
  index: number,
  direction: -1 | 1,
): T[] => {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;

  const copy = [...items];
  const [item] = copy.splice(index, 1);
  copy.splice(nextIndex, 0, item);

  return copy.map((entry, sortOrder) => ({ ...entry, sortOrder }));
};

export const validateEmergencyPlanForm = (
  state: EmergencyPlanFormState,
): string | null => {
  const hasText = (...values: string[]) =>
    values.some((value) => value.trim().length > 0);

  const incompleteAlarm = state.alarms.find(
    (item) =>
      (item.id ||
        hasText(
          item.name,
          item.signalCount,
          item.signalType,
          item.durationSeconds,
          item.meaning,
          item.guidance,
        )) &&
      !item.name.trim(),
  );
  if (incompleteAlarm) return 'Informe o nome de todos os alarmes cadastrados.';

  const invalidAlarmCount = state.alarms.find(
    (item) => item.signalCount.trim() && !parsePositiveInt(item.signalCount),
  );
  if (invalidAlarmCount) {
    return 'A quantidade de toques deve ser um número inteiro positivo.';
  }

  const invalidAlarmDuration = state.alarms.find(
    (item) =>
      item.durationSeconds.trim() && !parsePositiveInt(item.durationSeconds),
  );
  if (invalidAlarmDuration) {
    return 'A duração deve ser um número positivo, em segundos.';
  }

  const incompletePoint = state.points.find(
    (item) =>
      (item.id ||
        hasText(item.name, item.code, item.description, item.guidance)) &&
      !item.name.trim(),
  );
  if (incompletePoint) {
    return 'Informe o nome de todos os pontos de encontro/apanha cadastrados.';
  }

  const incompleteContact = state.contacts.find(
    (item) =>
      (item.id ||
        hasText(
          item.name,
          item.area,
          item.phone,
          item.mobile,
          item.radioChannel,
          item.zone,
          item.observation,
        )) &&
      !item.name.trim(),
  );
  if (incompleteContact) {
    return 'Informe o nome de todos os contatos cadastrados.';
  }

  const incompleteMap = state.maps.find((item) => item.id && !item.photoUrl);
  if (incompleteMap) return 'Há um mapa sem imagem. Remova-o ou envie novamente.';

  return null;
};

export const buildEmergencyPlanPayload = (
  state: EmergencyPlanFormState,
): IUpsertWorkspaceEmergencyPlan => ({
  enabled: state.enabled,
  generalGuidance: toNull(state.generalGuidance),
  incidentGuidance: toNull(state.incidentGuidance),
  alarms: state.alarms
    .filter((item) => item.id || item.name.trim())
    .map((item, index) => {
      const signalCount = parsePositiveInt(item.signalCount);
      const durationSeconds = parsePositiveInt(item.durationSeconds);
      const signalType = item.signalType || null;

      return {
        ...(item.id ? { id: item.id } : {}),
        name: item.name.trim(),
        signalCount,
        signalType,
        durationSeconds,
        signalPattern: formatSignalPattern(signalCount, item.signalType),
        duration: formatDuration(durationSeconds),
        meaning: toNull(item.meaning),
        guidance: toNull(item.guidance),
        sortOrder: index,
      };
    }),
  points: state.points
    .filter((item) => item.id || item.name.trim())
    .map((item, index) => ({
      ...(item.id ? { id: item.id } : {}),
      type: item.type,
      code: toNull(item.code),
      name: item.name.trim(),
      description: toNull(item.description),
      guidance: toNull(item.guidance),
      sortOrder: index,
    })),
  contacts: state.contacts
    .filter((item) => item.id || item.name.trim())
    .map((item, index) => ({
      ...(item.id ? { id: item.id } : {}),
      name: item.name.trim(),
      area: toNull(item.area),
      phone: toNull(item.phone),
      mobile: toNull(item.mobile),
      radioChannel: toNull(item.radioChannel),
      zone: toNull(item.zone),
      observation: toNull(item.observation),
      sortOrder: index,
    })),
  maps: state.maps
    .filter((item) => item.id && item.photoUrl)
    .map((item, index) => ({
      id: item.id,
      title: item.title.trim() || 'Mapa de emergência',
      caption: toNull(item.caption),
      photoUrl: item.photoUrl,
      sortOrder: index,
    })),
});

export const mergeMapsAfterUpload = (
  current: EmergencyPlanFormMap[],
  serverPlan: IWorkspaceEmergencyPlan,
): EmergencyPlanFormMap[] => {
  const localIds = new Set(
    current.map((item) => item.id).filter((id): id is string => !!id),
  );
  const serverById = new Map(
    (serverPlan.maps || []).map((item) => [item.id, item]),
  );

  const kept = current.map((local) => {
    if (!local.id) return local;
    const server = serverById.get(local.id);
    if (!server) return local;
    return {
      ...local,
      photoUrl: server.photoUrl,
    };
  });

  const uploaded = (serverPlan.maps || [])
    .filter((item) => !localIds.has(item.id))
    .map(mapMapFromApi);

  return [...kept, ...uploaded].map((item, sortOrder) => ({
    ...item,
    sortOrder,
  }));
};
