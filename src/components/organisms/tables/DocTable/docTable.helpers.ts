import dayjs from 'dayjs';

import { IRiskDocument } from 'core/interfaces/api/IRiskData';

import {
  formatRevisionDisplayNumber,
  getDocumentVersionFamilyLabel,
  getOfficialVersionMajor,
  getUnofficialVersionPatch,
  isOfficialDocumentVersion,
  isUnofficialDocumentVersion,
  normalizeDocumentVersion,
} from 'components/organisms/modals/ModalAddDocVersion/helpers/document-version.helpers';

import {
  DocTableFamilyFilter,
  DocTableSortBy,
} from './docTable.types';

export const DOC_VERSIONS_FETCH_LIMIT = 100;

export function filterDocsByFamily(
  docs: IRiskDocument[],
  familyFilter: DocTableFamilyFilter,
): IRiskDocument[] {
  if (familyFilter === 'test') {
    return docs.filter((doc) =>
      isUnofficialDocumentVersion(doc.version),
    );
  }

  if (familyFilter === 'official') {
    return docs.filter((doc) => isOfficialDocumentVersion(doc.version));
  }

  return docs;
}

function getVersionSortKey(version: string): number {
  const normalized = normalizeDocumentVersion(version);

  if (isUnofficialDocumentVersion(normalized)) {
    return getUnofficialVersionPatch(normalized);
  }

  if (isOfficialDocumentVersion(normalized)) {
    return 10_000 + getOfficialVersionMajor(normalized);
  }

  return 0;
}

export function compareDocVersions(
  a: IRiskDocument,
  b: IRiskDocument,
  field: DocTableSortBy,
  order: 'asc' | 'desc',
): number {
  const dir = order === 'asc' ? 1 : -1;
  const text = (value: unknown) => String(value ?? '');

  switch (field) {
    case 'NAME':
      return (
        dir *
        text(a.name).localeCompare(text(b.name), 'pt-BR', {
          sensitivity: 'base',
        })
      );
    case 'DESCRIPTION':
      return (
        dir *
        text(a.description).localeCompare(text(b.description), 'pt-BR', {
          sensitivity: 'base',
        })
      );
    case 'WORKSPACE':
      return (
        dir *
        text(a.workspaceName).localeCompare(text(b.workspaceName), 'pt-BR', {
          sensitivity: 'base',
        })
      );
    case 'FAMILY':
      return (
        dir *
        getDocumentVersionFamilyLabel(a.version).localeCompare(
          getDocumentVersionFamilyLabel(b.version),
          'pt-BR',
          { sensitivity: 'base' },
        )
      );
    case 'VERSION': {
      const diff =
        getVersionSortKey(a.version) - getVersionSortKey(b.version);
      if (diff !== 0) return dir * diff;
      return (
        dir *
        formatRevisionDisplayNumber(a.version).localeCompare(
          formatRevisionDisplayNumber(b.version),
          'pt-BR',
          { numeric: true },
        )
      );
    }
    case 'CREATED':
      return (
        dir *
        (dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf())
      );
    case 'STATUS':
      return (
        dir *
        text(a.status).localeCompare(text(b.status), 'pt-BR', {
          sensitivity: 'base',
        })
      );
    default:
      return 0;
  }
}
