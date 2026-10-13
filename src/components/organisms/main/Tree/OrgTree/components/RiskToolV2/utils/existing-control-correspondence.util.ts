import { normalizeInventoryItemName } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/normalizeInventoryItemName';
import { catalogControlDisplayName } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/catalog-control-display-name.util';
import { MedTypeEnum } from 'project/enum/medType.enum';
import { isNaRecMed } from 'project/utils/isNa';

export const EXISTING_CONTROL_CORRESPONDENCE_LABEL =
  'Controle existente vinculado';

type CorrespondenceRec = {
  id?: string | null;
  origin?: string | null;
  recName?: string | null;
  medName?: string | null;
  recType?: string | null;
  linkedControlRecMedId?: string | null;
};

export function isExistingControlCorrespondence(
  rec: { origin?: string | null } | null | undefined,
): boolean {
  return rec?.origin === 'EXISTING_CONTROL';
}

export function implementationRecommendations<
  T extends { origin?: string | null },
>(recs: Array<T | null | undefined> | null | undefined): T[] {
  return (recs ?? []).filter(
    (rec): rec is T => !!rec && !isExistingControlCorrespondence(rec),
  );
}

export function openFactorCorrespondenceRecIds(
  recs:
    | Array<{ id?: string | null; origin?: string | null } | null | undefined>
    | null
    | undefined,
): string[] {
  return (recs ?? [])
    .filter(
      (rec): rec is { id: string; origin?: string | null } =>
        !!rec?.id && isExistingControlCorrespondence(rec),
    )
    .map((rec) => rec.id);
}

export function openFactorLinkedControlIds(
  recs: Array<CorrespondenceRec | null | undefined> | null | undefined,
): string[] {
  return (recs ?? [])
    .filter(
      (rec): rec is CorrespondenceRec & { linkedControlRecMedId: string } =>
        isExistingControlCorrespondence(rec) && !!rec?.linkedControlRecMedId,
    )
    .map((rec) => rec.linkedControlRecMedId);
}

export function correspondenceForControl(
  controlId: string | null | undefined,
  recs: Array<CorrespondenceRec | null | undefined> | null | undefined,
): CorrespondenceRec | undefined {
  if (!controlId) return undefined;
  return (
    (recs ?? []).find(
      (rec) =>
        isExistingControlCorrespondence(rec) &&
        rec?.linkedControlRecMedId === controlId,
    ) ?? undefined
  );
}

export function standardRecommendationMatchesControl(
  controlName: string | null | undefined,
  recs: Array<CorrespondenceRec | null | undefined> | null | undefined,
): boolean {
  const normalized = normalizeInventoryItemName(controlName);
  if (!normalized) return false;

  return (recs ?? []).some((rec) => {
    if (!rec?.id || isExistingControlCorrespondence(rec)) return false;
    return [rec.recName, rec.medName].some(
      (name) => normalizeInventoryItemName(name) === normalized,
    );
  });
}

export function buildLinkExistingControlPayload(
  kind: 'adm' | 'eng',
  medName: string,
  companyId: string,
) {
  const item = {
    medName,
    medType: kind === 'eng' ? MedTypeEnum.ENG : MedTypeEnum.ADM,
    companyId,
  };

  return kind === 'eng' ? { engsAddOnly: [item] } : { admsAddOnly: [item] };
}

export function buildUndoExistingControlCorrespondencePayload(
  correspondenceRecId: string,
) {
  return { recs: [correspondenceRecId] };
}

export function resolveOpenPlanWorkspaceId(params: {
  override?: string | null;
  headerWorkspaceId?: string | null;
  ghoId?: string | null;
}): string | undefined {
  if (params.override) return params.override;
  if (params.headerWorkspaceId) return params.headerWorkspaceId;
  const parts = String(params.ghoId || '').split('//');
  return parts.length >= 2 ? parts[1] : undefined;
}

function isControlIncorporatedInWorkspace(params: {
  controlId?: string | null;
  dataRecs?: Array<PlanRow | null | undefined> | null;
  derivedMeasures?: Array<DerivedLink | null | undefined> | null;
  workspaceId?: string | null;
}): boolean {
  if (!params.workspaceId || !params.controlId) return false;
  const workspaceId = params.workspaceId;
  const controlId = params.controlId;
  const sourceRecMedId = (params.derivedMeasures ?? []).find(
    (row): row is DerivedLink =>
      !!row &&
      row.workspaceId === workspaceId &&
      row.derivedRecMedId === controlId &&
      !!row.sourceRecMedId,
  )?.sourceRecMedId;
  if (!sourceRecMedId) return false;
  return (params.dataRecs ?? []).some(
    (row) =>
      !!row &&
      row.workspaceId === workspaceId &&
      row.recMedId === sourceRecMedId &&
      row.status === 'DONE',
  );
}

export function resolveControlCorrespondencePresentation(params: {
  kind: 'adm' | 'eng';
  controlId?: string | null;
  controlName?: string | null;
  companyId?: string | null;
  recs: Array<CorrespondenceRec | null | undefined> | null | undefined;
  dataRecs?: Array<PlanRow | null | undefined> | null;
  derivedMeasures?: Array<DerivedLink | null | undefined> | null;
  workspaceId?: string | null;
}) {
  if (
    isControlIncorporatedInWorkspace({
      controlId: params.controlId,
      dataRecs: params.dataRecs,
      derivedMeasures: params.derivedMeasures,
      workspaceId: params.workspaceId,
    })
  ) {
    return {
      linked: false as const,
      incorporated: true as const,
      recommendationName: undefined,
      link: undefined,
      undo: undefined,
    };
  }

  const correspondence = correspondenceForControl(
    params.controlId,
    params.recs,
  );
  if (correspondence?.id) {
    return {
      linked: true as const,
      incorporated: false as const,
      recommendationName: catalogControlDisplayName(
        correspondence,
        'recommendation',
      ),
      undo: buildUndoExistingControlCorrespondencePayload(correspondence.id),
      link: undefined,
    };
  }

  const name = params.controlName?.trim();
  if (!name || !params.companyId) {
    return {
      linked: false as const,
      incorporated: false as const,
      recommendationName: undefined,
      link: undefined,
      undo: undefined,
    };
  }
  if (standardRecommendationMatchesControl(name, params.recs)) {
    return {
      linked: false as const,
      incorporated: false as const,
      recommendationName: undefined,
      link: undefined,
      undo: undefined,
    };
  }

  return {
    linked: false as const,
    incorporated: false as const,
    recommendationName: undefined,
    link: buildLinkExistingControlPayload(params.kind, name, params.companyId),
    undo: undefined,
  };
}

export const EXISTING_CONTROL_AS_RECOMMENDATION_MESSAGE =
  'Esta medida já está vinculada a um controle existente. Para utilizá-la como recomendação de implantação, desfaça primeiro a correspondência na coluna de controles.';

export const OPEN_RECOMMENDATION_CONTROL_MESSAGE =
  'Esta medida já consta como recomendação não incorporada neste estabelecimento. A incorporação deve seguir o fluxo de conclusão do Plano de Ação.';

export const INFORMATIVE_LINKED_MEASURE_MESSAGE =
  'Esta medida está vinculada a uma recomendação neste fator de risco. Para adicioná-la como medida de controle existente, desfaça primeiro o vínculo na coluna Recomendações e remova a recomendação do fator, se a intenção for substituí-la por um controle já implementado.';

export const EXISTING_CONTROL_LINK_CREATE_TOOLTIP =
  'Cria uma correspondência desta medida com uma recomendação. A implantação e o Plano de Ação não são alterados.';

export const EXISTING_CONTROL_LINK_UNDO_TOOLTIP =
  'Desfazer remove somente a correspondência. A medida de controle permanece cadastrada neste fator de risco.';

export const INFORMATIVE_LINK_CREATE_TOOLTIP =
  'Cria uma correspondência desta recomendação com uma medida no catálogo. A medida não é implantada neste fator.';

export const INFORMATIVE_LINK_UNDO_TOOLTIP =
  'Desfazer remove somente o vínculo informativo. A recomendação e o cadastro da medida permanecem.';

export const INCORPORATED_DERIVED_CONTROL_MESSAGE =
  'Esta recomendação já foi incorporada pelo Plano de Ação neste estabelecimento. O controle derivado não deve ser adicionado de novo.';

type NamedOption = {
  id?: string | null;
  recName?: string | null;
  medName?: string | null;
};

type PlanRow = {
  recMedId?: string | null;
  status?: string | null;
  workspaceId?: string | null;
};

type DerivedLink = {
  sourceRecMedId?: string | null;
  derivedRecMedId?: string | null;
  workspaceId?: string | null;
};

function normalizedKeys(
  names: Array<string | null | undefined>,
): Set<string> {
  const keys = new Set<string>();
  for (const name of names) {
    const key = normalizeInventoryItemName(name);
    if (key) keys.add(key);
  }
  return keys;
}

function optionMatchesNames(
  option: NamedOption,
  names: Array<string | null | undefined>,
): boolean {
  const wanted = normalizedKeys(names);
  if (!wanted.size) return false;
  return normalizedKeys([option.recName, option.medName]).size
    ? [...normalizedKeys([option.recName, option.medName])].some((key) =>
        wanted.has(key),
      )
    : false;
}

export function recommendationSelectionBlockMessage(params: {
  option: NamedOption;
  recs: Array<CorrespondenceRec | null | undefined> | null | undefined;
  controls?: Array<NamedOption | null | undefined> | null;
}): string | undefined {
  if (!params.option.id) return undefined;
  const correspondences = (params.recs ?? []).filter(
    isExistingControlCorrespondence,
  );
  if (!correspondences.length) return undefined;
  if (
    implementationRecommendations(params.recs).some(
      (rec) => rec.id === params.option.id,
    )
  ) {
    return undefined;
  }
  if (correspondences.some((rec) => rec?.id === params.option.id)) {
    return EXISTING_CONTROL_AS_RECOMMENDATION_MESSAGE;
  }

  const names: Array<string | null | undefined> = [];
  for (const rec of correspondences) {
    names.push(rec?.recName, rec?.medName);
    const control = (params.controls ?? []).find(
      (item) => item?.id && item.id === rec?.linkedControlRecMedId,
    );
    if (control) names.push(control.recName, control.medName);
  }
  if (optionMatchesNames(params.option, names)) {
    return EXISTING_CONTROL_AS_RECOMMENDATION_MESSAGE;
  }
  return undefined;
}

function rowsForWorkspace<T extends { workspaceId?: string | null }>(
  rows: Array<T | null | undefined> | null | undefined,
  workspaceId?: string | null,
): T[] {
  if (!workspaceId) return [];
  return (rows ?? []).filter(
    (row): row is T => !!row && row.workspaceId === workspaceId,
  );
}

export function measureSelectionBlockMessage(params: {
  option: NamedOption;
  recs: Array<CorrespondenceRec | null | undefined> | null | undefined;
  dataRecs?: Array<PlanRow | null | undefined> | null;
  derivedMeasures?: Array<DerivedLink | null | undefined> | null;
  workspaceId?: string | null;
  linkedControlIds?: Array<string | null | undefined> | null;
}): string | undefined {
  if (!params.option.id) return undefined;
  if (
    (params.linkedControlIds ?? []).some((id) => id === params.option.id)
  ) {
    return undefined;
  }

  const plans = rowsForWorkspace(params.dataRecs, params.workspaceId);
  const derived = rowsForWorkspace(params.derivedMeasures, params.workspaceId);
  let incorporatedMessage: string | undefined;

  for (const rec of implementationRecommendations(params.recs)) {
    if (!rec.id) continue;
    const plan = plans.find((row) => row.recMedId === rec.id);
    const derivedLink = derived.find((row) => row.sourceRecMedId === rec.id);
    const incorporated = plan?.status === 'DONE' && Boolean(derivedLink);
    const isDerivedControl = derivedLink?.derivedRecMedId === params.option.id;
    const matches =
      params.option.id === rec.id ||
      isDerivedControl ||
      optionMatchesNames(params.option, [rec.recName, rec.medName]);
    if (!matches) continue;
    const informativeMatch =
      !!rec.linkedControlRecMedId &&
      (params.option.id === rec.linkedControlRecMedId ||
        params.option.id === rec.id ||
        (!isDerivedControl &&
          optionMatchesNames(params.option, [rec.recName, rec.medName])));
    if (informativeMatch) return INFORMATIVE_LINKED_MEASURE_MESSAGE;
    if (!incorporated) return OPEN_RECOMMENDATION_CONTROL_MESSAGE;
    incorporatedMessage = INCORPORATED_DERIVED_CONTROL_MESSAGE;
  }

  return incorporatedMessage;
}

export const INFORMATIVE_CONTROL_LINK_LABEL = 'Vínculo informativo';

export const INFORMATIVE_CONTROL_LINK_GUIDANCE =
  'Este vínculo identifica uma medida relacionada, mas não altera a situação da recomendação no Plano de Ação.';

export const INCORPORATED_IN_OPEN_WORKSPACE_LABEL =
  'Medida incorporada pelo Plano de Ação neste estabelecimento. A incorporação não pode ser desfeita por este vínculo.';

export type InformativeControlOption = {
  id: string;
  name: string;
};

export function factorControlOptions(
  controls: Array<NamedOption | null | undefined> | null | undefined,
): InformativeControlOption[] {
  const seen = new Set<string>();
  const options: InformativeControlOption[] = [];
  for (const control of controls ?? []) {
    if (!control?.id || seen.has(control.id)) continue;
    const name = catalogControlDisplayName(control, 'measure');
    if (!name || isNaRecMed(name)) continue;
    seen.add(control.id);
    options.push({ id: control.id, name });
  }
  return options;
}

export function informativeCatalogMedType(
  recType?: string | null,
): 'ADM' | 'ENG' | null {
  if (recType === 'ADM' || recType === 'ENG') return recType;
  return null;
}

export function buildInformativeControlLinkPayload(
  recMedId: string,
  medType: 'ADM' | 'ENG',
) {
  return {
    informativeControlLink: {
      recMedId,
      medType,
    },
  };
}

export function buildClearInformativeControlLinkPayload(recMedId: string) {
  return {
    informativeControlLink: {
      recMedId,
      controlRecMedId: null,
    },
  };
}

function incorporatedDerivedControlId(params: {
  recId?: string | null;
  dataRecs?: Array<PlanRow | null | undefined> | null;
  derivedMeasures?: Array<DerivedLink | null | undefined> | null;
  workspaceId?: string | null;
}): string | undefined {
  if (!params.workspaceId || !params.recId) return undefined;
  const workspaceId = params.workspaceId;
  const recId = params.recId;
  const plan = (params.dataRecs ?? []).find(
    (row): row is PlanRow =>
      !!row &&
      row.workspaceId === workspaceId &&
      row.recMedId === recId &&
      row.status === 'DONE',
  );
  if (!plan) return undefined;
  const derivedId = (params.derivedMeasures ?? []).find(
    (row): row is DerivedLink =>
      !!row &&
      row.workspaceId === workspaceId &&
      row.sourceRecMedId === recId &&
      !!row.derivedRecMedId,
  )?.derivedRecMedId;
  return derivedId || undefined;
}

export function resolveInformativeRecommendationLink(params: {
  rec: CorrespondenceRec;
  controls: Array<NamedOption | null | undefined> | null | undefined;
  dataRecs?: Array<PlanRow | null | undefined> | null;
  derivedMeasures?: Array<DerivedLink | null | undefined> | null;
  workspaceId?: string | null;
}) {
  if (!params.rec.id || isExistingControlCorrespondence(params.rec)) {
    return { kind: 'hidden' as const };
  }

  const options = factorControlOptions(params.controls);
  const derivedId = incorporatedDerivedControlId({
    recId: params.rec.id,
    dataRecs: params.dataRecs,
    derivedMeasures: params.derivedMeasures,
    workspaceId: params.workspaceId,
  });
  if (derivedId) {
    return {
      kind: 'derived' as const,
      controlName:
        options.find((option) => option.id === derivedId)?.name ||
        'Controle derivado',
    };
  }

  if (params.rec.linkedControlRecMedId) {
    return {
      kind: 'linked' as const,
      controlName: catalogControlDisplayName(params.rec, 'recommendation'),
      undo: buildClearInformativeControlLinkPayload(params.rec.id),
    };
  }

  return {
    kind: 'link' as const,
    medType: informativeCatalogMedType(params.rec.recType),
  };
}
