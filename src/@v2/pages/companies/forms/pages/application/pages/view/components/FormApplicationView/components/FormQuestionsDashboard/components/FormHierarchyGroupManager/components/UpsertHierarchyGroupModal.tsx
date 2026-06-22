import CloseIcon from '@mui/icons-material/Close';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import {
  Box,
  Checkbox,
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
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { SPopperSelectItem } from '@v2/components/organisms/SPopper/addons/SPopperSelectItem/SPopperSelectItem';
import { useEffect, useMemo, useState } from 'react';
import { sortHierarchyGroupOptionsByLabel } from '../helpers/formatHierarchyGroupOptionLabel';

interface HierarchyOption {
  id: string;
  name: string;
  establishment?: string;
  companyName?: string;
}

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
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedHierarchyIds, setSelectedHierarchyIds] = useState<string[]>(
    [],
  );

  const isEditing = !!initialData;

  useEffect(() => {
    if (open) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setSelectedHierarchyIds(initialData?.hierarchyIds || []);
    }
  }, [open, initialData]);

  const handleSave = () => {
    if (!name.trim() || selectedHierarchyIds.length === 0) return;
    const trimmedDescription = description.trim();
    onSave({
      name: name.trim(),
      description: trimmedDescription ? trimmedDescription : null,
      hierarchyIds: selectedHierarchyIds,
    });
  };

  const handleClose = () => {
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

  const popperSelectedOptions = useMemo(
    () =>
      availableOptions.filter((option) =>
        selectedHierarchyIds.includes(option.id),
      ),
    [availableOptions, selectedHierarchyIds],
  );

  const getHierarchyLabel = (id: string) => {
    return (
      hierarchyOptionLabels.get(id) ??
      availableHierarchies.find((h) => h.id === id)?.name ??
      id
    );
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
        <SFlex sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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

          <Box>
            <SSearchSelect
              inputProps={{ sx: { width: '100%' } }}
              label="Adicionar setor ao agrupamento"
              closeOnSelect={false}
              popperSelected={popperSelectedOptions}
              onPopperClean={() => setSelectedHierarchyIds([])}
              getOptionLabel={(option) =>
                hierarchyOptionLabels.get(option.id) ?? option.name
              }
              getOptionValue={(option) => option?.id}
              renderFullOption={({ option, label, isSelected, handleSelect }) => (
                <SPopperSelectItem
                  key={option.id}
                  selected={isSelected}
                  onClick={handleSelect}
                  rerender={
                    selectedHierarchyIds.length * 2 + (isSelected ? 1 : 0)
                  }
                  startAddon={
                    <Checkbox
                      checked={isSelected}
                      size="small"
                      tabIndex={-1}
                      disableRipple
                      sx={{
                        p: 0,
                        ml: 1,
                        mr: 0.5,
                        pointerEvents: 'none',
                      }}
                    />
                  }
                  text={label}
                />
              )}
              onChange={(option) => {
                if (!option) return;
                toggleHierarchySelection(option.id);
              }}
              value={null}
              options={availableOptions}
              placeholder="Busque e selecione setores..."
            />
          </Box>

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
                      label={hierarchyName}
                      onDelete={() => toggleHierarchySelection(hId)}
                      variant="filled"
                      sx={{
                        height: '32px',
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
                backgroundColor: 'grey.50',
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
