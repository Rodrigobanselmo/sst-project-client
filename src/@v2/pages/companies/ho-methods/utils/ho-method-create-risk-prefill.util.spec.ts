import { StatusEnum } from 'project/enum/status.enum';
import { RiskEnum } from 'project/enum/risk.enums';

import {
  buildHoMethodCreateRiskPrefill,
  normalizeOccupationalLimitUnit,
  parseOccupationalLimitExpression,
  resolveHoMethodRiskPropagationMeans,
} from './ho-method-create-risk-prefill.util';

describe('ho-method-create-risk-prefill.util', () => {
  const baseParams = {
    companyId: 'company-1',
    agent: {
      substanceName: 'Toluene',
      cas: '108-88-3',
      synonyms: [],
    },
    method: {
      displayName: 'NIOSH 1501',
    },
  };

  it('separa valor e unidade de limite ocupacional', () => {
    expect(parseOccupationalLimitExpression('0.5 mg/m3')).toEqual(
      expect.objectContaining({
        value: '0,5',
        unit: 'mg/m3',
      }),
    );
    expect(parseOccupationalLimitExpression('PEL: 0.5 mg/m³')).toEqual(
      expect.objectContaining({
        value: '0,5',
        unit: 'mg/m3',
      }),
    );
    expect(parseOccupationalLimitExpression('0.5 mg/m^3')).toEqual(
      expect.objectContaining({
        value: '0,5',
        unit: 'mg/m3',
      }),
    );
  });

  it('normaliza unidades conhecidas', () => {
    expect(normalizeOccupationalLimitUnit('mg/m³')).toBe('mg/m3');
    expect(normalizeOccupationalLimitUnit('mg/cu m')).toBe('mg/m3');
  });

  it('preenche unidade compartilhada quando todos os limites concordam', () => {
    const result = buildHoMethodCreateRiskPrefill({
      ...baseParams,
      occupationalLimits: {
        oshaPel: { value: '0.5 mg/m3', confidence: 'high' },
        nioshRel: { value: '0.5 mg/m3', confidence: 'high' },
      } as any,
    });

    expect(result.oshaPel).toBe('0,5');
    expect(result.nioshRel).toBe('0,5');
    expect(result.unit).toBe('mg/m3');
  });

  it('não escolhe unidade automaticamente em conflito', () => {
    const result = buildHoMethodCreateRiskPrefill({
      ...baseParams,
      occupationalLimits: {
        oshaPel: { value: '0.5 mg/m3', confidence: 'high' },
        nioshRel: { value: '100 ppm', confidence: 'high' },
      } as any,
    });

    expect(result.unit).toBeUndefined();
    expect(result.coments).toContain('Unidades de limite conflitantes');
  });

  it('preenche meio de propagação como Ar por padrão', () => {
    const result = buildHoMethodCreateRiskPrefill(baseParams);
    expect(result.propagation).toBe('Ar');
  });

  it('preenche meio de propagação como Ar, pele quando há indicação dérmica', () => {
    const propagation = resolveHoMethodRiskPropagationMeans({
      occupationalLimits: {
        oshaPel: { value: '0.5 mg/m3 (skin)', confidence: 'high' },
      } as any,
      parseContext: {
        fields: {
          observations: { value: 'Absorption through the skin', confidence: 'high' },
        },
      } as any,
    });

    expect(propagation).toBe('Ar, pele');

    const result = buildHoMethodCreateRiskPrefill({
      ...baseParams,
      occupationalLimits: {
        oshaPel: { value: '0.5 mg/m3 (skin)', confidence: 'high' },
      } as any,
    });

    expect(result.propagation).toBe('Ar, pele');
    expect(result.type).toBe(RiskEnum.QUI);
    expect(result.status).toBe(StatusEnum.ACTIVE);
  });
});
