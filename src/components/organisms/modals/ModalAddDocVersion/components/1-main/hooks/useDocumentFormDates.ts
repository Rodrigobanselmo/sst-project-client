import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import dayjs from 'dayjs';

import { queryDocVersions } from 'core/services/hooks/queries/useQueryDocVersions/useQueryDocVersions';
import { queryGroupDocumentData } from 'core/services/hooks/queries/useQueryDocumentData/useQueryDocumentData';

import { IUseMainActionsModal } from '../../../hooks/useMainActions';
import {
  deriveValidityPeriod,
  DocumentVersionFamily,
  isSeriesCreationDateLocked,
  resolveSuggestedCreationDate,
  resolveSuggestedEmissionDate,
  resolveVersionForFamily,
} from '../../../helpers/document-dates.helpers';

export const useDocumentFormDates = ({
  data,
  setData,
  doc,
  onFamilyDefaultsApplied,
}: Pick<IUseMainActionsModal, 'data' | 'setData' | 'doc'> & {
  onFamilyDefaultsApplied?: () => void;
}) => {
  const { setValue, getValues } = useFormContext();
  const [creationDateLocked, setCreationDateLocked] = useState(false);
  const [lockedCreationDate, setLockedCreationDate] = useState<Date | null>(
    null,
  );
  const [nextVersion, setNextVersion] = useState('0.0.0');
  const [loadingDates, setLoadingDates] = useState(false);

  const setDateFieldIfChanged = useCallback(
    (name: 'documentCreatedAt' | 'documentDate', value: Date) => {
      const current = getValues(name);
      if (!current || !dayjs(current).isSame(value, 'day')) {
        setValue(name, value);
      }
    },
    [getValues, setValue],
  );

  const applyFamilyDefaults = useCallback(
    async (family: DocumentVersionFamily) => {
      const documentType = data.type ?? doc?.type;
      if (!data.companyId || !data.workspaceId || !documentType) return;

      setLoadingDates(true);

      try {
        const [versionsResponse, documentData] = await Promise.all([
          data.id
            ? queryDocVersions(
                { take: 50, skip: 0 },
                {
                  companyId: data.companyId,
                  documentDataId: [data.id],
                  type: documentType,
                },
              )
            : queryDocVersions(
                { take: 50, skip: 0 },
                {
                  companyId: data.companyId,
                  workspaceId: data.workspaceId,
                  type: documentType,
                },
              ),
          data.workspaceId && documentType
            ? queryGroupDocumentData({
                companyId: data.companyId,
                workspaceId: data.workspaceId,
                type: documentType,
              })
            : Promise.resolve(doc),
        ]);

        const versions = versionsResponse?.data ?? [];
        const activeOfficialSeries =
          documentData?.officialRevisionSeries ??
          doc?.officialRevisionSeries ??
          1;
        const locked = isSeriesCreationDateLocked(
          family,
          versions,
          activeOfficialSeries,
        );
        const suggestedCreation = resolveSuggestedCreationDate(
          family,
          versions,
          documentData ?? doc,
          activeOfficialSeries,
        );
        const suggestedEmission = resolveSuggestedEmissionDate(
          locked,
          suggestedCreation,
        );
        const period = deriveValidityPeriod(documentData ?? doc);
        const version = resolveVersionForFamily(
          family,
          versions,
          activeOfficialSeries,
        );

        setCreationDateLocked(locked);
        setLockedCreationDate(locked ? suggestedCreation : null);
        setNextVersion(version);
        setDateFieldIfChanged('documentCreatedAt', suggestedCreation);
        setDateFieldIfChanged('documentDate', suggestedEmission);

        if (getValues('validityYears') !== period.years) {
          setValue('validityYears', period.years);
        }
        if (getValues('validityMonths') !== period.months) {
          setValue('validityMonths', period.months);
        }
        if (getValues('versionFamily') !== family) {
          setValue('versionFamily', family);
        }
        if (getValues('version') !== version) {
          setValue('version', version);
        }

        setData((current) => {
          const nextCreatedAt = suggestedCreation.toISOString();
          const nextDocumentDate = suggestedEmission.toISOString();

          if (
            current.versionFamily === family &&
            current.documentCreatedAt === nextCreatedAt &&
            current.documentDate === nextDocumentDate &&
            current.validityYears === period.years &&
            current.validityMonths === period.months
          ) {
            return current;
          }

          return {
            ...current,
            versionFamily: family,
            documentCreatedAt: nextCreatedAt,
            documentDate: nextDocumentDate,
            validityYears: period.years,
            validityMonths: period.months,
          };
        });

        onFamilyDefaultsApplied?.();
      } catch {
        // falha na API não deve derrubar o modal; mantém defaults locais
      } finally {
        setLoadingDates(false);
      }
    },
    [data.companyId, data.id, data.type, data.workspaceId, doc, getValues, onFamilyDefaultsApplied, setData, setDateFieldIfChanged, setValue],
  );

  useEffect(() => {
    const family = (data.versionFamily ?? 'test') as DocumentVersionFamily;
    if (!getValues('versionFamily')) {
      setValue('versionFamily', family);
    }
    applyFamilyDefaults(family);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.companyId, data.workspaceId, data.type, data.id]);

  const onVersionFamilyChange = useCallback(
    (family: DocumentVersionFamily) => {
      applyFamilyDefaults(family);
    },
    [applyFamilyDefaults],
  );

  return {
    creationDateLocked,
    lockedCreationDate,
    nextVersion,
    loadingDates,
    onVersionFamilyChange,
  };
};
