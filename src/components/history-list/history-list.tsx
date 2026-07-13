'use client';

import { Paper, Table, TableBody, TableContainer, TablePagination } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { RequestHistoryEntry } from '@/utils/history/history-types';

import { HistoryTableHeader } from './history-table-header';
import { HistoryTableRow } from './history-table-row';

type HistoryListProps = {
  entries: RequestHistoryEntry[];
};

const ROWS_PER_PAGE = [10, 25, 100];

export function HistoryList({ entries }: HistoryListProps) {
  const t = useTranslations('HistoryPage');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE[0]);

  function handleChangePage(_event: unknown, newPage: number) {
    setPage(newPage);
  }

  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  }

  const pageStartIndex = page * rowsPerPage;
  const pageEndIndex = pageStartIndex + rowsPerPage;

  const visibleEntries = entries.slice(pageStartIndex, pageEndIndex);

  return (
    <Paper sx={{ borderRadius: '8px', overflow: 'hidden', width: '100%' }} variant="outlined">
      <TableContainer sx={{ maxHeight: 520 }}>
        <Table aria-label={t('title')} stickyHeader>
          <HistoryTableHeader />

          <TableBody>
            {visibleEntries.map((entry) => (
              <HistoryTableRow entry={entry} key={entry.id} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={entries.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={ROWS_PER_PAGE}
      />
    </Paper>
  );
}
