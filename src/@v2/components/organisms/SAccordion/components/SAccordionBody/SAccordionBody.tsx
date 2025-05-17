import { CircularProgress, Divider, Grid } from '@mui/material';

export interface SAccordionBodyProps {
  children: React.ReactNode;
  primaryButton?: React.ReactNode;
  secondaryButton?: React.ReactNode;
  loadingSecondaryButton?: boolean;
}

export const SAccordionBody: React.FC<SAccordionBodyProps> = ({
  children,
  primaryButton,
  secondaryButton,
  loadingSecondaryButton,
}) => {
  return (
    <>
      <Divider />
      {children}
      {(secondaryButton || primaryButton) && (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            {loadingSecondaryButton ? (
              <CircularProgress color="primary" size={18} />
            ) : (
              secondaryButton
            )}
          </Grid>
          <Grid
            item
            xs={6}
            sx={{ display: 'flex', justifyContent: 'flex-end' }}
          >
            {primaryButton}
          </Grid>
        </Grid>
      )}
    </>
  );
};
