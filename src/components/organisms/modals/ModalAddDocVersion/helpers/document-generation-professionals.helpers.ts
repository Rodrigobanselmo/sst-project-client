import { DocumentGenerationSnapshot } from 'core/interfaces/api/document-generation-snapshot.types';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import { queryProfessionals } from 'core/services/hooks/queries/useQueryProfessionals';

const MAX_COUNCIL_PROFESSIONAL_PAGES = 20;
const COUNCIL_PROFESSIONALS_PAGE_SIZE = 100;

const buildProfessionalFromSnapshot = (
  professional: IProfessional,
  signature: NonNullable<DocumentGenerationSnapshot['professionalSignatures']>[number],
): IProfessional => ({
  ...professional,
  professionalDocumentDataSignature: {
    professionalId: signature.professionalId,
    isSigner: signature.isSigner ?? professional.professionalDocumentDataSignature?.isSigner ?? false,
    isElaborator:
      signature.isElaborator ??
      professional.professionalDocumentDataSignature?.isElaborator ??
      false,
    documentDataId:
      professional.professionalDocumentDataSignature?.documentDataId || '',
  },
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

export async function resolveRegenerateProfessionals({
  companyId,
  generationSnapshot,
  documentProfessionals,
}: {
  companyId: string;
  generationSnapshot?: DocumentGenerationSnapshot | null;
  documentProfessionals?: IProfessional[];
}): Promise<IProfessional[] | undefined> {
  if (!generationSnapshot?.professionalSignatures?.length) {
    return documentProfessionals;
  }

  const documentByCouncilId = new Map(
    (documentProfessionals || []).map((professional) => [professional.id, professional]),
  );

  const missingCouncilIds = generationSnapshot.professionalSignatures
    .map((signature) => signature.professionalId)
    .filter((professionalId) => !documentByCouncilId.has(professionalId));

  const fetchedProfessionals = missingCouncilIds.length
    ? await fetchCouncilProfessionalsByIds(companyId, missingCouncilIds)
    : [];

  const fetchedByCouncilId = new Map(
    fetchedProfessionals.map((professional) => [professional.id, professional]),
  );

  const resolved = generationSnapshot.professionalSignatures
    .map((signature) => {
      const professional =
        documentByCouncilId.get(signature.professionalId) ||
        fetchedByCouncilId.get(signature.professionalId);

      if (!professional) return null;

      return buildProfessionalFromSnapshot(professional, signature);
    })
    .filter((professional): professional is IProfessional => Boolean(professional));

  return resolved.length ? resolved : documentProfessionals;
}
