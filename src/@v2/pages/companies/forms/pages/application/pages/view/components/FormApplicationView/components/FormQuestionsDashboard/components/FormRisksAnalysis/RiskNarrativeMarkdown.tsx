import { Box, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type RiskNarrativeMarkdownProps = {
  content: string;
};

export const RiskNarrativeMarkdown = ({ content }: RiskNarrativeMarkdownProps) => {
  return (
    <Box
      sx={{
        '& p': { typography: 'body2', mb: 1.5, mt: 0 },
        '& h1, & h2, & h3, & h4': { typography: 'subtitle1', fontWeight: 700, mt: 2, mb: 1 },
        '& ul, & ol': { typography: 'body2', pl: 3, mb: 1.5 },
        '& li': { mb: 0.5 },
        '& strong': { fontWeight: 700 },
        '& code': {
          fontFamily: 'monospace',
          fontSize: '0.85em',
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
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
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
