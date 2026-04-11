import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { useEffect, useState } from 'react';

interface HierarchyOption {
  id: string;
  name: string;
}

interface UpsertHierarchyGroupModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; hierarchyIds: string[] }) => void;
  availableHierarchies: HierarchyOption[];
  assignedHierarchyIds: Set<string>;
  initialData?: {
    name: string;
    hierarchyIds: string[];
  };
  loading?: boolean;
}

export const UpsertHierarchyGroupModal = ({
  open,
  onClose,
  onSave,
  availableHierarchies,
  assignedHierarchyIds,
  initialData,
  loading = false,
}: UpsertHierarchyGroupModalProps) => {
  const [name, setName] = useState('');
  const [selectedHierarchyIds, setSelectedHierarchyIds] = useState<string[]>(
    [],
  );

  const isEditing = !!initialData;

  useEffect(() => {
    if (open) {
      setName(initialData?.name || '');
      setSelectedHierarchyIds(initialData?.hierarchyIds || []);

      // Debug log
      console.log('Modal opened with data:', {
        initialData,
        availableHierarchies,
        assignedHierarchyIds: Array.from(assignedHierarchyIds),
      });
    }
  }, [open, initialData, availableHierarchies, assignedHierarchyIds]);

  const handleSave = () => {
    if (!name.trim() || selectedHierarchyIds.length === 0) return;
    onSave({ name: name.trim(), hierarchyIds: selectedHierarchyIds });
  };

  const handleClose = () => {
    setName('');
    setSelectedHierarchyIds([]);
    onClose();
  };

  const availableOptions = availableHierarchies.filter(
    (h) =>
      selectedHierarchyIds.includes(h.id) || !assignedHierarchyIds.has(h.id),
  );

  const getHierarchyName = (id: string) => {
    return availableHierarchies.find((h) => h.id === id)?.name ?? id;
  };

  const isValid = name.trim() && selectedHierarchyIds.length > 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <SFlex justifyContent="space-between" alignItems="center">
          <SFlex alignItems="center" gap={2}>
            <GroupWorkIcon color="primary" />
            <Typography variant="h6">
              {isEditing ? 'Editar Agrupamento' : 'Adicionar Agrupamento'}
            </Typography>
          </SFlex>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </SFlex>
        <Typography variant="body2" color="text.secondary" mt={1}>
          {isEditing
            ? 'Modifique o nome e os setores do agrupamento.'
            : 'Crie um agrupamento combinando múltiplos setores.'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <SFlex direction="column" gap={3}>
          <TextField
            fullWidth
            label="Nome do Agrupamento"
            placeholder="Ex: Administrativo, Operacional, Gerencial..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Box>
            <SSearchSelect
              inputProps={{ sx: { width: '100%' } }}
              label="Adicionar setor ao agrupamento"
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option?.id}
              onChange={(option) => {
                if (option && !selectedHierarchyIds.includes(option.id)) {
                  setSelectedHierarchyIds([...selectedHierarchyIds, option.id]);
                }
              }}
              value={null}
              options={availableOptions.filter(
                (h) => !selectedHierarchyIds.includes(h.id),
              )}
              placeholder="Busque e selecione setores..."
            />
          </Box>

          {selectedHierarchyIds.length > 0 ? (
            <Box>
              <SText variant="body2" fontWeight={500} mb={1.5}>
                Setores selecionados ({selectedHierarchyIds.length}):
              </SText>
              <SFlex gap={1} flexWrap="wrap">
                {selectedHierarchyIds.map((hId) => {
                  const hierarchyName = getHierarchyName(hId);
                  return (
                    <Chip
                      key={hId}
                      label={hierarchyName}
                      onDelete={() =>
                        setSelectedHierarchyIds(
                          selectedHierarchyIds.filter((id) => id !== hId),
                        )
                      }
                      color="primary"
                    />
                  );
                })}
              </SFlex>
            </Box>
          ) : (
            <Box
              sx={{
                p: 2,
                textAlign: 'center',
                backgroundColor: 'grey.50',
                borderRadius: 1,
              }}
            >
              <SText variant="body2" color="text.secondary">
                Nenhum setor selecionado ainda
              </SText>
            </Box>
          )}
        </SFlex>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <SButton onClick={handleClose} text="Cancelar" variant="outlined" />
        <SButton
          onClick={handleSave}
          text={isEditing ? 'Salvar Alterações' : 'Adicionar'}
          variant="contained"
          color="primary"
          disabled={!isValid}
          loading={loading}
        />
      </DialogActions>
    </Dialog>
  );
};
