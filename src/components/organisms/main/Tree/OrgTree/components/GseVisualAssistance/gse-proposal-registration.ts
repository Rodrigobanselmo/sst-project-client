import type { IGho } from 'core/interfaces/api/IGho';

const normalized = (value: string) =>
  value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');

/** Presentation only. Neither names nor this inferred convention establish GSE identity. */
export function suggestGseName(
  functionalName: string,
  groups: IGho[],
  reservedNames: string[] = [],
): string {
  const fallback = `GSE — ${functionalName}`;
  const patterns = new Map<
    string,
    {
      prefix: string;
      separator: string;
      members: { number: string | null; name: string }[];
    }
  >();
  for (const group of groups) {
    const match = group.name.trim().match(/^(GSE\b.*?)\s+([—–-])\s+(.+)$/i);
    if (!match) continue;
    const prefix = match[1].match(/^(.*?)(?:\s+(\d+))?$/)!;
    const base = prefix[1].trim(),
      key = `${normalized(base)}|${match[2]}`;
    const pattern = patterns.get(key) || {
      prefix: base,
      separator: match[2],
      members: [],
    };
    pattern.members.push({ number: prefix[2] || null, name: group.name });
    patterns.set(key, pattern);
  }
  const predominant = [...patterns.values()].find(
    (p) =>
      p.members.length >= 2 &&
      p.members.length > groups.length / 2 &&
      new Set(p.members.map((m) => normalized(m.name))).size >= 2,
  );
  if (!predominant) return fallback;
  const { prefix, separator, members } = predominant;
  const numbers = members.map((m) => Number(m.number)).sort((a, b) => a - b);
  const numbered =
    members.every((m) => m.number !== null) &&
    (members.every((m) => !/^0\d/.test(m.number!)) ||
      members.every((m) => m.number!.length === members[0].number!.length)) &&
    numbers.every(
      (n, i) =>
        Number.isSafeInteger(n) && n >= 0 && (!i || n === numbers[i - 1] + 1),
    );
  if (!numbered) return `${prefix} ${separator} ${functionalName}`;
  const reserved = new Set(
    [...groups.map((g) => g.name), ...reservedNames].map(normalized),
  );
  const occupied = new Set(numbers);
  for (const name of reservedNames) {
    const match = name.trim().match(/^(GSE\b.*?)\s+(\d+)\s+([—–-])\s+(.+)$/i);
    if (
      match &&
      normalized(match[1]) === normalized(prefix) &&
      match[3] === separator
    )
      occupied.add(Number(match[2]));
  }
  let next = numbers[numbers.length - 1] + 1;
  while (Number.isSafeInteger(next)) {
    const name = `${prefix} ${String(next).padStart(members[0].number!.length, '0')} ${separator} ${functionalName}`;
    if (!occupied.has(next) && !reserved.has(normalized(name))) return name;
    next++;
  }
  return fallback;
}

/** The description concerns a proposal, not an assertion of links or characterized exposure. */
export function describeGseProposal(input: {
  company: string;
  workspace: string;
  sector: string;
  roles: string[];
}): string {
  const concise = (text: string) =>
    text.trim().replace(/\s+/g, ' ').slice(0, 180);
  const roles = [...new Set(input.roles.map(concise).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, 'pt-BR'),
  );
  const context = `Proposta de Grupo Similar de Exposição para ${concise(input.company)}, estabelecimento ${concise(input.workspace)}, com origem na unidade organizacional ${concise(input.sector)}.`;
  const caution =
    'Agrupamento sugerido pela estrutura organizacional, para avaliação de possível similaridade das atividades e condições de exposição. A equivalência de exposição depende de validação técnica; não há caracterização de agentes ou condições de exposição nesta análise. Os cargos citados foram considerados na proposta e não representam, por si só, vínculos efetivamente cadastrados.';
  const selected: string[] = [];
  for (const role of roles) {
    const candidate = [...selected, role];
    if (
      `${context} Cargos considerados na proposta (${roles.length}): ${candidate.join('; ')}. ${caution}`
        .length > 1900
    )
      break;
    selected.push(role);
  }
  const list = roles.length
    ? ` Cargos considerados na proposta (${roles.length}): ${selected.join('; ')}${selected.length < roles.length ? '; demais cargos da proposta não enumerados neste resumo' : ''}.`
    : '';
  return `${context}${list} ${caution}`;
}
