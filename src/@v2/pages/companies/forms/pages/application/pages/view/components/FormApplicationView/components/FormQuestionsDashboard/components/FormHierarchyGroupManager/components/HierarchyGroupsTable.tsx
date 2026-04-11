import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
} from '@mui/material';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';

export interface HierarchyGroupRow {
  id: string;
  name: string;
  hierarchyIds: string[];
  hierarchyNames: string[];
}

interface HierarchyGroupsTableProps {
  groups: HierarchyGroupRow[];
  onEdit: (group: HierarchyGroupRow) => void;
  onDelete: (group: HierarchyGroupRow) => void;
}

export const HierarchyGroupsTable = ({
  groups,
  onEdit,
  onDelete,
}: HierarchyGroupsTableProps) => {
  if (groups.length === 0) {
    return (
      <Box
        sx={{
          p: 8,
          textAlign: 'center',
          backgroundColor: 'grey.50',
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'grey.300',
        }}
      >
        <SText color="text.secondary" fontSize={16}>
          Nenhum agrupamento criado ainda.
        </SText>
        <SText color="text.secondary" fontSize={14} mt={1}>
          Clique em "Adicionar Agrupamento" para começar.
        </SText>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'grey.50' }}>
            <TableCell width="25%">
              <SText fontWeight={600}>Nome do Grupo</SText>
            </TableCell>
            <TableCell width="10%" align="center">
              <SText fontWeight={600}>Qtd. Setores</SText>
            </TableCell>
            <TableCell width="55%">
              <SText fontWeight={600}>Setores</SText>
            </TableCell>
            <TableCell width="10%" align="center">
              <SText fontWeight={600}>Ações</SText>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {groups.map((group) => (
            <TableRow
              key={group.id}
              sx={{
                '&:hover': {
                  backgroundColor: 'grey.50',
                },
              }}
            >
              <TableCell>
                <SText fontWeight={500}>{group.name}</SText>
              </TableCell>
              <TableCell align="center">
                <SText>{group.hierarchyIds.length}</SText>
              </TableCell>
              <TableCell>
                <SFlex gap={1} flexWrap="wrap">
                  {group.hierarchyNames.map((name, index) => (
                    <Chip
                      key={group.hierarchyIds[index]}
                      label={name}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </SFlex>
              </TableCell>
              <TableCell align="center">
                <SFlex gap={1} justifyContent="center">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEdit(group)}
                    title="Editar agrupamento"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(group)}
                    title="Excluir agrupamento"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </SFlex>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
