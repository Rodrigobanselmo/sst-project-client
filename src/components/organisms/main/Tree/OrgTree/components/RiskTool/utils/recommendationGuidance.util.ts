export function recommendationGuidance(level?: number | null): string | null {
  if (level === 6) return 'Interrompa a atividade conforme a avaliação e cadastre as recomendações necessárias antes da retomada.';
  if (level === 4 || level === 5) return 'Este nível exige recomendação pelo critério de priorização do sistema. Cadastre uma recomendação para reduzir o risco residual.';
  if (level === 3) return 'Por boa prática, o sistema sugere cadastrar uma recomendação para reduzir o risco para baixo ou muito baixo. Não é obrigatório pelo critério de priorização.';
  if (level === 1 || level === 2) return 'Não é necessário cadastrar recomendação adicional para este nível de risco. Mantenha os controles existentes e o acompanhamento.';
  return null;
}
