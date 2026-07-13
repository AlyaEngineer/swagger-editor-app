import { EXTERNAL_LINKS } from '@/constants/routes';

export const COURSE_HIGHLIGHTS = ['community', 'practice', 'open'] as const;

export const RESOURCE_LINKS = [
  {
    href: EXTERNAL_LINKS.rsSchool,
    labelKey: 'resources.school',
  },
  {
    href: EXTERNAL_LINKS.reactCourse,
    labelKey: 'resources.course',
  },
  {
    href: EXTERNAL_LINKS.rsDocs,
    labelKey: 'resources.docs',
  },
  {
    href: EXTERNAL_LINKS.githubRepo,
    labelKey: 'resources.repository',
  },
] as const;

export const TECHNOLOGIES = [
  'Next.js',
  'React',
  'TypeScript',
  'Redux Toolkit',
  'next-intl',
  'Material UI',
  'Vitest',
  'React Testing Library',
] as const;
