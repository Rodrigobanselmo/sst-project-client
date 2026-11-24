import { HierarchyLabel } from './HierarchyLabel';
import {
  SectorVisibility,
  sectorPresentationLabel,
} from '../helpers/sector-picker.model';
import { SectorPicker } from './SectorPicker';
import { HierarchyGroupOption } from '../helpers/formatHierarchyGroupOptionLabel';
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
import { useEffect, useMemo, useState } from 'react';
import { sortHierarchyGroupOptionsByLabel } from '../helpers/formatHierarchyGroupOptionLabel';

type HierarchyOption = HierarchyGroupOption;

interface UpsertHierarchyGroupModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description?: string | null;
    hierarchyIds: string[];
  }) => void;
  availableHierarchies: HierarchyOption[];
  eligibleHierarchyIds: Set<string>;
  hierarchyOptionLabels: Map<string, string>;
  assignedHierarchyIds: Set<string>;
  initialData?: {
    name: string;
    description?: string;
    hierarchyIds: string[];
  };
  loading?: boolean;
}

export const UpsertHierarchyGroupModal = ({
  open,
  onClose,
  onSave,
  availableHierarchies,
  eligibleHierarchyIds,
  hierarchyOptionLabels,
  assignedHierarchyIds,
  initialData,
  loading = false,
}: UpsertHierarchyGroupModalProps) => {
  const [visibility, setVisibility] = useState<SectorVisibility>({
    hideCompany: false,
    hideEstablishment: false,
  });
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedHierarchyIds, setSelectedHierarchyIds] = useState<string[]>(
    [],
  );

  const isEditing = !!initialData;

  useEffect(() => {
    if (open) {
      setVisibility({ hideCompany: false, hideEstablishment: false });
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setSelectedHierarchyIds(initialData?.hierarchyIds || []);
    }
  }, [open, initialData]);

  const handleSave = () => {
    if (loading || !name.trim() || selectedHierarchyIds.length === 0) return;
    const trimmedDescription = description.trim();
    onSave({
      name: name.trim(),
      description: trimmedDescription ? trimmedDescription : null,
      hierarchyIds: selectedHierarchyIds,
    });
  };

  const handleClose = () => {
    if (loading) return;
    setName('');
    setDescription('');
    setSelectedHierarchyIds([]);
    onClose();
  };

  const toggleHierarchySelection = (hierarchyId: string) => {
    setSelectedHierarchyIds((prev) =>
      prev.includes(hierarchyId)
        ? prev.filter((id) => id !== hierarchyId)
        : [...prev, hierarchyId],
    );
  };

  const availableOptions = useMemo(
    () =>
      sortHierarchyGroupOptionsByLabel(
        availableHierarchies.filter(
          (h) =>
            selectedHierarchyIds.includes(h.id) ||
            (eligibleHierarchyIds.has(h.id) && !assignedHierarchyIds.has(h.id)),
        ),
        hierarchyOptionLabels,
      ),
    [
      availableHierarchies,
      selectedHierarchyIds,
      eligibleHierarchyIds,
      assignedHierarchyIds,
      hierarchyOptionLabels,
    ],
  );

  const getHierarchyLabel = (id: string) => {
    const option = availableHierarchies.find((h) => h.id === id);
    return option ? sectorPresentationLabel(option, visibility) : id;
  };

  const isValid = name.trim() && selectedHierarchyIds.length > 0;

  return (
    <Dialog
      PaperProps={{
        sx: { bgcolor: 'background.paper', backgroundImage: 'none' },
      }}
      sx={{ '& .MuiFormHelperText-root': { color: 'text.secondary' } }}
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ color: 'text.primary' }}>
        <SFlex justifyContent="space-between" alignItems="center">
          <SFlex alignItems="center" gap={2}>
            <GroupWorkIcon color="primary" />
            <Typography color="text.primary" variant="h6">
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
        <SFlex sx={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <TextField
            fullWidth
            label="Nome do Agrupamento"
            placeholder="Ex: Administrativo, Operacional, Gerencial..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <TextField
            fullWidth
            label="Justificativa do agrupamento"
            placeholder="Descreva a premissa utilizada para formar este agrupamento, considerando similaridade organizacional, contexto de trabalho e preservação do anonimato."
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
            multiline
            minRows={3}
            inputProps={{ maxLength: 500 }}
            helperText={`${description.length}/500`}
          />

          <SectorPicker
            key={open ? 'open' : 'closed'}
            options={availableOptions}
            onVisibilityChange={setVisibility}
            selected={selectedHierarchyIds}
            onChange={setSelectedHierarchyIds}
            disabled={loading}
          />

          {selectedHierarchyIds.length > 0 && (
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 5,
                backgroundColor: 'background.paper',
              }}
            >
              <Typography
                variant="body2"
                fontWeight={500}
                mb={1.5}
                sx={{ color: 'text.primary' }}
              >
                Setores selecionados ({selectedHierarchyIds.length}):
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  minHeight: '40px',
                }}
              >
                {selectedHierarchyIds.map((hId) => {
                  const hierarchyName = getHierarchyLabel(hId);
                  return (
                    <Chip
                      key={hId}
                      label={<HierarchyLabel text={hierarchyName} />}
                      onDelete={
                        loading
                          ? undefined
                          : () => toggleHierarchySelection(hId)
                      }
                      variant="filled"
                      sx={{
                        height: 'auto',
                        '& .MuiChip-label': { whiteSpace: 'normal', py: 3 },
                        fontSize: '14px',
                        mr: 5,
                        mt: 5,
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          )}

          {selectedHierarchyIds.length === 0 && (
            <Box
              sx={{
                p: 2,
                textAlign: 'center',
                backgroundColor: 'background.default',
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Nenhum setor selecionado ainda
              </Typography>
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
