import type { ChemicalOccupationalEnrichResult } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

export function occupationalSearchMessages(
  result: ChemicalOccupationalEnrichResult,
) {
  return [
    { provider: 'NIOSH_POCKET_GUIDE', label: 'NIOSH' },
    { provider: 'OSHA_OCCUPATIONAL_CHEMICAL_DB', label: 'OSHA' },
  ].map(({ provider, label }) => {
    const attempt = result.occupationalData.attempts?.find(
      (item) => item.provider === provider,
    );
    const outcome = attempt?.outcome;
    const completed = outcome === 'HIT' || outcome === 'MISS';
    let message =
      'Não foi possível consultar esta fonte agora. Você pode tentar novamente mais tarde.';
    if (outcome === 'DISABLED')
      message = 'Consulta a esta fonte não habilitada neste ambiente.';
    else if (outcome === 'SKIPPED')
      message = 'Esta fonte não foi consultada nesta pesquisa.';
    else if (outcome === 'HIT')
      message =
        'Dados ocupacionais encontrados. Confira os valores antes de aplicar.';
    else if (outcome === 'MISS')
      message =
        attempt?.matchKind === 'CAS'
          ? 'Substância localizada pelo CAS, mas sem limites publicados nos campos pesquisados.'
          : attempt?.matchKind === 'NAME'
            ? 'Correspondência apenas pelo nome, sem limites nos campos pesquisados.'
            : `Pesquisa concluída: nenhuma correspondência para o CAS ${result.identity.cas} nesta fonte.`;
    return { label, message, completed };
  });
}
