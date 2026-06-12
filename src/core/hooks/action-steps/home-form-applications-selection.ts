import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';
import { FormApplicationBrowseResultModel } from '@v2/models/form/models/form-application/form-application-browse-result.model';

const HOME_FORM_APPLICATION_EXCLUDED_STATUSES: ReadonlyArray<FormApplicationStatusEnum> =
  [
    FormApplicationStatusEnum.CANCELED,
    FormApplicationStatusEnum.TESTING,
  ];

function pickHomeFormsForScope(
  applications: FormApplicationBrowseResultModel[],
): FormApplicationBrowseResultModel[] {
  const actives = applications.filter(
    (item) =>
      item.status === FormApplicationStatusEnum.PROGRESS ||
      item.status === FormApplicationStatusEnum.INACTIVE,
  );
  const sortedActives = [...actives].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const dones = applications.filter(
    (item) => item.status === FormApplicationStatusEnum.DONE,
  );
  const sortedDones = [...dones].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  const latestDone = sortedDones[0];

  const cards = [...sortedActives];
  if (latestDone) {
    cards.push(latestDone);
  }

  return cards;
}

export function selectHomeFormApplicationsToShow(
  results: FormApplicationBrowseResultModel[],
  options: { isGroupConsolidated: boolean },
): FormApplicationBrowseResultModel[] {
  const applications = results.filter((item) =>
    HOME_FORM_APPLICATION_EXCLUDED_STATUSES.every((s) => item.status !== s),
  );

  if (!options.isGroupConsolidated) {
    return pickHomeFormsForScope(applications);
  }

  const businessGroupApplications = applications.filter(
    (item) => item.isBusinessGroupApplication,
  );
  const singleCompanyApplications = applications.filter(
    (item) => !item.isBusinessGroupApplication,
  );

  const applicationsByCompany = new Map<
    string,
    FormApplicationBrowseResultModel[]
  >();
  for (const application of singleCompanyApplications) {
    if (!application.companyId) continue;
    const existing = applicationsByCompany.get(application.companyId) ?? [];
    existing.push(application);
    applicationsByCompany.set(application.companyId, existing);
  }

  const perCompanyCards = [...applicationsByCompany.values()].flatMap(
    pickHomeFormsForScope,
  );
  const groupCards = pickHomeFormsForScope(businessGroupApplications);

  return [...perCompanyCards, ...groupCards].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}
