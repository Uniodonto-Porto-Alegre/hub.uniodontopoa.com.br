import sql from 'mssql';
import { config, getSqlServerConfigErrors } from './config.js';

let poolPromise = null;

const buildSqlConfig = () => {
  return {
    user: config.sqlServer.user,
    password: config.sqlServer.password,
    server: config.sqlServer.server,
    database: config.sqlServer.database,
    port: config.sqlServer.port,
    options: {
      encrypt: config.sqlServer.encrypt,
      trustServerCertificate: config.sqlServer.trustServerCertificate,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };
};

export const getSqlPool = async () => {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(buildSqlConfig())
      .connect()
      .catch((error) => {
        poolPromise = null;
        throw error;
      });
  }

  return poolPromise;
};

export const fetchLinksXmlByFaturas = async (faturas) => {
  const configErrors = getSqlServerConfigErrors();

  if (configErrors.length > 0) {
    throw new Error(`Configuração SQL Server ausente: ${configErrors.join(', ')}`);
  }

  const uniqueFaturas = [...new Set(faturas)]
    .filter((value) => Number.isInteger(value) && value > 0)
    ;

  if (uniqueFaturas.length > 2000) {
    throw new Error('Cada lote de consulta deve conter no máximo 2000 faturas.');
  }

  if (!uniqueFaturas.length) {
    return [];
  }

  const pool = await getSqlPool();
  const request = pool.request();

  uniqueFaturas.forEach((idFatura, index) => {
    request.input(`id${index}`, sql.Int, idFatura);
  });

  const inClause = uniqueFaturas.map((_, index) => `@id${index}`).join(', ');
  const query = `
    SELECT
      linkXml AS link,
      CONCAT('''', linkXml, '''', ',') AS resultado
    FROM
      nfse_geracao
    WHERE
      IdFatura IN (${inClause})
    ORDER BY
      IdNfseGeracao
  `;

  const result = await request.query(query);
  return result.recordset;
};
