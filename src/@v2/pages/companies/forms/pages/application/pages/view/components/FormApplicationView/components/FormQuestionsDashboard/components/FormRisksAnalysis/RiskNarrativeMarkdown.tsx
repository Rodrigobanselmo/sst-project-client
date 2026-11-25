import { Box, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type NarrativeNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: NarrativeNode[];
  value?: string;
};

// Group rendered Markdown by its actual heading levels, preserving every block.
function narrativeSections() {
  return (tree: NarrativeNode) => {
    const root: NarrativeNode[] = [];
    const stack: Array<{ level: number; body: NarrativeNode[] }> = [];
    for (const node of tree.children ?? []) {
      const match = /^h([1-6])$/.exec(node.tagName ?? '');
      if (!match) {
        (stack.at(-1)?.body ?? root).push(node);
        continue;
      }
      const level = Number(match[1]);
      while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
      const body: NarrativeNode[] = [];
      const section: NarrativeNode = {
        type: 'element', tagName: 'details',
        properties: { open: true, className: ['narrative-section'], 'data-level': level },
        children: [
          { type: 'element', tagName: 'summary', properties: {}, children: [
            { ...node, properties: { ...node.properties, className: ['narrative-heading'] } },
          ] },
          { type: 'element', tagName: 'div', properties: { className: ['narrative-section-body'] }, children: body },
        ],
      };
      (stack.at(-1)?.body ?? root).push(section);
      stack.push({ level, body });
    }
    tree.children = root;
  };
}

type RiskNarrativeMarkdownProps = {
  content: string;
};

export const RiskNarrativeMarkdown = ({
  content,
}: RiskNarrativeMarkdownProps) => {
  return (
    <Box
      sx={{
        color: 'text.primary',
        '& .narrative-section': { mt: 10, mb: 6 },
        '& > div > .narrative-section:first-of-type': { mt: 2 },
        '& .narrative-section > summary': {
          display: 'flex', alignItems: 'center', gap: 3,
          cursor: 'pointer', listStyle: 'none', py: 3,
          borderBottom: '1px solid', borderColor: 'divider',
          '&::-webkit-details-marker': { display: 'none' },
          '&::before': { content: '\"\\203A\"', fontSize: 22, lineHeight: 1, width: 16, flexShrink: 0, textAlign: 'center' },
        },
        '& .narrative-section[open] > summary::before': { transform: 'rotate(90deg)' },
        '& .narrative-section > summary > .narrative-heading': {
          m: 0, fontSize: 15, lineHeight: 1.5, color: 'text.primary',
        },
        '& .narrative-section-body': { pl: { xs: 10, sm: 14 }, pt: 5, pb: 2 },
        '& .narrative-section-body > .narrative-section:first-of-type': { mt: 4 },
        '& p, & li, & ul, & ol, & blockquote, & table, & th, & td, & strong, & em': { color: 'text.primary' },
        '& p': { typography: 'body2', color: 'text.primary', mb: 6, mt: 0, lineHeight: 1.75 },
        '& h1, & h2, & h3, & h4': {
          typography: 'subtitle1',
          fontWeight: 700,
          mt: 2,
          mb: 1,
        },
        '& ul, & ol': { typography: 'body2', color: 'text.primary', pl: 10, mt: 0, mb: 6, lineHeight: 1.75 },
        '& li': { mb: 3, lineHeight: 1.75 },
        '& strong': { fontWeight: 700 },
        '& code': {
          fontFamily: 'monospace',
          fontSize: '0.85em',
          bgcolor: 'action.hover',
          px: 0.5,
          borderRadius: 0.5,
        },
        '& pre': {
          overflow: 'auto',
          bgcolor: 'action.hover',
          p: 1.5,
          borderRadius: 1,
          mb: 1.5,
        },
        '& pre code': { bgcolor: 'transparent', p: 0 },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[narrativeSections]}
        components={{
          a: ({ children }) => (
            <Typography component="span" variant="body2" color="text.primary">
              {children}
            </Typography>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};
