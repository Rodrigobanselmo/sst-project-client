export type ToxicologyRecord = {
  id: string;
  revision: number;
  employeeId: number;
  examDate: string;
  laboratoryCnpj: string;
  examCode: string;
  doctorName: string;
  doctorCrm: string | null;
  doctorUf: string | null;
  workerLivesAbroad: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
  hasAcceptedHistory?: boolean;
  lastAcceptedDeliveryId?: string;
  lastReceipt?: string;
};
export type ToxicologyDraft = {
  examDate: string;
  laboratoryCnpj: string;
  examCode: string;
  doctorName: string;
  doctorCrm: string;
  doctorUf: string;
  workerLivesAbroad: '' | 'YES' | 'NO';
  status: 'ACTIVE' | 'INACTIVE';
  correctionReason: string;
};
export const BRAZILIAN_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
];
export function toxicologyDraft(record?: ToxicologyRecord): ToxicologyDraft {
  return {
    examDate: record?.examDate.slice(0, 10) || '',
    laboratoryCnpj: record?.laboratoryCnpj || '',
    examCode: record?.examCode || '',
    doctorName: record?.doctorName || '',
    doctorCrm: record?.doctorCrm || '',
    doctorUf: record?.doctorUf || '',
    workerLivesAbroad: record ? (record.workerLivesAbroad ? 'YES' : 'NO') : '',
    status: record?.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    correctionReason: '',
  };
}
export function toxicologyPayload(
  draft: ToxicologyDraft,
  employeeId: number,
  record?: ToxicologyRecord,
  correctionRequired = false,
) {
  const date = new Date(`${draft.examDate}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(draft.examDate) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== draft.examDate
  )
    throw new Error('Informe uma data válida para o exame.');
  const laboratoryCnpj = draft.laboratoryCnpj.replace(/\D/g, '');
  if (laboratoryCnpj.length !== 14)
    throw new Error('Informe o CNPJ completo do laboratório.');
  const examCode = draft.examCode.trim().toUpperCase();
  if (!/^[A-Z]{2}\d{9}$/.test(examCode))
    throw new Error(
      'Informe o código do exame com duas letras e nove números.',
    );
  if (!draft.workerLivesAbroad)
    throw new Error('Informe se o empregado reside no exterior.');
  const doctorCrm = draft.doctorCrm.trim();
  const doctorUf = draft.doctorUf.trim().toUpperCase();
  if (!draft.doctorName.trim())
    throw new Error('Informe o nome do médico responsável.');
  if (
    (draft.workerLivesAbroad !== 'YES' && (!doctorCrm || !doctorUf)) ||
    doctorCrm.length > 10 ||
    (doctorUf && !BRAZILIAN_STATES.includes(doctorUf))
  )
    throw new Error('Informe CRM e UF válidos do médico responsável.');
  if (!['ACTIVE', 'INACTIVE'].includes(draft.status))
    throw new Error('Informe uma situação válida para o exame.');
  if (!record && draft.status !== 'ACTIVE')
    throw new Error(
      'Um novo exame inicia ativo. Revise sua situação depois de cadastrar.',
    );
  const statusChanged =
    !!record && draft.status !== (record.status || 'ACTIVE');
  if (
    (record?.lastAcceptedDeliveryId ||
      record?.hasAcceptedHistory ||
      correctionRequired ||
      statusChanged) &&
    !draft.correctionReason.trim()
  )
    throw new Error(
      'Explique a correção do exame já declarado. Para outro exame, cadastre um novo registro.',
    );
  return {
    employeeId,
    examDate: draft.examDate,
    laboratoryCnpj,
    examCode,
    doctorName: draft.doctorName.trim(),
    doctorCrm: doctorCrm || null,
    doctorUf: doctorUf || null,
    workerLivesAbroad: draft.workerLivesAbroad === 'YES',
    ...(record
      ? { expectedRevision: record.revision, status: draft.status }
      : {}),
    ...(draft.correctionReason.trim()
      ? { correctionReason: draft.correctionReason.trim() }
      : {}),
  };
}
