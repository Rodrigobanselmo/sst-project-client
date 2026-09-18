import { RiskMatrixCoverageKeyEnum } from '@v2/services/security/risk-matrix/service/risk-matrix.types';

const HEADING_PREFIXES = [
  'Medidas de Prevenção e Controle',
  'Medidas de Controle',
  'Exemplos no COPSOQ III',
  'Qualitativo',
  'Quantitativo',
  'Vibração (VCI)',
  'Vibração (VMB)',
  'Intensidade',
  'Frequência',
  'Químicos',
  'Ruído',
  'Calor',
] as const;

export type CriterionHierarchyNode =
  | { kind: 'heading'; text: string; depth: 0 | 1 }
  | { kind: 'body'; text: string; depth: 0 | 1 | 2 }
  | { kind: 'spacer' };

export type CoverageCriterionDisplayItem = {
  key: string;
  coverageKeys: RiskMatrixCoverageKeyEnum[];
  label: string;
  criterion: string;
  isUndefined: boolean;
};

type CoverageOption = {
  value: RiskMatrixCoverageKeyEnum;
  code: string;
  title: string;
};

const headingDepth = (heading: string): 0 | 1 => {
  if (
    heading === 'Químicos' ||
    heading === 'Ruído' ||
    heading.startsWith('Calor') ||
    heading.startsWith('Vibração') ||
    heading.startsWith('Intensidade') ||
    heading.startsWith('Frequência')
  ) {
    return 1;
  }
  return 0;
};

const matchHeading = (line: string) => {
  const trimmed = line.trim();
  for (const heading of HEADING_PREFIXES) {
    if (trimmed === heading || trimmed === `${heading}:`) {
      return { heading: trimmed, rest: '' };
    }
    if (trimmed.startsWith(`${heading} `) || trimmed.startsWith(`${heading}:`)) {
      return {
        heading,
        rest: trimmed.slice(heading.length).replace(/^[:\s]+/, '').trim(),
      };
    }
  }
  return null;
};

const isNestedLine = (line: string) => {
  const trimmed = line.trim();
  return /^\s+/.test(line) || /^(aren|VDVR)\s*:/i.test(trimmed);
};

export function parseCriterionHierarchy(criterion: string): CriterionHierarchyNode[] {
  const nodes: CriterionHierarchyNode[] = [];
  const lines = criterion.replace(/\r\n/g, '\n').split('\n');
  let afterIndependentBreak = /\n\s*\n/.test(criterion);

  for (const line of lines) {
    if (!line.trim()) {
      if (nodes.at(-1)?.kind !== 'spacer') {
        nodes.push({ kind: 'spacer' });
      }
      afterIndependentBreak = true;
      continue;
    }

    const heading = matchHeading(line);
    if (heading) {
      afterIndependentBreak = false;
      nodes.push({
        kind: 'heading',
        text: heading.heading,
        depth: headingDepth(heading.heading),
      });
      if (heading.rest) {
        nodes.push({
          kind: 'body',
          text: heading.rest,
          depth: headingDepth(heading.heading) === 0 ? 1 : 2,
        });
      }
      continue;
    }

    nodes.push({
      kind: 'body',
      text: line.trim(),
      depth: isNestedLine(line) ? 2 : afterIndependentBreak ? 0 : 1,
    });
    afterIndependentBreak = false;
  }

  while (nodes.at(0)?.kind === 'spacer') nodes.shift();
  while (nodes.at(-1)?.kind === 'spacer') nodes.pop();
  return nodes;
}

export type CriterionSiblingGroup = {
  title: string | null;
  body: string[];
};

export function groupCriterionSiblings(
  nodes: CriterionHierarchyNode[],
): CriterionSiblingGroup[] {
  const groups: CriterionSiblingGroup[] = [];

  for (const node of nodes) {
    if (node.kind === 'spacer') continue;

    if (node.kind === 'heading' && node.depth === 0) {
      groups.push({ title: node.text, body: [] });
      continue;
    }

    if (node.kind === 'body' && node.depth === 0) {
      groups.push({ title: null, body: [node.text] });
      continue;
    }

    if (groups.length === 0) {
      groups.push({ title: null, body: [] });
    }

    groups.at(-1)?.body.push(node.text);
  }

  return groups;
}

export function groupCoverageCriteriaForDisplay(params: {
  selectedCoverages: RiskMatrixCoverageKeyEnum[];
  criteriaByCoverage: Partial<Record<RiskMatrixCoverageKeyEnum, string>>;
  undefinedCoverages?: RiskMatrixCoverageKeyEnum[];
  options: CoverageOption[];
}): CoverageCriterionDisplayItem[] {
  const undefinedCoverages = params.undefinedCoverages ?? [];

  return params.options
    .filter((option) => params.selectedCoverages.includes(option.value))
    .map((option) => ({
      key: option.value,
      coverageKeys: [option.value],
      label: `${option.code} — ${option.title}`,
      criterion: params.criteriaByCoverage[option.value] ?? '',
      isUndefined: undefinedCoverages.includes(option.value),
    }));
}
