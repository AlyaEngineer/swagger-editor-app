import GitHubIcon from '@mui/icons-material/GitHub';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { AppLinkButton } from '@/components';
import { TEAM_MEMBERS } from '@/constants/team';

import type { AboutSectionProps } from './about-page.types';

import styles from './about-page-content.module.css';

export function TeamSection({ t }: AboutSectionProps) {
  return (
    <Box component="section">
      <Typography
        className={styles.teamEyebrow}
        color="primary.main"
        component="p"
        variant="overline"
      >
        {t('team.eyebrow')}
      </Typography>
      <Typography className={styles.sectionTitle} component="h2" variant="h4">
        {t('team.title')}
      </Typography>
      <Typography className={styles.sectionDescription} color="text.secondary">
        {t('team.description')}
      </Typography>
      <Box className={styles.teamGrid}>
        {TEAM_MEMBERS.map((member) => (
          <Box className={styles.panel} key={member.githubUrl}>
            <Stack className={styles.memberRow} direction="row" spacing={2}>
              <Avatar alt={member.name} className={styles.avatar} src={member.avatarUrl} />
              <Box>
                <Typography className={styles.memberName} component="h3" variant="h6">
                  {member.name}
                </Typography>
                <Typography className={styles.memberRole} color="text.secondary" variant="body2">
                  {t(member.roleKey)}
                </Typography>
              </Box>
            </Stack>
            <AppLinkButton
              aria-label={t('team.githubProfile', { name: member.name })}
              className={styles.githubLink}
              href={member.githubUrl}
              isExternal
              variant="text"
            >
              <GitHubIcon fontSize="small" />
              {t('team.github')}
            </AppLinkButton>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
