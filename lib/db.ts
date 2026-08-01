import "server-only"
import sql from "mssql"

/**
 * MS SQL Server connection pool (singleton).
 *
 * Configure via environment variables:
 *   MSSQL_SERVER    e.g. "localhost" or "myserver.database.windows.net"
 *   MSSQL_DATABASE  e.g. "OurMithla"
 *   MSSQL_USER      SQL login user
 *   MSSQL_PASSWORD  SQL login password
 *   MSSQL_PORT      (optional) defaults to 1433
 *   MSSQL_ENCRYPT   (optional) "true" for Azure SQL
 *
 * If these are not set, `isDbConfigured()` returns false and the app falls back
 * to bundled seed data so the site still renders (e.g. in the v0 preview).
 */

let poolPromise: Promise<sql.ConnectionPool> | null = null

export function isDbConfigured(): boolean {
  return Boolean(
    process.env.MSSQL_SERVER &&
      process.env.MSSQL_DATABASE &&
      process.env.MSSQL_USER &&
      process.env.MSSQL_PASSWORD,
  )
}

export function getPool(): Promise<sql.ConnectionPool> {
  if (!isDbConfigured()) {
    return Promise.reject(new Error("MSSQL is not configured"))
  }

  if (!poolPromise) {
    const config: sql.config = {
      server: process.env.MSSQL_SERVER as string,
      database: process.env.MSSQL_DATABASE as string,
      user: process.env.MSSQL_USER as string,
      password: process.env.MSSQL_PASSWORD as string,
      port: process.env.MSSQL_PORT ? Number(process.env.MSSQL_PORT) : 1433,
      pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
      options: {
        encrypt: process.env.MSSQL_ENCRYPT === "true",
        trustServerCertificate: process.env.MSSQL_TRUST_CERT === "true",
      },
    }

    poolPromise = sql.connect(config).catch((err: unknown) => {
      poolPromise = null // allow retry on next call
      throw err
    })
  }

  return poolPromise!
}

export { sql }
