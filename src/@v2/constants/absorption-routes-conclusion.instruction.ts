export const ABSORPTION_ROUTES_NOT_APPLICABLE = 'Não se aplica';
export const ABSORPTION_ROUTES_UNDETERMINED = 'Não determinada';

export const ABSORPTION_ROUTES_CONCLUSION_HEADER =
  'CONCLUSÃO OBRIGATÓRIA DE VIAS DE ABSORÇÃO';

/**
 * Instrução complementar enviada junto com o prompt resolvido.
 * Não substitui o texto salvo em SystemAiPrompt.
 */
export const ABSORPTION_ROUTES_CONCLUSION_RULES = `${ABSORPTION_ROUTES_CONCLUSION_HEADER}

O campo absorptionRoutes corresponde, no formulário, a "Vias de absorção / entrada no organismo".
Escolha uma das três conclusões conforme o mecanismo do fator. Não invente vias apenas para preencher o campo e não converta uma resposta vazia em uma dessas conclusões sem analisar o contexto técnico.

Há três conclusões possíveis:

1. Via fundamentada: informe a via de absorção ou de entrada no organismo tecnicamente pertinente.
2. ${ABSORPTION_ROUTES_NOT_APPLICABLE}: use exatamente esse texto quando não existir mecanismo pertinente de absorção ou de entrada no organismo.
3. ${ABSORPTION_ROUTES_UNDETERMINED}: use exatamente esse texto quando a informação for potencialmente pertinente, mas insuficiente para determinar a via. Não use "${ABSORPTION_ROUTES_NOT_APPLICABLE}" por insuficiência de dados.

Esta instrução complementar prevalece sobre orientação anterior que determine "${ABSORPTION_ROUTES_NOT_APPLICABLE}" apenas porque o fator é biológico.

Exemplos que permanecem "${ABSORPTION_ROUTES_NOT_APPLICABLE}":
- Queda do mesmo nível: ${ABSORPTION_ROUTES_NOT_APPLICABLE}. Região atingida: qualquer segmento corporal.
- Contato com partes móveis: ${ABSORPTION_ROUTES_NOT_APPLICABLE}.
- Movimentos repetitivos: ${ABSORPTION_ROUTES_NOT_APPLICABLE}. Região atingida: segmentos musculoesqueléticos envolvidos.
- Levantamento manual de cargas: ${ABSORPTION_ROUTES_NOT_APPLICABLE}.
- Ruído: ${ABSORPTION_ROUTES_NOT_APPLICABLE}. Região atingida: sistema auditivo.
- Vibração: ${ABSORPTION_ROUTES_NOT_APPLICABLE}.

Agentes químicos: identifique vias de absorção quando houver fundamento técnico, principalmente inalatória, cutânea e digestiva, inclusive pela FISPQ daquele produto.
Contato dérmico não significa absorção cutânea. Lesão local pode ocorrer sem absorção sistêmica.
- Solvente com via inalatória fundamentada: Inalatória.
- Substância com absorção cutânea fundamentada: Cutânea.
- Produto químico genérico sem dados suficientes: ${ABSORPTION_ROUTES_UNDETERMINED}.
- Contato dérmico com ácidos ou alcalinos, sem comprovação de absorção: ${ABSORPTION_ROUTES_UNDETERMINED}. Não presuma via cutânea apenas pelo contato com a pele. Região atingida: pele.

Agentes biológicos: não preencha "${ABSORPTION_ROUTES_NOT_APPLICABLE}" somente porque o fator é biológico. Eles podem entrar no organismo por portas de entrada, ainda que isso não seja absorção toxicológica de substância química.
Diferencie via de transmissão, via de exposição e porta de entrada. Não as trate como sinônimos automáticos. A porta de entrada pertinente pode ser descrita em absorptionRoutes.
Não presuma que todas as vias estejam presentes em qualquer atividade. Em fator genérico, use redação condicional e tecnicamente defensável, conforme o agente e a forma de exposição.
Vias possíveis, somente quando sustentadas pelo agente e pelo mecanismo:
- Inalatória, por bioaerossóis ou poeiras contaminadas.
- Mucosas, por contato ou respingos nos olhos, nariz ou boca.
- Digestiva, por ingestão acidental.
- Percutânea, por cortes ou perfurações com materiais contaminados.
- Entrada por pele não íntegra, quando pertinente.
Contato com pele íntegra não autoriza, por si só, entrada percutânea. Diferencie pele íntegra, pele não íntegra e mucosas.
Exposição a bioaerossóis pode fundamentar a via inalatória. Perfuração por material contaminado pode fundamentar a entrada percutânea.
Sem informação suficiente para estabelecer uma via, use exatamente "${ABSORPTION_ROUTES_UNDETERMINED}".
Referência conceitual para resíduo biológico em atividade não relacionada à coleta e industrialização. Adapte ao fator analisado e não copie como resposta fixa:
Região atingida: "Pele, mucosas, vias respiratórias e sistema gastrointestinal, conforme o agente biológico e a forma de exposição."
Vias de absorção / entrada no organismo: "Inalatória, por bioaerossóis ou poeiras contaminadas; mucosas, por contato ou respingos; digestiva, por ingestão acidental; e percutânea, por cortes ou perfurações com materiais contaminados, conforme as condições de exposição."

Agentes físicos e ergonômicos: ruído, vibração, queda do mesmo nível, contato com partes móveis, movimentos repetitivos e levantamento manual de cargas usam "${ABSORPTION_ROUTES_NOT_APPLICABLE}".
Fator de acidente: use "${ABSORPTION_ROUTES_NOT_APPLICABLE}" quando não houver inoculação nem penetração de agente. Se houver inoculação, perfuração por material contaminado ou exposição a agente químico ou biológico, avalie o mecanismo específico e não imponha "${ABSORPTION_ROUTES_NOT_APPLICABLE}" apenas pela classificação de acidente.

Região atingida permanece independente. Informe órgãos-alvo ou segmentos corporais potencialmente afetados quando isso for tecnicamente defensável, e evite afirmação excessivamente específica quando o fator for genérico.

"${ABSORPTION_ROUTES_NOT_APPLICABLE}" e "${ABSORPTION_ROUTES_UNDETERMINED}" são conclusões explícitas da resposta. Não devolva absorptionRoutes vazio no lugar delas.
O valor anterior do formulário e o cadastro interno, inclusive quando forem "${ABSORPTION_ROUTES_NOT_APPLICABLE}" ou "${ABSORPTION_ROUTES_UNDETERMINED}", não são a resposta. Reavalie absorptionRoutes pelo mecanismo do fator. Se a conclusão técnica for outra, devolva a nova conclusão e não repita o valor anterior.`;

/**
 * Garante a instrução complementar atual na mensagem enviada ao modelo.
 * O registro persistido não é alterado. Se o prompt já trouxer um bloco anterior
 * com o mesmo cabeçalho, esse bloco é substituído pelo texto vigente.
 */
export function composeRiskFactorAiSystemPrompt(resolvedPrompt: string): string {
  const base = resolvedPrompt.trim();
  if (!base) return ABSORPTION_ROUTES_CONCLUSION_RULES;

  const headerIndex = base.indexOf(ABSORPTION_ROUTES_CONCLUSION_HEADER);
  if (headerIndex === -1) {
    return `${base}\n\n${ABSORPTION_ROUTES_CONCLUSION_RULES}`;
  }

  const prefix = base.slice(0, headerIndex).trimEnd();
  return prefix
    ? `${prefix}\n\n${ABSORPTION_ROUTES_CONCLUSION_RULES}`
    : ABSORPTION_ROUTES_CONCLUSION_RULES;
}

export function formatCurrentAbsorptionRoutesContext(
  value?: string | null,
): string | null {
  const current = value?.trim();
  if (!current) return null;

  return [
    `Valor anterior de absorptionRoutes no formulário: ${current}.`,
    'Esse valor anterior não é a resposta.',
    'Reavalie a via de absorção ou de entrada no organismo pelo mecanismo do fator.',
    `Não repita "${ABSORPTION_ROUTES_NOT_APPLICABLE}" nem "${ABSORPTION_ROUTES_UNDETERMINED}" só porque esse era o valor anterior.`,
  ].join(' ');
}

export const RISK_FACTOR_AI_SUGGESTION_TASK_PROMPT =
  'Com base no contexto e no critério de severidade do sistema, gere risk, symptoms, affectedRegion, absorptionRoutes, severity (1-5), confidence, sourceTrace e warnings. O campo absorptionRoutes é "Vias de absorção / entrada no organismo". Siga a conclusão obrigatória: via fundamentada, "Não se aplica" ou "Não determinada". Não invente vias apenas para preencher o campo. Não confunda contato dérmico com absorção cutânea. Para agente biológico, identifique a porta de entrada pertinente e não use "Não se aplica" apenas por ser biológico. Ruído, vibração, queda do mesmo nível, movimentos repetitivos e levantamento manual de cargas permanecem "Não se aplica", salvo mecanismo específico de entrada. A região atingida pode identificar o órgão-alvo ou o segmento corporal quando houver fundamento. Os textos devem estar prontos para uso no sistema, sem bullets ou justificativas. Use note=null em sourceTrace quando não houver observação. Para severidade, registre em sourceTrace a justificativa técnica conforme a escala 1-5.';
