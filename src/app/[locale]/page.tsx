import { SwaggerEditor } from '@components';

import { restoreSchemaForCurrentUser } from '@/services/schema-server-service';

export default async function Home() {
  const initialSchema = await restoreSchemaForCurrentUser();

  return <SwaggerEditor initialSchema={initialSchema} />;
}
