import type { IPcmsoComparableConfig as Config } from '../company-exam-risk-coverage/company-exam-risk-coverage.types';
import type {
  ExamRiskReviewGroup,
  ExamRiskReviewIdentity,
  ExamRiskReviewResponse,
} from './company-exam-risk-parameter-review.types';

// The API owns acceptance state. Only associate it with the exact displayed pair
// and snapshot; independent coverage/review requests can finish in either order.
export function findDisplayedParameterReview(
  response: ExamRiskReviewResponse | undefined,
  identity: ExamRiskReviewIdentity,
  group: ExamRiskReviewGroup,
  keys: (keyof Config)[],
  recommended: Config,
  adopted: Config,
) {
  if (
    response?.companyId !== identity.companyId ||
    response.riskId !== identity.riskId
  )
    return undefined;
  const pairs = response.comparisons.filter((pair) =>
    (Object.keys(identity) as Array<keyof ExamRiskReviewIdentity>).every(
      (key) => pair[key] === identity[key],
    ),
  );
  if (pairs.length !== 1) return undefined;
  const groups = pairs[0].groups.filter((entry) => entry.group === group);
  if (groups.length !== 1) return undefined;
  const review = groups[0];
  const matches = (snapshot: unknown[], config: Config) =>
    Array.isArray(snapshot) &&
    snapshot.length === keys.length &&
    keys.every((key, index) => snapshot[index] === config[key]);
  if (
    !matches(review.snapshot.recommended, recommended) ||
    !matches(review.snapshot.adopted, adopted)
  )
    return undefined;
  return review;
}
