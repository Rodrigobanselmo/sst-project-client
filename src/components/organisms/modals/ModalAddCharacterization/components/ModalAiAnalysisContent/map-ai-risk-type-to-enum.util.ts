import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';

export function mapAiRiskTypeToEnum(type: string): RiskTypeEnum {
  const typeUpper = type.toUpperCase();
  if (Object.values(RiskTypeEnum).includes(typeUpper as RiskTypeEnum)) {
    return typeUpper as RiskTypeEnum;
  }
  return RiskTypeEnum.OUTROS;
}
