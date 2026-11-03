const resultNames: Record<string, string> = {
  twaValue: 'Jornada — TWA',
  nr15ltValue: 'NR-15',
  stelValue: 'Curta duração — STEL',
  vmpValue: 'Valor máximo',
  ltcatq3: 'Ruído — Q3',
  ltcatq5: 'Ruído — Q5',
  nr15q5: 'Ruído — NR-15',
  impactPeak: 'Ruído de impacto',
  ibtug: 'Calor — IBUTG',
  aren: 'Vibração — AREN',
  vdvr: 'Vibração — VDVR',
  doseFB: 'Corpo inteiro — ocupacional',
  doseEye: 'Cristalino — ocupacional',
  doseSkin: 'Pele — ocupacional',
  doseHand: 'Mãos e pés — ocupacional',
  doseFBPublic: 'Corpo inteiro — público',
  doseEyePublic: 'Cristalino — público',
  doseSkinPublic: 'Pele — público',
};

export function measurementOptions(
  type: string,
  risk?: { appendix?: string; esocialCode?: string; esocial?: { id?: string } },
) {
  const code = risk?.esocial?.id || risk?.esocialCode;
  const keys: Record<string, string[]> = {
    QUI: ['twaValue', 'nr15ltValue', 'stelValue', 'vmpValue'],
    NOISE:
      String(risk?.appendix || '') === '2'
        ? ['impactPeak']
        : ['ltcatq3', 'ltcatq5', 'nr15q5'],
    NOISE_I: ['impactPeak'],
    HEAT: ['ibtug'],
    VL: ['aren'],
    VFB:
      code === '02.01.003'
        ? ['aren']
        : code === '02.01.004'
          ? ['vdvr']
          : ['aren', 'vdvr'],
    RADIATION: [
      'doseFB',
      'doseEye',
      'doseSkin',
      'doseHand',
      'doseFBPublic',
      'doseEyePublic',
      'doseSkinPublic',
    ],
  };
  return (keys[type] || []).map((value) => ({
    value,
    label: resultNames[value],
  }));
}
