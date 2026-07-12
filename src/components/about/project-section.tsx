import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { AboutSectionProps } from './about-page.types';

import styles from './about-page-content.module.css';
import { TECHNOLOGIES } from './about-page.constants';

export function ProjectSection({ t }: AboutSectionProps) {
  return (
    <Box component="section">
      <Typography className={styles.sectionTitle} component="h2" variant="h4">
        {t('project.title')}
      </Typography>
      <Typography className={styles.sectionDescription} color="text.secondary">
        {t('project.description')}
      </Typography>
      <Typography className={styles.technologyTitle} component="h3" variant="h6">
        {t('project.technologies')}
      </Typography>
      <Stack className={styles.technologyList} direction="row">
        {TECHNOLOGIES.map((technology) => (
          <Chip key={technology} label={technology} variant="outlined" />
        ))}
      </Stack>
    </Box>
  );
}
