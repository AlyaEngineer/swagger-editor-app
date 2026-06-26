'use client';

import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import { useLocale } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

import styles from './language-switcher.module.scss';

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (event: SelectChangeEvent) => {
    const nextLocale = event.target.value;

    router.replace(pathname, {
      locale: nextLocale,
    });
  };

  return (
    <FormControl className={styles.root} size="small">
      <Select
        className={styles.select}
        MenuProps={{
          slotProps: {
            paper: {
              className: styles.menuPaper,
            },
          },
        }}
        onChange={handleChange}
        value={locale}
      >
        {routing.locales.map((item) => (
          <MenuItem className={styles.menuItem} key={item} value={item}>
            {item.toUpperCase()}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
