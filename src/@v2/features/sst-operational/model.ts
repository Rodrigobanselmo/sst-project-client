export function diagnosticMessage(code: string) {
  const messages: Record<string, string> = {
    WORKER_CPF_INVALID: 'Confira o CPF no cadastro do empregado.',
    WORKER_CATEGORY_INVALID:
      'Informe uma categoria válida para o vínculo do empregado.',
    WORKER_CATEGORY_OR_REGISTRATION_REQUIRED:
      'Confira categoria e matrícula do vínculo.',
    WORKER_REGISTRATION_INVALID: 'Confira a matrícula do empregado.',
    EMPLOYER_REGISTRATION_INVALID: 'Confira a inscrição do empregador.',
    EMPLOYER_S1000_REGISTRATION_NOT_INFORMED_OR_INCONSISTENT:
      'Confira a inscrição usada no cadastro do empregador no eSocial.',
    MANDATORY_START_NOT_INFORMED:
      'Informe o início da obrigatoriedade do empregador.',
    ASSIGNMENT_NOT_INFORMED: 'Confira a lotação do empregado neste período.',
    MAPPING_NOT_REVIEWED:
      'Confira o enquadramento eSocial no cadastro do risco.',
    ASSESSMENT_TYPE_NOT_INFORMED:
      'Informe se a avaliação do risco é qualitativa ou quantitativa.',
    ACTIVITIES_NOT_INFORMED_OR_TOO_LONG:
      'Confira a descrição das atividades na caracterização.',
    WORKPLACE_NOT_INFORMED:
      'Confira o ambiente vinculado à condição de trabalho.',
    WORKPLACE_REGISTRATION_INVALID: 'Confira a inscrição do estabelecimento.',
    SECTOR_MISSING_OR_AMBIGUOUS:
      'Confira o setor vinculado ao cargo neste período.',
    SECTOR_DESCRIPTION_INVALID: 'Confira a descrição do setor.',
    SOURCE_CHANGE_NEEDS_REVIEW:
      'Há uma alteração de origem que ainda não pôde ser incorporada à condição de envio.',
    SOURCE_VALIDITY_GAP:
      'Falta uma condição de origem com vigência neste período.',
    RISK_VALIDITY_GAP: 'Confira a vigência da avaliação de risco.',
    HISTORY_APPROVAL_REQUIRED:
      'A condição ainda não foi incorporada pelo cadastro de origem.',
    RESPONSIBLE_NOT_INFORMED:
      'Confira o responsável ambiental e sua vigência no cadastro existente.',
    RESPONSIBLE_CPF_INVALID: 'Confira o CPF do responsável ambiental.',
    RESPONSIBLE_COUNCIL_REQUIRED:
      'Confira conselho, registro e UF do responsável ambiental.',
    EPI_ANSWERS_CONFLICT:
      'Confira as respostas individuais dos EPIs utilizados nesta avaliação.',
    EPI_CERTIFICATE_REQUIRED:
      'Confira o CA dos EPIs utilizados nesta avaliação.',
    EPI_EQUIPMENT_REQUIRED: 'Informe o EPI utilizado na caracterização.',
    CONTROL_ANSWER_NOT_INFORMED:
      'Complete as respostas de EPI/EPC na avaliação de origem.',
    MEASUREMENT_METHOD_INVALID: 'Confira o método da medição cadastrada.',
    MEASUREMENT_UNIT_UNSUPPORTED:
      'Confira a unidade da medição para este agente.',
    MEASUREMENT_NOT_REPRESENTABLE:
      'Confira o valor da medição para este agente.',
    LIMIT_REQUIRED: 'Confira o limite de tolerância desta avaliação.',
    NO_DECLARABLE_PERIOD:
      'Ainda não há um período completo para preparar o envio.',
    ASSESSMENT_START_REQUIRED:
      'Informe o início da avaliação de risco no cadastro de origem.',
    CHARACTERIZATION_LINK_START_REQUIRED:
      'Informe a data de início do vínculo entre o cargo e o ambiente, atividade ou GSE no cadastro de origem.',
    CHARACTERIZATION_ACTIVITY_FORMAT_REQUIRES_REVIEW:
      'Revise o texto das atividades na caracterização de origem: a formatação precisa ser corrigida antes de preparar o envio.',
    EMPLOYMENT_ADMISSION_REQUIRED:
      'Informe a admissão do vínculo no cadastro do empregado.',
    CONTROL_PERIOD_REQUIRES_SPLIT:
      'O EPI ou EPC tem uma vigência diferente da avaliação. Confira e organize os períodos da avaliação antes de preparar o envio.',
    MEASUREMENT_SELECTION_REQUIRED:
      'Há mais de um resultado de medição. Selecione no cadastro qual representa a exposição para o eSocial.',
    MEASUREMENT_SELECTION_INCOMPATIBLE:
      'A medição selecionada não corresponde a este agente. Confira a seleção na avaliação.',
    MEASUREMENT_SELECTION_INCOMPLETE:
      'Complete o resultado escolhido, a data, a unidade e o método da medição.',
    MEASUREMENT_DATE_REQUIRED:
      'Informe a data da medição no cadastro da avaliação.',
    MEASUREMENT_RESULT_REQUIRED: 'Informe o resultado da medição selecionada.',
    MEASUREMENT_SELECTION_REASON_REQUIRED:
      'Informe por que a medição selecionada representa esta exposição.',
    MEASUREMENT_METHOD_REQUIRED: 'Informe o método utilizado na medição.',
    MEASUREMENT_UNIT_REQUIRED: 'Informe a unidade da medição.',
    MEASUREMENT_UNIT_INCONSISTENT:
      'A unidade informada não corresponde ao resultado selecionado.',
    MEASUREMENT_AGENT_INCONSISTENT:
      'O tipo de medição não corresponde ao agente eSocial escolhido.',
    MEASUREMENT_VALUE_INVALID:
      'Confira o resultado da medição: o valor não pôde ser representado no eSocial.',
    MEASUREMENT_LIMIT_BASIS_REQUIRED:
      'Complete o limite de tolerância e a referência utilizada.',
    HEAT_LIMIT_REQUIRED:
      'Complete os dados de metabolismo ou informe o limite de tolerância e sua referência na avaliação de calor.',
    HEAT_INPUT_INVALID: 'Confira o IBUTG e a vestimenta na avaliação de calor.',
    NOISE_IMPACT_APPENDIX_REQUIRED:
      'Confira se a avaliação está cadastrada como ruído de impacto.',
    NOISE_IMPACT_METHOD_REQUIRED:
      'Selecione o método do ruído de impacto: NR-15 ou NHO-01.',
    NOISE_IMPACT_CIRCUIT_REQUIRED:
      'Informe o circuito utilizado para medir o ruído de impacto.',
    NOISE_IMPACT_COUNT_INVALID:
      'Informe uma quantidade de impactos válida para a avaliação pela NHO-01.',
    NOISE_IMPACT_CIRCUIT_INCONSISTENT:
      'Confira o circuito de medição exigido pelo método selecionado para ruído de impacto.',
    XML_SCHEMA_INVALID:
      'Os dados não atendem ao leiaute do S-2240. Confira os impedimentos da avaliação antes de preparar novamente.',
    PRE_SEND_BLOCKED:
      'O envio foi impedido antes da transmissão. Confira os dados e a configuração de certificado antes de retomar.',
    SEND_LEASE_EXPIRED:
      'O resultado da transmissão ainda está sendo conferido. Aguarde a reconciliação antes de outro envio.',
    ACCEPTED_PERIOD_REMOVAL_REQUIRES_REVIEW:
      'A alteração remove um período já aceito. Esse caso exige conferir a necessidade de exclusão do evento antes de outro envio.',
    DECLARATION_IDENTIFICATION_REQUIRES_REVIEW:
      'A identificação do empregador ou do vínculo mudou em relação ao evento aceito. Confira o cadastro e o tratamento necessário antes de enviar.',
    AGENT_DESCRIPTION_INVALID:
      'Confira a descrição do agente nas condições para o eSocial da avaliação. Informe até 100 caracteres.',
    JUDICIAL_PROCESS_REQUIRED:
      'Este enquadramento exige informar o processo judicial nas condições para o eSocial da avaliação.',
    JUDICIAL_PROCESS_INVALID:
      'Confira o número do processo judicial nas condições da avaliação: use 17, 20 ou 21 dígitos.',
    JUDICIAL_PROCESS_NOT_APPLICABLE:
      'O processo judicial informado não se aplica a este enquadramento. Confira as condições para o eSocial da avaliação.',
    DECLARATION_NOTES_TOO_LONG:
      'As observações para o eSocial devem ter até 999 caracteres.',
  };
  return (
    messages[code] ||
    'Há uma informação da condição de trabalho que precisa ser conferida antes de preparar o envio.'
  );
}
