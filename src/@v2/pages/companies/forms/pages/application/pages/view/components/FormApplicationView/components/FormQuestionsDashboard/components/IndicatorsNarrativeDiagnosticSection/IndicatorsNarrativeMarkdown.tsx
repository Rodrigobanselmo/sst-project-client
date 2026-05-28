import { Box } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type IndicatorsNarrativeMarkdownProps = {
  content: string;
};

const markdownSx = {
  color: 'text.primary',
  '& p': {
    typography: 'body2',
    color: 'text.primary',
    mb: 1.5,
    mt: 0,
  },
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    typography: 'subtitle1',
    color: 'text.primary',
    fontWeight: 700,
    mt: 2,
    mb: 1,
    '&:first-of-type': { mt: 0 },
  },
  '& h1': { typography: 'h6', fontWeight: 700 },
  '& h2': { typography: 'subtitle1', fontWeight: 700 },
  '& h3, & h4': { typography: 'subtitle2', fontWeight: 700 },
  '& ul, & ol': {
    typography: 'body2',
    color: 'text.primary',
    pl: 3,
    mb: 1.5,
  },
  '& li': { mb: 0.5, color: 'text.primary' },
  '& strong': { fontWeight: 700, color: 'text.primary' },
  '& code': {
    fontFamily: 'monospace',
    fontSize: '0.85em',
    color: 'text.primary',
    bgcolor: 'grey.100',
    px: 0.5,
    borderRadius: 0.5,
  },
  '& pre': {
    overflow: 'auto',
    bgcolor: 'grey.100',
    p: 1.5,
    borderRadius: 1,
    mb: 1.5,
  },
  '& pre code': { bgcolor: 'transparent', p: 0 },
} as const;

export const IndicatorsNarrativeMarkdown = ({
  content,
}: IndicatorsNarrativeMarkdownProps) => {
  return (
    <Box sx={markdownSx}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </Box>
  );
};
