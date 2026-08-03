import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import type { CharacterizationAiProfileDto } from '@v2/services/security/characterization/characterization-ai-profile/service/characterization-ai-profile.types';
import { useMutateCharacterizationAiProfile } from '@v2/services/security/characterization/characterization-ai-profile/hooks/useMutateCharacterizationAiProfile';
import { characterizationMap } from 'core/constants/maps/characterization.map';
import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';
import { useEffect, useState } from 'react';

const ALL_TYPES = Object.values(CharacterizationTypeEnum);

type Props = {
  open: boolean;
  companyId: string;
  profiles: CharacterizationAiProfileDto[];
  onClose: () => void;
};

export function CharacterizationAiProfileTypeDefaultsDialog({
  open,
  companyId,
  profiles,
  onClose,
}: Props) {
  const { setTypeDefault } = useMutateCharacterizationAiProfile();
  const [selections, setSelections] = useState<
    Record<CharacterizationTypeEnum, string>
  >({} as Record<CharacterizationTypeEnum, string>);

  useEffect(() => {
    if (!open) return;
    setSelections({} as Record<CharacterizationTypeEnum, string>);
  }, [open]);

  const activeProfiles = profiles.filter((p) => p.isActive);

  const handleSave = async () => {
    await Promise.all(
      ALL_TYPES.map((type) =>
        setTypeDefault.mutateAsync({
          companyId,
          type,
          profileId: selections[type] || null,
        }),
      ),
    );
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Defaults por tipo de caracterização</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {ALL_TYPES.map((type) => (
            <FormControl key={type} fullWidth>
              <InputLabel id={`type-default-${type}`}>
                {characterizationMap[type]?.name ?? type}
              </InputLabel>
              <Select
                labelId={`type-default-${type}`}
                label={characterizationMap[type]?.name ?? type}
                value={selections[type] ?? ''}
                onChange={(e) =>
                  setSelections((prev) => ({
                    ...prev,
                    [type]: e.target.value,
                  }))
                }
              >
                <MenuItem value="">
                  <em>Nenhum</em>
                </MenuItem>
                {activeProfiles.map((profile) => (
                  <MenuItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={setTypeDefault.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={setTypeDefault.isPending}
          onClick={() => void handleSave()}
        >
          Salvar defaults
        </Button>
      </DialogActions>
    </Dialog>
  );
}
