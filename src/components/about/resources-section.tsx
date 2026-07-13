import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { AppLinkButton } from '@/components';

import type { AboutSectionProps } from './about-page.types';

import styles from './about-page-content.module.css';
import { RESOURCE_LINKS } from './about-page.constants';

export function ResourcesSection({ t }: AboutSectionProps) {
  return (
    <Box component="section">
      <Typography className={styles.sectionTitle} component="h2" variant="h4">
        {t('resources.title')}
      </Typography>
      <Typography className={styles.sectionDescription} color="text.secondary">
        {t('resources.description')}
      </Typography>
      <Stack className={styles.resourceList}>
        {RESOURCE_LINKS.map((resource) => (
          <AppLinkButton href={resource.href} isExternal key={resource.href} variant="text">
            {t(resource.labelKey)}
          </AppLinkButton>
        ))}
      </Stack>
    </Box>
  );
}
