import { AppLinkButton } from '@components';
import { AppBar, Container, Stack, Typography } from '@mui/material';
import { getTranslations } from 'next-intl/server';

export async function Footer() {
  const t = await getTranslations('footer');

  const year = new Date().getFullYear();

  return (
    <AppBar
      component="footer"
      elevation={0}
      position="static"
      sx={{
        backgroundColor: 'background.paper',
        borderColor: 'divider',
        color: 'text.secondary',
        mt: 'auto',
        py: 2,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ sm: 'row', xs: 'column' }}
          spacing={1.5}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <AppLinkButton href="/about">{t('aboutLink')}</AppLinkButton>
            <AppLinkButton
              href="https://github.com/AlyaEngineer/swagger-editor-app"
              rel="noopener noreferrer"
              target="_blank"
            >
              {t('githubLink')}
            </AppLinkButton>
          </Stack>
          <Typography variant="body1">© {year} Swagger Editor App</Typography>
        </Stack>
      </Container>
    </AppBar>
  );
}
