import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

import type { AboutSectionProps } from './about-page.types';

import styles from './about-page-content.module.css';
import { CourseSection } from './course-section';
import { HeroSection } from './hero-section';
import { ProjectSection } from './project-section';
import { ResourcesSection } from './resources-section';
import { TeamSection } from './team-section';

export function AboutPageContent({ t }: AboutSectionProps) {
  return (
    <Box className={styles.root} component="div">
      <HeroSection t={t} />

      <Container className={styles.contentContainer} maxWidth="lg">
        <Stack className={styles.contentStack}>
          <CourseSection t={t} />
          <Divider />
          <ProjectSection t={t} />
          <Divider />
          <TeamSection t={t} />
          <Divider />
          <ResourcesSection t={t} />
        </Stack>
      </Container>
    </Box>
  );
}
