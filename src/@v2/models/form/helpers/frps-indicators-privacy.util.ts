/**
 * Predicado de sigilo dos Indicadores/Gráficos FRPS.
 *
 * Espelha a regra da API (`shouldHideFrpsIndicatorData`):
 * oculta quando n < mínimo, exceto em link compartilhável.
 *
 * O mínimo vem do caller (`indicatorsMinParticipants` do GET /frps-privacy).
 * Não há default numérico aqui.
 */
export function shouldHideFrpsIndicatorData(params: {
  isShareableLink: boolean;
  participantCount: number;
  minParticipants: number;
}): boolean {
  return (
    !params.isShareableLink && params.participantCount < params.minParticipants
  );
}
