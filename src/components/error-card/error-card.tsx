import { Box, Button, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

type ErrorCardProps = {
  description: string;
  onRetry: () => void;
  retryLabel: string;
  title: string;
};

export function ErrorCard({ description, onRetry, retryLabel, title }: ErrorCardProps) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: 'background.default',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100dvh',
        p: 2,
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: 'background.paper',
          borderRadius: '8px',
          borderTop: '2px solid',
          borderTopColor: 'error.main',
          boxShadow: (theme) => `0 0 32px 4px ${alpha(theme.palette.error.main, 0.3)}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          maxWidth: '450px',
          p: 4,
          textAlign: 'center',
          width: '100%',
        }}
      >
        <Typography component="h1" variant="h4">
          {title}
        </Typography>

        <Typography color="text.secondary">{description}</Typography>

        <Button
          onClick={onRetry}
          sx={{ borderRadius: '8px', textTransform: 'uppercase' }}
          variant="outlined"
        >
          {retryLabel}
        </Button>
      </Box>
    </Box>
  );
}
