import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchIcon from '@mui/icons-material/Launch';
import SchoolIcon from '@mui/icons-material/School';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { AppLinkButton } from '@/components';
import { EXTERNAL_LINKS } from '@/constants/routes';

import type { AboutSectionProps } from './about-page.types';

import styles from './about-page-content.module.css';

export function HeroSection({ t }: AboutSectionProps) {
  return (
    <Box className={styles.hero} component="section">
      <Container maxWidth="lg">
        <Stack className={styles.heroContent}>
          <Stack className={styles.heroEyebrowRow}>
            <SchoolIcon aria-hidden color="primary" />
            <Typography
              className={styles.heroEyebrow}
              color="primary.main"
              component="p"
              variant="overline"
            >
              {t('hero.eyebrow')}
            </Typography>
          </Stack>
          <Typography className={styles.heroTitle} component="h1" variant="h2">
            {t('hero.title')}
          </Typography>
          <Typography className={styles.heroDescription} color="text.secondary" variant="h6">
            {t('hero.description')}
          </Typography>
          <Stack className={styles.heroActions}>
            <AppLinkButton
              className={styles.heroActionButton}
              endIcon={<LaunchIcon />}
              href={EXTERNAL_LINKS.reactCourse}
              isExternal
              variant="contained"
            >
              {t('resources.course')}
            </AppLinkButton>
            <AppLinkButton
              className={styles.heroActionButton}
              endIcon={<GitHubIcon />}
              href={EXTERNAL_LINKS.githubRepo}
              isExternal
              variant="outlined"
            >
              {t('resources.repository')}
            </AppLinkButton>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
