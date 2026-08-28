import { Card as MuiCard, Stack, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';

const Card = styled(MuiCard)(({ theme }) => ({
  alignSelf: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  margin: 'auto',
  padding: theme.spacing(4),
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  width: '100%',
}));

type AuthCardProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  title: string;
};

export function AuthCard({ children, footer, title }: AuthCardProps) {
  return (
    <Stack sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', p: 2 }}>
      <Card
        sx={{
          borderRadius: '8px',
          boxShadow: (theme) =>
            `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}, 0 8px 24px ${alpha(theme.palette.primary.main, 0.24)}`,
        }}
        variant="outlined"
      >
        <Typography component="h1" variant="h4">
          {title}
        </Typography>

        {children}

        {footer}
      </Card>
    </Stack>
  );
}
