import type { ITreeMap } from '../../interfaces';
import type { IntegratedReview } from './gse-integrated-review.model';
import { canReviewNode } from './gse-integrated-review.model';

export function reviewNavigation(
  nodes: ITreeMap,
  review: IntegratedReview,
  workspaceId: string,
  groupId: string,
) {
  const suggested = review.changes
    .filter((c) => c.groupId === groupId && c.decision !== 'rejected')
    .map((c) => c.nodeId);
  const direct = Object.values(nodes)
    .filter(
      (n) =>
        canReviewNode(n, workspaceId) &&
        n.ghos?.some((g) => (typeof g === 'string' ? g : g.id) === groupId),
    )
    .map((n) => String(n.id));
  const targets = [...new Set([...suggested, ...direct])].filter(
    (id) => nodes[id] && canReviewNode(nodes[id], workspaceId),
  );
  const ancestors = new Set<string>();
  for (const target of targets) {
    let id = String(nodes[target].parentId || '');
    const visited = new Set<string>([target]);
    while (id && nodes[id] && !visited.has(id)) {
      visited.add(id);
      ancestors.add(id);
      id = String(nodes[id].parentId || '');
    }
  }
  return { targets, ancestors: [...ancestors] };
}

export function focusReviewRegion(
  container: HTMLElement,
  elements: HTMLElement[],
  panel: HTMLElement | null,
) {
  if (!elements.length) return;
  const c = container.getBoundingClientRect(),
    p = panel?.getBoundingClientRect();
  let left = c.left + 24,
    right = c.right - 24;
  if (p && p.bottom > c.top && p.top < c.bottom) {
    const leftSpace = p.left - left - 24;
    const rightSpace = right - p.right - 24;
    if (leftSpace >= rightSpace) right = Math.min(right, p.left - 24);
    else left = Math.max(left, p.right + 24);
  }
  const rects = elements.map((e) => e.getBoundingClientRect());
  const first = rects[0];
  const minX = Math.min(...rects.map((r) => r.left)),
    maxX = Math.max(...rects.map((r) => r.right));
  const minY = Math.min(...rects.map((r) => r.top)),
    maxY = Math.max(...rects.map((r) => r.bottom));
  const fits = maxX - minX < right - left && maxY - minY < c.height - 48;
  const x = fits ? (minX + maxX) / 2 : (first.left + first.right) / 2;
  const y = fits ? (minY + maxY) / 2 : (first.top + first.bottom) / 2;
  const scale = c.width / (container.offsetWidth || c.width);
  container.scrollTo({
    left: container.scrollLeft + (x - (left + right) / 2) / scale,
    top: container.scrollTop + (y - (c.top + c.height / 2)) / scale,
    behavior: 'auto',
  });
}
