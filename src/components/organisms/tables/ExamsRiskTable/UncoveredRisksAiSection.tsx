import { FC } from 'react';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

const UNCOVERED_RISKS_MAX_HEIGHT = 280;

import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import type { IExamRiskUncoveredRiskItem } from '@v2/services/medicine/company-exam-risk-link-status/company-exam-risk-link-status.types';
import { PcmsoLinkStatusEnum } from '@v2/services/medicine/company-exam-risk-link-status/company-exam-risk-link-status.types';
import { pcmsoLinkStatusLabels } from '@v2/services/medicine/company-exam-risk-link-status/pcmso-link-status-display.util';

type Props = {
  risks: IExamRiskUncoveredRiskItem[];
  onSuggestExams: (risk: IExamRiskUncoveredRiskItem) => void;
};

export const UncoveredRisksAiSection: FC<Props> = ({
  risks,
  onSuggestExams,
}) => {
  if (!risks.length) return null;

  const hasScroll = risks.length > 4;

  return (
    <Paper variant="outlined" sx={{ mt: 2, mb: 2, overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2">
          Riscos caracterizados sem exames vinculados
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sugira exames com IA para riscos sem vínculo na empresa e sem regra na
          Biblioteca Risco × Exame.
        </Typography>
      </Box>
      <TableContainer
        sx={{
          ...(hasScroll && {
            maxHeight: UNCOVERED_RISKS_MAX_HEIGHT,
            overflowY: 'auto',
          }),
        }}
      >
        <Table size="small" stickyHeader={hasScroll}>
          <TableHead>
            <TableRow>
              <TableCell>Fator de risco</TableCell>
              <TableCell width={180}>Status Biblioteca</TableCell>
              <TableCell width={120} align="right">
                Ação
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {risks.map((risk) => (
              <TableRow key={risk.riskId} hover>
                <TableCell>{risk.riskName}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={
                      pcmsoLinkStatusLabels[
                        PcmsoLinkStatusEnum.NO_LIBRARY_REFERENCE
                      ]
                    }
                    color="info"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButtonRow
                    icon={<AutoAwesomeIcon />}
                    tooltipTitle="Sugerir exames com IA"
                    onClick={() => onSuggestExams(risk)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
