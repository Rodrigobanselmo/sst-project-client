import { JSONContent } from '@tiptap/core';
import { HeadingNumberingMap } from 'components/organisms/documentModel/utils/buildDocumentHeadingNumbering';
import { IDocumentModelFull } from 'core/interfaces/api/IDocumentModel';

import { formatAtomPlaceholder } from './atom-placeholder-label';

export function decorateTipTapProjection(
  json: JSONContent,
  options: {
    headingNumbering?: HeadingNumberingMap;
    elements?: IDocumentModelFull['elements'];
  } = {},
): JSONContent {
  const walk = (node: JSONContent): JSONContent => {
    const next: JSONContent = {
      ...node,
      attrs: node.attrs ? { ...node.attrs } : node.attrs,
    };

    if (next.type === 'docHeading' && next.attrs?.id) {
      const entry = options.headingNumbering?.[String(next.attrs.id)];
      next.attrs = {
        ...next.attrs,
        headingNumber: entry?.number ?? null,
      };
    }

    if (next.type === 'docAtom' && next.attrs) {
      const atomType = String(next.attrs.atomType || 'UNKNOWN');
      next.attrs = {
        ...next.attrs,
        label: formatAtomPlaceholder(
          atomType,
          next.attrs.source,
          options.elements?.[atomType]?.label,
        ),
      };
    }

    if (next.content) {
      next.content = next.content.map(walk);
    }

    return next;
  };

  return walk(json);
}
