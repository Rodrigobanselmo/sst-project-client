import { DocumentGenerationSnapshot } from 'core/interfaces/api/document-generation-snapshot.types';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import { queryProfessionals } from 'core/services/hooks/queries/useQueryProfessionals';

import {
  groupProfessionalsForDocumentSelection,
  isCouncilShapedProfessional,
  toDocumentProfessionalSelection,
} from './document-professional-selection.util';

const MAX_COUNCIL_PROFESSIONAL_PAGES = 20;
const COUNCIL_PROFESSIONALS_PAGE_SIZE = 100;

const buildProfessionalFromSnapshot = (
  professional: IProfessional,
  signature: NonNullable<DocumentGenerationSnapshot['professionalSignatures']>[number],
): IProfessional =>
  toDocumentProfessionalSelection(professional, {
    preferredCouncilId: isCouncilShapedProfessional(professional)
      ? professional.id
      : signature.professionalId,
    isSigner:
      signature.isSigner ??
      professional.professionalDocumentDataSignature?.isSigner ??
      false,
    isElaborator:
      signature.isElaborator ??
      professional.professionalDocumentDataSignature?.isElaborator ??
      false,
  });

async function fetchCouncilProfessionalsByIds(
  companyId: string,
  councilIds: number[],
): Promise<IProfessional[]> {
  if (!councilIds.length) return [];

  const missingIds = new Set(councilIds);
  const found: IProfessional[] = [];
  let skip = 0;

  for (
    let page = 0;
    page < MAX_COUNCIL_PROFESSIONAL_PAGES && missingIds.size > 0;
    page += 1
  ) {
    const response = await queryProfessionals(
      { skip, take: COUNCIL_PROFESSIONALS_PAGE_SIZE },
      { companyId, byCouncil: true },
    );

    response.data.forEach((professional) => {
      if (!missingIds.has(professional.id)) return;

      found.push(professional);
      missingIds.delete(professional.id);
    });

    if (response.data.length < COUNCIL_PROFESSIONALS_PAGE_SIZE) {
      break;
    }

    skip += COUNCIL_PROFESSIONALS_PAGE_SIZE;
  }

  return found;
}

/**
 * Prefer current DocumentData professionals when present (source of truth after
 * sync). Snapshot is used when DocumentData has no links, with a guard for
 * legacy contaminated snapshots that stored Professional.id as council FK.
 */
export async function resolveRegenerateProfessionals({
  companyId,
  generationSnapshot,
  documentProfessionals,
}: {
  companyId: string;
  generationSnapshot?: DocumentGenerationSnapshot | null;
  documentProfessionals?: IProfessional[];
}): Promise<IProfessional[] | undefined> {
  if (documentProfessionals?.length) {
    return groupProfessionalsForDocumentSelection(documentProfessionals);
  }

  if (!generationSnapshot?.professionalSignatures?.length) {
    return documentProfessionals;
  }

  const documentByCouncilId = new Map(
    (documentProfessionals || []).map((professional) => [
      professional.id,
      professional,
    ]),
  );

  const documentByPersonId = new Map(
    (documentProfessionals || []).map((professional) => [
      isCouncilShapedProfessional(professional)
        ? (professional.professionalId as number)
        : professional.id,
      professional,
    ]),
  );

  const missingCouncilIds = generationSnapshot.professionalSignatures
    .map((signature) => signature.professionalId)
    .filter((professionalId) => !documentByCouncilId.has(professionalId));

  const fetchedProfessionals = missingCouncilIds.length
    ? await fetchCouncilProfessionalsByIds(companyId, missingCouncilIds)
    : [];

  const fetchedByCouncilId = new Map(
    fetchedProfessionals.map((professional) => [
      professional.id,
      professional,
    ]),
  );

  // Contaminated snapshots stored person ids. Fetch persons (byCouncil:false)
  // for ids that resolved to a council whose owner personId !== signature id.
  const contaminatedPersonIds: number[] = [];
  for (const signature of generationSnapshot.professionalSignatures) {
    const asCouncil = fetchedByCouncilId.get(signature.professionalId);
    if (
      asCouncil &&
      asCouncil.professionalId != null &&
      asCouncil.professionalId !== signature.professionalId
    ) {
      // signature.professionalId was likely a person id, not this council's id
      contaminatedPersonIds.push(signature.professionalId);
    } else if (
      !asCouncil &&
      !documentByCouncilId.has(signature.professionalId) &&
      !documentByPersonId.has(signature.professionalId)
    ) {
      contaminatedPersonIds.push(signature.professionalId);
    }
  }

  const personsById = new Map<number, IProfessional>();
  if (contaminatedPersonIds.length) {
    const unique = [...new Set(contaminatedPersonIds)];
    // Page persons list; match by Professional.id
    let skip = 0;
    const remaining = new Set(unique);
    for (let page = 0; page < MAX_COUNCIL_PROFESSIONAL_PAGES && remaining.size; page += 1) {
      const response = await queryProfessionals(
        { skip, take: COUNCIL_PROFESSIONALS_PAGE_SIZE },
        { companyId, byCouncil: false },
      );
      response.data.forEach((professional) => {
        if (!remaining.has(professional.id)) return;
        personsById.set(professional.id, professional);
        remaining.delete(professional.id);
      });
      if (response.data.length < COUNCIL_PROFESSIONALS_PAGE_SIZE) break;
      skip += COUNCIL_PROFESSIONALS_PAGE_SIZE;
    }
  }

  const resolved = generationSnapshot.professionalSignatures
    .map((signature) => {
      const fromDocumentCouncil = documentByCouncilId.get(
        signature.professionalId,
      );
      if (fromDocumentCouncil) {
        return buildProfessionalFromSnapshot(fromDocumentCouncil, signature);
      }

      const fromDocumentPerson = documentByPersonId.get(
        signature.professionalId,
      );
      if (fromDocumentPerson) {
        return buildProfessionalFromSnapshot(fromDocumentPerson, signature);
      }

      const fromPerson = personsById.get(signature.professionalId);
      if (fromPerson) {
        return buildProfessionalFromSnapshot(fromPerson, {
          ...signature,
          // persistence must use council, not the contaminated person id
          professionalId:
            fromPerson.councils?.[0]?.id ?? signature.professionalId,
        });
      }

      const fromFetchedCouncil = fetchedByCouncilId.get(
        signature.professionalId,
      );
      if (fromFetchedCouncil) {
        // Only accept if this council id was intended (owner person != signature id
        // means contamination — skip wrong person unless no person fallback).
        if (
          fromFetchedCouncil.professionalId != null &&
          fromFetchedCouncil.professionalId !== signature.professionalId &&
          personsById.has(signature.professionalId)
        ) {
          return null;
        }
        return buildProfessionalFromSnapshot(fromFetchedCouncil, signature);
      }

      return null;
    })
    .filter((professional): professional is IProfessional =>
      Boolean(professional),
    );

  const grouped = groupProfessionalsForDocumentSelection(resolved);
  return grouped.length ? grouped : documentProfessionals;
}
