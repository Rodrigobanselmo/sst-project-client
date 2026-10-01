import { SectorRiskPresenceOrigin } from '@v2/services/security/sector-risk-presence/sector-risk-presence.types';

export type SectorRiskPresenceNavigationTarget = {
  homogeneousGroup: {
    id: string;
    name: string;
    type: string | null;
    description?: string;
    hierarchy?: { name: string };
  };
  riskFactor: {
    id: string;
    name: string;
  };
};

export function riskNameFromPresenceLabel(label: string): string {
  return label.replace(/^\([^)]*\)\s*/, '');
}

export function buildSectorRiskPresenceNavigation(params: {
  origin: SectorRiskPresenceOrigin;
  riskId: string;
  riskLabel: string;
}): SectorRiskPresenceNavigationTarget {
  const riskFactor = {
    id: params.riskId,
    name: riskNameFromPresenceLabel(params.riskLabel),
  };
  const { origin } = params;

  if (origin.kind === 'GSE') {
    return {
      homogeneousGroup: {
        id: origin.id,
        name: origin.ghoName,
        type: null,
      },
      riskFactor,
    };
  }

  if (origin.kind === 'HIERARCHY') {
    return {
      homogeneousGroup: {
        id: origin.id,
        name: origin.name,
        type: 'HIERARCHY',
        ...(origin.hierarchyName ? { hierarchy: { name: origin.hierarchyName } } : {}),
      },
      riskFactor,
    };
  }

  return {
    homogeneousGroup: {
      id: origin.id,
      name: origin.name,
      type: origin.ghoType,
      description: origin.ghoName,
    },
    riskFactor,
  };
}
