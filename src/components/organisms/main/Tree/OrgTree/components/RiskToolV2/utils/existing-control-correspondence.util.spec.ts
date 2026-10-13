import assert from 'node:assert/strict';

import { MedTypeEnum } from 'project/enum/medType.enum';

import {
  EXISTING_CONTROL_AS_RECOMMENDATION_MESSAGE,
  EXISTING_CONTROL_CORRESPONDENCE_LABEL,
  EXISTING_CONTROL_LINK_CREATE_TOOLTIP,
  EXISTING_CONTROL_LINK_UNDO_TOOLTIP,
  INCORPORATED_DERIVED_CONTROL_MESSAGE,
  INCORPORATED_IN_OPEN_WORKSPACE_LABEL,
  INFORMATIVE_LINK_CREATE_TOOLTIP,
  INFORMATIVE_LINK_UNDO_TOOLTIP,
  INFORMATIVE_LINKED_MEASURE_MESSAGE,
  OPEN_RECOMMENDATION_CONTROL_MESSAGE,
  buildClearInformativeControlLinkPayload,
  buildInformativeControlLinkPayload,
  buildLinkExistingControlPayload,
  buildUndoExistingControlCorrespondencePayload,
  implementationRecommendations,
  isExistingControlCorrespondence,
  measureSelectionBlockMessage,
  openFactorCorrespondenceRecIds,
  openFactorLinkedControlIds,
  recommendationSelectionBlockMessage,
  resolveControlCorrespondencePresentation,
  resolveInformativeRecommendationLink,
  resolveOpenPlanWorkspaceId,
  standardRecommendationMatchesControl,
} from './existing-control-correspondence.util';

assert.equal(
  isExistingControlCorrespondence({ origin: 'EXISTING_CONTROL' }),
  true,
);
assert.equal(isExistingControlCorrespondence({ origin: 'STANDARD' }), false);
assert.equal(isExistingControlCorrespondence(undefined), false);
assert.equal(
  EXISTING_CONTROL_CORRESPONDENCE_LABEL,
  'Controle existente vinculado',
);
assert.equal(
  EXISTING_CONTROL_LINK_CREATE_TOOLTIP,
  'Cria uma correspondência desta medida com uma recomendação. A implantação e o Plano de Ação não são alterados.',
);
assert.equal(
  EXISTING_CONTROL_LINK_UNDO_TOOLTIP,
  'Desfazer remove somente a correspondência. A medida de controle permanece cadastrada neste fator de risco.',
);
assert.equal(
  INFORMATIVE_LINK_CREATE_TOOLTIP,
  'Cria uma correspondência desta recomendação com uma medida no catálogo. A medida não é implantada neste fator.',
);
assert.equal(
  INFORMATIVE_LINK_UNDO_TOOLTIP,
  'Desfazer remove somente o vínculo informativo. A recomendação e o cadastro da medida permanecem.',
);
assert.equal(
  INCORPORATED_IN_OPEN_WORKSPACE_LABEL,
  'Medida incorporada pelo Plano de Ação neste estabelecimento. A incorporação não pode ser desfeita por este vínculo.',
);
assert.equal(
  resolveOpenPlanWorkspaceId({
    headerWorkspaceId: 'ws-06',
    ghoId: 'gse-06',
  }),
  'ws-06',
);
assert.equal(
  resolveOpenPlanWorkspaceId({
    override: 'ws-origem',
    headerWorkspaceId: 'ws-06',
    ghoId: 'gse//ws-outro',
  }),
  'ws-origem',
);
assert.equal(
  resolveOpenPlanWorkspaceId({ ghoId: 'cargo//ws-gho' }),
  'ws-gho',
);
assert.equal(resolveOpenPlanWorkspaceId({ ghoId: 'gse-06' }), undefined);

const standardRec = {
  id: 'rec-standard',
  origin: 'STANDARD' as const,
  recName: 'Implantar pausa',
};
const correspondence = {
  id: 'rec-link',
  origin: 'EXISTING_CONTROL' as const,
  recName: 'Orientações sobre pausa ativa',
  linkedControlRecMedId: 'control-pausa',
};
const otherFactorOnly = {
  id: 'rec-other',
  origin: 'STANDARD' as const,
  recName: 'Agenda de outro fator',
};

const openFactorRecs = [standardRec, correspondence];

assert.deepEqual(
  implementationRecommendations(openFactorRecs).map((rec) => rec.id),
  ['rec-standard'],
);
assert.deepEqual(openFactorCorrespondenceRecIds(openFactorRecs), ['rec-link']);
assert.deepEqual(openFactorLinkedControlIds(openFactorRecs), ['control-pausa']);
assert.deepEqual(openFactorLinkedControlIds([otherFactorOnly]), []);
assert.equal(
  standardRecommendationMatchesControl('Implantar pausa.', openFactorRecs),
  true,
);
assert.equal(
  standardRecommendationMatchesControl(
    'Orientações sobre pausa ativa',
    openFactorRecs,
  ),
  false,
);

const link = buildLinkExistingControlPayload(
  'adm',
  'Orientações sobre pausa ativa',
  'company-1',
);
assert.deepEqual(link, {
  admsAddOnly: [
    {
      medName: 'Orientações sobre pausa ativa',
      medType: MedTypeEnum.ADM,
      companyId: 'company-1',
    },
  ],
});
assert.equal('recs' in link, false);
assert.equal('probabilityAfter' in link, false);

const undo = buildUndoExistingControlCorrespondencePayload('rec-link');
assert.deepEqual(undo, { recs: ['rec-link'] });
assert.equal('adms' in undo, false);

const unlinked = resolveControlCorrespondencePresentation({
  kind: 'adm',
  controlId: 'control-agenda',
  controlName: 'Agenda de trabalho com horários de descanso',
  companyId: 'company-1',
  recs: openFactorRecs,
});
assert.equal(unlinked.linked, false);
assert.deepEqual(
  unlinked.link?.admsAddOnly?.[0]?.medName,
  'Agenda de trabalho com horários de descanso',
);

const blocked = resolveControlCorrespondencePresentation({
  kind: 'eng',
  controlId: 'control-standard',
  controlName: 'Implantar pausa',
  companyId: 'company-1',
  recs: openFactorRecs,
});
assert.equal(blocked.linked, false);
assert.equal(blocked.link, undefined);

const linked = resolveControlCorrespondencePresentation({
  kind: 'adm',
  controlId: 'control-pausa',
  controlName: 'Orientações sobre pausa ativa',
  companyId: 'company-1',
  recs: openFactorRecs,
});
assert.equal(linked.linked, true);
assert.equal(linked.recommendationName, 'Orientações sobre pausa ativa');
assert.deepEqual(linked.undo, { recs: ['rec-link'] });
assert.equal(linked.link, undefined);

assert.equal(
  recommendationSelectionBlockMessage({
    option: { id: 'rec-link', recName: 'Orientações sobre pausa ativa' },
    recs: openFactorRecs,
  }),
  EXISTING_CONTROL_AS_RECOMMENDATION_MESSAGE,
);
assert.equal(
  recommendationSelectionBlockMessage({
    option: { id: 'outro-catalogo', recName: 'Orientações sobre pausa ativa.' },
    recs: openFactorRecs,
    controls: [{ id: 'control-pausa', medName: 'Orientações sobre pausa ativa' }],
  }),
  EXISTING_CONTROL_AS_RECOMMENDATION_MESSAGE,
);
assert.equal(
  recommendationSelectionBlockMessage({
    option: standardRec,
    recs: openFactorRecs,
  }),
  undefined,
);

const openPlans = [
  { recMedId: 'rec-standard', status: 'PENDING', workspaceId: 'ws-06' },
];
assert.equal(
  measureSelectionBlockMessage({
    option: { id: 'cat-pausa', medName: 'Implantar pausa.' },
    recs: openFactorRecs,
    dataRecs: openPlans,
    workspaceId: 'ws-06',
  }),
  OPEN_RECOMMENDATION_CONTROL_MESSAGE,
);
assert.equal(
  measureSelectionBlockMessage({
    option: { id: 'catalog-medida', medName: 'Implantar pausa' },
    recs: [{ ...standardRec, linkedControlRecMedId: 'catalog-medida' }],
    dataRecs: openPlans,
    workspaceId: 'ws-06',
  }),
  INFORMATIVE_LINKED_MEASURE_MESSAGE,
);
assert.equal(
  measureSelectionBlockMessage({
    option: { id: 'catalog-medida', medName: 'Implantar pausa' },
    recs: [standardRec],
    dataRecs: openPlans,
    workspaceId: 'ws-06',
  }),
  OPEN_RECOMMENDATION_CONTROL_MESSAGE,
);
assert.equal(
  measureSelectionBlockMessage({
    option: { id: 'derivado', medName: 'Pausa incorporada' },
    recs: [
      {
        ...standardRec,
        recName: 'Pausa incorporada',
        linkedControlRecMedId: 'catalog-medida',
      },
    ],
    dataRecs: [{ recMedId: 'rec-standard', status: 'DONE', workspaceId: 'ws-06' }],
    derivedMeasures: [
      {
        sourceRecMedId: 'rec-standard',
        derivedRecMedId: 'derivado',
        workspaceId: 'ws-06',
      },
    ],
    workspaceId: 'ws-06',
  }),
  INCORPORATED_DERIVED_CONTROL_MESSAGE,
);
assert.equal(
  measureSelectionBlockMessage({
    option: { id: 'cat-pausa', medName: 'Implantar pausa' },
    recs: openFactorRecs,
    dataRecs: [{ recMedId: 'rec-standard', status: 'DONE', workspaceId: 'ws-outro' }],
    derivedMeasures: [
      {
        sourceRecMedId: 'rec-standard',
        derivedRecMedId: 'derivado',
        workspaceId: 'ws-outro',
      },
    ],
    workspaceId: 'ws-06',
  }),
  OPEN_RECOMMENDATION_CONTROL_MESSAGE,
);
assert.equal(
  measureSelectionBlockMessage({
    option: { id: 'derivado', medName: 'Implantar pausa' },
    recs: openFactorRecs,
    dataRecs: [{ recMedId: 'rec-standard', status: 'DONE', workspaceId: 'ws-06' }],
    derivedMeasures: [
      {
        sourceRecMedId: 'rec-standard',
        derivedRecMedId: 'derivado',
        workspaceId: 'ws-06',
      },
    ],
    workspaceId: 'ws-06',
    linkedControlIds: ['control-pausa'],
  }),
  INCORPORATED_DERIVED_CONTROL_MESSAGE,
);
assert.equal(
  measureSelectionBlockMessage({
    option: { id: 'outro-catalogo', medName: 'Implantar pausa.' },
    recs: openFactorRecs,
    dataRecs: [{ recMedId: 'rec-standard', status: 'DONE', workspaceId: 'ws-06' }],
    derivedMeasures: [
      {
        sourceRecMedId: 'rec-standard',
        derivedRecMedId: 'derivado',
        workspaceId: 'ws-06',
      },
    ],
    workspaceId: 'ws-06',
  }),
  INCORPORATED_DERIVED_CONTROL_MESSAGE,
);
assert.equal(
  measureSelectionBlockMessage({
    option: { id: 'control-pausa', medName: 'Orientações sobre pausa ativa' },
    recs: openFactorRecs,
    workspaceId: 'ws-06',
    linkedControlIds: ['control-pausa'],
  }),
  undefined,
);

const controls = [
  { id: 'control-pausa', medName: 'Orientações sobre pausa ativa' },
  { id: 'control-agenda', medName: 'Agenda de trabalho com horários de descanso' },
  { id: 'na', medName: 'Não aplicável' },
];
const pendingLink = resolveInformativeRecommendationLink({
  rec: { ...standardRec, recType: 'ADM' },
  controls,
  dataRecs: openPlans,
  workspaceId: 'ws-06',
});
assert.equal(pendingLink.kind, 'link');
if (pendingLink.kind === 'link') {
  assert.equal(pendingLink.medType, 'ADM');
  assert.equal('options' in pendingLink, false);
}
const chooseCategory = resolveInformativeRecommendationLink({
  rec: { ...standardRec, recType: 'EPI' },
  controls,
  workspaceId: 'ws-06',
});
assert.equal(chooseCategory.kind, 'link');
if (chooseCategory.kind === 'link') {
  assert.equal(chooseCategory.medType, null);
}
const informative = buildInformativeControlLinkPayload('rec-standard', 'ADM');
assert.deepEqual(informative, {
  informativeControlLink: {
    recMedId: 'rec-standard',
    medType: 'ADM',
  },
});
assert.equal('controlRecMedId' in informative.informativeControlLink, false);
assert.equal('recs' in informative, false);
assert.equal('adms' in informative, false);
assert.equal('engs' in informative, false);
assert.equal('probabilityAfter' in informative, false);

const clear = buildClearInformativeControlLinkPayload('rec-standard');
assert.deepEqual(clear, {
  informativeControlLink: { recMedId: 'rec-standard', controlRecMedId: null },
});
assert.equal('recs' in clear, false);

const linkedInformative = resolveInformativeRecommendationLink({
  rec: { ...standardRec, linkedControlRecMedId: 'catalog-medida' },
  controls: [],
  dataRecs: [{ recMedId: 'rec-standard', status: 'CANCELED', workspaceId: 'ws-06' }],
  workspaceId: 'ws-06',
});
assert.equal(linkedInformative.kind, 'linked');
if (linkedInformative.kind === 'linked') {
  assert.equal(linkedInformative.controlName, 'Implantar pausa');
  assert.equal(linkedInformative.undo.informativeControlLink.controlRecMedId, null);
  assert.equal('recs' in linkedInformative.undo, false);
  assert.equal('adms' in linkedInformative.undo, false);
}

const derivedHere = resolveInformativeRecommendationLink({
  rec: { ...standardRec, linkedControlRecMedId: 'control-agenda' },
  controls: [...controls, { id: 'derivado', medName: 'Pausa incorporada' }],
  dataRecs: [{ recMedId: 'rec-standard', status: 'DONE', workspaceId: 'ws-06' }],
  derivedMeasures: [
    {
      sourceRecMedId: 'rec-standard',
      derivedRecMedId: 'derivado',
      workspaceId: 'ws-06',
    },
  ],
  workspaceId: 'ws-06',
});
assert.equal(derivedHere.kind, 'derived');
if (derivedHere.kind === 'derived') {
  assert.equal(derivedHere.controlName, 'Pausa incorporada');
}
assert.equal('undo' in derivedHere, false);

const pointerOnOtherEstablishment = resolveInformativeRecommendationLink({
  rec: { ...standardRec, linkedControlRecMedId: 'derivado' },
  controls: [...controls, { id: 'derivado', medName: 'Implantar pausa' }],
  dataRecs: [{ recMedId: 'rec-standard', status: 'DONE', workspaceId: 'ws-outro' }],
  derivedMeasures: [
    {
      sourceRecMedId: 'rec-standard',
      derivedRecMedId: 'derivado',
      workspaceId: 'ws-outro',
    },
  ],
  workspaceId: 'ws-06',
});
assert.equal(pointerOnOtherEstablishment.kind, 'linked');
if (pointerOnOtherEstablishment.kind === 'linked') {
  assert.equal(
    pointerOnOtherEstablishment.undo.informativeControlLink.controlRecMedId,
    null,
  );
}

const incorporatedSameName = resolveControlCorrespondencePresentation({
  kind: 'adm',
  controlId: 'derivado',
  controlName: 'Implantar pausa',
  companyId: 'company-1',
  recs: [
    standardRec,
    {
      id: 'rec-link-derivado',
      origin: 'EXISTING_CONTROL',
      recName: 'Implantar pausa',
      linkedControlRecMedId: 'derivado',
    },
  ],
  dataRecs: [{ recMedId: 'rec-standard', status: 'DONE', workspaceId: 'ws-06' }],
  derivedMeasures: [
    {
      sourceRecMedId: 'rec-standard',
      derivedRecMedId: 'derivado',
      workspaceId: 'ws-06',
    },
  ],
  workspaceId: 'ws-06',
});
assert.equal(incorporatedSameName.incorporated, true);
assert.equal(incorporatedSameName.linked, false);
assert.equal(incorporatedSameName.link, undefined);
assert.equal(incorporatedSameName.undo, undefined);

const incorporatedEng = resolveControlCorrespondencePresentation({
  kind: 'eng',
  controlId: 'derivado-eng',
  controlName: 'Guarda incorporada',
  companyId: 'company-1',
  recs: openFactorRecs,
  dataRecs: [{ recMedId: 'rec-standard', status: 'DONE', workspaceId: 'ws-06' }],
  derivedMeasures: [
    {
      sourceRecMedId: 'rec-standard',
      derivedRecMedId: 'derivado-eng',
      workspaceId: 'ws-06',
    },
  ],
  workspaceId: 'ws-06',
});
assert.equal(incorporatedEng.incorporated, true);
assert.equal(incorporatedEng.undo, undefined);

const sameNameOnOtherEstablishment = resolveControlCorrespondencePresentation({
  kind: 'adm',
  controlId: 'derivado',
  controlName: 'Implantar pausa',
  companyId: 'company-1',
  recs: openFactorRecs,
  dataRecs: [{ recMedId: 'rec-standard', status: 'DONE', workspaceId: 'ws-outro' }],
  derivedMeasures: [
    {
      sourceRecMedId: 'rec-standard',
      derivedRecMedId: 'derivado',
      workspaceId: 'ws-outro',
    },
  ],
  workspaceId: 'ws-06',
});
assert.equal(sameNameOnOtherEstablishment.incorporated, false);
assert.equal(sameNameOnOtherEstablishment.linked, false);
assert.equal(sameNameOnOtherEstablishment.link, undefined);
assert.equal(sameNameOnOtherEstablishment.undo, undefined);

const derivedElsewhere = resolveInformativeRecommendationLink({
  rec: standardRec,
  controls,
  dataRecs: [
    { recMedId: 'rec-standard', status: 'DONE', workspaceId: 'ws-outro' },
    { recMedId: 'rec-standard', status: 'PENDING', workspaceId: 'ws-06' },
  ],
  derivedMeasures: [
    {
      sourceRecMedId: 'rec-standard',
      derivedRecMedId: 'derivado',
      workspaceId: 'ws-outro',
    },
  ],
  workspaceId: 'ws-06',
});
assert.equal(derivedElsewhere.kind, 'link');
if (derivedElsewhere.kind === 'link') {
  assert.equal(derivedElsewhere.medType, null);
}

const informativeWithoutIncorporation = resolveControlCorrespondencePresentation({
  kind: 'adm',
  controlId: 'catalog-medida',
  controlName: 'Cadastro informativo',
  companyId: 'company-1',
  recs: [{ ...standardRec, linkedControlRecMedId: 'catalog-medida' }],
  dataRecs: [{ recMedId: 'rec-standard', status: 'PENDING', workspaceId: 'ws-06' }],
  workspaceId: 'ws-06',
});
assert.equal(informativeWithoutIncorporation.incorporated, false);
assert.equal(informativeWithoutIncorporation.linked, false);
assert.equal(
  informativeWithoutIncorporation.link?.admsAddOnly?.[0]?.medName,
  'Cadastro informativo',
);
assert.equal('informativeControlLink' in (informativeWithoutIncorporation.link ?? {}), false);

console.log('existing-control-correspondence.util.spec: ok');
