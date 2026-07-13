import { TableCell, TableHead, TableRow } from '@mui/material';
import { useTranslations } from 'next-intl';

const headerCellSx = {
  bgcolor: 'background.paper',
  whiteSpace: 'pre-line',
};

export function HistoryTableHeader() {
  const t = useTranslations('HistoryPage');

  return (
    <TableHead>
      <TableRow>
        <TableCell align="center" sx={headerCellSx}>
          {t('methodColumn')}
        </TableCell>
        <TableCell align="center" sx={headerCellSx}>
          {t('endpointColumn')}
        </TableCell>
        <TableCell align="center" sx={headerCellSx}>
          {t('statusColumn')}
        </TableCell>
        <TableCell align="center" sx={headerCellSx}>
          {t('durationColumn')}
        </TableCell>
        <TableCell align="center" sx={headerCellSx}>
          {t('requestSizeColumn')}
        </TableCell>
        <TableCell align="center" sx={headerCellSx}>
          {t('responseSizeColumn')}
        </TableCell>
        <TableCell align="center" sx={headerCellSx}>
          {t('timestampColumn')}
        </TableCell>
        <TableCell align="center" sx={headerCellSx}>
          {t('errorColumn')}
        </TableCell>
      </TableRow>
    </TableHead>
  );
}
