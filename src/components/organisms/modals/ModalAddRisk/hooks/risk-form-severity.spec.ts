/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/modals/ModalAddRisk/hooks/risk-form-severity.spec.ts
 */
import assert from 'assert';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import * as Yup from 'yup';

import { getRiskFactorSeverityRadioOptions } from '@v2/constants/risk-factor-severity-options.constant';
import { riskSchema } from 'core/utils/schemas/risk.schema';

import { toRiskFormSeverity } from './risk-form-severity';

const run = async (name: string, fn: () => void | Promise<void>) => {
  await fn();
  console.log(`ok - ${name}`);
};

const selectedOption = (severity: unknown) => {
  const value = toRiskFormSeverity(severity);
  return getRiskFactorSeverityRadioOptions('QUI').find((option) => option.value === value);
};

const severitySchema = Yup.object().shape(riskSchema);

const hookSource = readFileSync(
  resolve('src/components/organisms/modals/ModalAddRisk/hooks/useAddRisk.ts'),
  'utf8',
);

(async () => {
  await run('severity=5 selects option 5', () => {
    assert.equal(toRiskFormSeverity(5), '5');
    assert.equal(selectedOption(5)?.content, '5');
  });

  await run('severity=1 selects option 1', () => {
    assert.equal(toRiskFormSeverity(1), '1');
    assert.equal(selectedOption(1)?.content, '1');
    assert.equal(toRiskFormSeverity('3'), '3');
  });

  await run('severity 0/null/undefined/invalid keep no selection and save stays blocked', async () => {
    [0, null, undefined, '', ' ', 6, -1, 2.5, 'abc', NaN].forEach((value) => {
      assert.equal(toRiskFormSeverity(value), undefined);
      assert.equal(selectedOption(value), undefined);
    });

    await assert.rejects(
      severitySchema.validateAt('severity', { severity: toRiskFormSeverity(0) }),
      /Defina a severidade/,
    );
    await assert.doesNotReject(
      severitySchema.validateAt('severity', { severity: toRiskFormSeverity(5) }),
    );
  });

  await run('hydration never overwrites a severity changed by the user', () => {
    assert.equal(
      hookSource.includes("syncField('severity', toRiskFormSeverity(initialData.severity));"),
      true,
    );
    assert.equal(hookSource.includes('if (getFieldState(name).isDirty) return;'), true);
    assert.equal(hookSource.includes('if (value == null || value === \'\') return;'), true);
  });

  console.log('\nAll risk-form-severity tests passed.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
