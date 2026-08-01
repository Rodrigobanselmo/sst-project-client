import { Box, styled, Typography as Text } from '@mui/material';

/**
 * Container do título de seção.
 * Historicamente usava `width: 0rem` só para a borda animada no rail —
 * isso comprimiu o botão recolhível (Fase C) e forçou quebra de títulos longos.
 * A largura útil passa a ser controlada pelo consumidor (100% quando aberto).
 */
export const BoxStyledTitle = styled(Box)`
  transition: color 0.5s ease-in-out;
  border-bottom: 1px solid;
  min-width: 0;
  box-sizing: border-box;
`;

/**
 * Tipografia do título — uma linha, sem quebra de palavra;
 * overflow longo → ellipsis (tooltip no botão com o nome completo).
 */
export const TextStyled = styled(Text)`
  transition: opacity 0.5s ease-in-out, height 0.5s ease-in-out;
  font-weight: 400;
  white-space: nowrap;
  word-break: normal;
  overflow-wrap: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;
