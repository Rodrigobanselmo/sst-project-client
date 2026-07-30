import assert from 'assert';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { IProfessional } from 'core/interfaces/api/IProfessional';

import {
  describeDocumentProfessionalPersistence,
  getPersonProfessionalId,
  groupProfessionalsForDocumentSelection,
  resolveLegacyCouncilIdForDocument,
  resolvePersistenceCouncilId,
  toDocumentProfessionalSelection,
  toDocumentProfessionalsPersistencePayload,
} from './document-professional-selection.util';

const base = (overrides: Partial<IProfessional> = {}): IProfessional =>
  ({
    id: 0,
    name: '',
    email: '',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    companyId: '',
    formation: [],
    certifications: [],
    cpf: '',
    phone: '',
    userId: 0,
    type: ProfessionalTypeEnum.ENGINEER,
    status: StatusEnum.ACTIVE,
    councils: [],
    crm: '',
    crea: '',
    ...overrides,
  }) as IProfessional;

const alexPersonShaped = () =>
  base({
    id: 15,
    name: 'Alex Abreu Marins',
    type: ProfessionalTypeEnum.ENGINEER,
    formation: [
      'Engenheiro de Segurança do Trabalho',
      'Engenheiro Ambiental',
      'Higienista Ambiental',
    ],
    certifications: ['Higienista ABHO — Certificado: HOC 0061'],
    cpf: '71628843500',
    councils: [
      {
        id: 1,
        councilType: 'CREA',
        councilUF: 'BA',
        councilId: '54947',
        created_at: new Date(),
        updated_at: new Date(),
        professionalId: 15,
        professional: {} as IProfessional,
      },
    ],
  });

const andersonCouncilShaped = () =>
  base({
    id: 15,
    professionalId: 10,
    name: 'Anderson Pereira de Almeida',
    type: ProfessionalTypeEnum.ENGINEER,
    councilType: '',
    councilUF: '',
    councilId: '',
    councils: [],
  });

const leandroPersonShaped = () =>
  base({
    id: 24,
    name: 'Leandro Lourenço',
    type: ProfessionalTypeEnum.ENGINEER,
    councils: [
      {
        id: 1082,
        councilType: 'CREA',
        councilUF: 'BA',
        councilId: '73378',
        created_at: new Date(),
        updated_at: new Date(),
        professionalId: 24,
        professional: {} as IProfessional,
      },
    ],
  });

const leandroCouncilShaped = () =>
  base({
    id: 1082,
    professionalId: 24,
    name: 'Leandro Lourenço',
    type: ProfessionalTypeEnum.ENGINEER,
    councilType: 'CREA',
    councilUF: 'BA',
    councilId: '73378',
    councils: [],
    professionalDocumentDataSignature: {
      documentDataId: 'doc',
      professionalId: 1082,
      isSigner: true,
      isElaborator: true,
    },
  });

{
  const selected = toDocumentProfessionalSelection(alexPersonShaped(), {
    isSigner: true,
    isElaborator: true,
  });
  assert.strictEqual(getPersonProfessionalId(selected), 15);
  assert.strictEqual(resolvePersistenceCouncilId(selected), 1);
  assert.strictEqual(resolveLegacyCouncilIdForDocument(selected), 1);
  assert.notStrictEqual(resolveLegacyCouncilIdForDocument(selected), 15);

  const payload = toDocumentProfessionalsPersistencePayload([selected]);
  assert.strictEqual(payload.length, 1);
  assert.strictEqual(payload[0].professionalId, 1);
  assert.notStrictEqual(payload[0].professionalId, 15);
}

{
  const alex = toDocumentProfessionalSelection(alexPersonShaped(), {
    isSigner: true,
    isElaborator: true,
  });
  const persisted = resolveLegacyCouncilIdForDocument(alex);
  assert.strictEqual(persisted, 1);
  assert.notStrictEqual(persisted, andersonCouncilShaped().id);
}

{
  const selected = toDocumentProfessionalSelection(leandroPersonShaped(), {
    isSigner: true,
    isElaborator: true,
  });
  assert.strictEqual(getPersonProfessionalId(selected), 24);
  assert.strictEqual(resolveLegacyCouncilIdForDocument(selected), 1082);
  const payload = toDocumentProfessionalsPersistencePayload([selected]);
  assert.strictEqual(payload[0].professionalId, 1082);
}

{
  const alexCouncilShaped = base({
    id: 1,
    professionalId: 15,
    name: 'Alex Abreu Marins',
    type: ProfessionalTypeEnum.ENGINEER,
    councilType: 'CREA',
    councilUF: 'BA',
    councilId: '54947',
    councils: [],
    professionalDocumentDataSignature: {
      documentDataId: 'doc',
      professionalId: 1,
      isSigner: true,
      isElaborator: true,
    },
  });

  const grouped = groupProfessionalsForDocumentSelection([
    leandroCouncilShaped(),
    alexCouncilShaped,
  ]);
  assert.strictEqual(grouped.length, 2);
  assert.deepStrictEqual(
    grouped.map((g) => g.name).sort(),
    ['Alex Abreu Marins', 'Leandro Lourenço'],
  );

  const payload = toDocumentProfessionalsPersistencePayload(grouped);
  const ids = payload.map((p) => p.professionalId).sort((a, b) => a - b);
  assert.deepStrictEqual(ids, [1, 1082]);
  assert.ok(!ids.includes(15));
  assert.ok(!ids.includes(24));
}

{
  const orphan = base({
    id: 15,
    name: 'Alex Abreu Marins',
    councils: [],
  });
  assert.strictEqual(resolvePersistenceCouncilId(orphan), null);
  assert.throws(() => resolveLegacyCouncilIdForDocument(orphan));
}

{
  const desc = describeDocumentProfessionalPersistence(
    toDocumentProfessionalSelection(alexPersonShaped(), {
      isSigner: true,
      isElaborator: true,
    }),
  );
  assert.deepStrictEqual(
    {
      name: desc.name,
      personProfessionalId: desc.personProfessionalId,
      persistenceCouncilId: desc.persistenceCouncilId,
    },
    {
      name: 'Alex Abreu Marins',
      personProfessionalId: 15,
      persistenceCouncilId: 1,
    },
  );
}

console.log('document-professional-selection integrity contract: ok');
