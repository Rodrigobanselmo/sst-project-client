import { Box, Tooltip } from '@mui/material';

// Preserve typed labels for search; show the level only on hover or focus.
export function HierarchyLabel({
  text,
  emphasizeLevel,
}: {
  text: string;
  emphasizeLevel?: string;
}) {
  const parts = text.split(/ (→|—|·) /);
  return (
    <Box component="span" sx={{ display: 'inline', overflowWrap: 'anywhere' }}>
      {parts.map((part, index) => {
        const match =
          /^(Empresa|Estabelecimento|Diretoria|Gerência|Setor|Subsetor|Cargo|Especialidade): (.*)$/s.exec(
            part,
          );
        if (!match)
          return (
            <Box component="span" key={index}>
              {index ? ' ' : ''}
              {part}
              {index < parts.length - 1 ? ' ' : ''}
            </Box>
          );
        return (
          <Tooltip key={index} title={match[1]} describeChild>
            <Box
              component="span"
              tabIndex={0}
              aria-label={`${match[1]}: ${match[2]}`}
              sx={{
                outlineOffset: '2px',
                fontWeight: match[1] === emphasizeLevel ? 700 : 'inherit',
              }}
            >
              {match[2]}
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}
