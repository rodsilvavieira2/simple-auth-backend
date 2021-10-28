import { createConnection, Connection, getConnectionOptions } from 'typeorm';

export const loadConnection = async (): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();

  return createConnection(
    Object.assign(defaultOptions, {
      database:
        process.env.NODE_ENV === 'test'
          ? 'auth_api_test'
          : defaultOptions.database,
      host: process.env.LOCALE_ENV === 'docker' ? 'postgres' : 'localhost',
    }),
  );
};
