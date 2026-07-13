import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { AboutSectionProps } from './about-page.types';

import styles from './about-page-content.module.css';
import { COURSE_HIGHLIGHTS } from './about-page.constants';

export function CourseSection({ t }: AboutSectionProps) {
  return (
    <Box component="section">
      <Typography className={styles.sectionTitle} component="h2" variant="h4">
        {t('course.title')}
      </Typography>
      <Typography className={styles.sectionDescription} color="text.secondary">
        {t('course.description')}
      </Typography>
      <Box className={styles.highlightsGrid}>
        {COURSE_HIGHLIGHTS.map((highlight) => (
          <Box className={styles.panel} key={highlight}>
            <Typography className={styles.panelTitle} component="h3" gutterBottom variant="h6">
              {t(`course.highlights.${highlight}.title`)}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {t(`course.highlights.${highlight}.description`)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
