import { getAuthenticatedUser } from '@/utils/auth/get-authenticated-user';

export default async function HistoryPage() {
  await getAuthenticatedUser();

  return <div>History</div>;
}
