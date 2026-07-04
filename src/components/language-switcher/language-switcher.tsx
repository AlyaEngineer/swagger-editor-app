'use client';

import { FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useLocale } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

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
    <FormControl size="small">
      <Select
        label="Language"
        MenuProps={{ disableScrollLock: true }}
        onChange={handleChange}
        value={locale}
      >
        {routing.locales.map((item) => (
          <MenuItem key={item} value={item}>
            {item.toUpperCase()}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
