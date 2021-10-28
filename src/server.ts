import { loadConnection } from '@config/typeorm';

const loadServer = async () => {
  await loadConnection();
  const { app } = await import('@config/server/app');

  app.listen(8080, () => console.log('server running'));
};

loadServer();
