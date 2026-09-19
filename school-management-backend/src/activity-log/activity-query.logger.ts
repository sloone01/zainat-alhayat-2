import { Logger as NestLogger } from '@nestjs/common';
import type { Logger as TypeOrmLogger, QueryRunner } from 'typeorm';
import { recordAuditQuery } from './request-audit.context';

/**
 * Captures the SQL TypeORM actually sent (query + parameters), not QueryBuilder.toString().
 * Password writes are dropped in `recordAuditQuery`.
 */
export class ActivityQueryLogger implements TypeOrmLogger {
  private readonly console = new NestLogger('TypeORM');
  private readonly echo = process.env.NODE_ENV === 'development';

  logQuery(query: string, parameters?: unknown[], _queryRunner?: QueryRunner) {
    this.capture(query, parameters);
    if (this.echo) this.console.log(formatExactSql(query, parameters));
  }

  logQueryError(
    error: string | Error,
    query: string,
    parameters?: unknown[],
    _queryRunner?: QueryRunner,
  ) {
    this.capture(query, parameters);
    const msg = error instanceof Error ? error.message : String(error);
    this.console.warn(`${formatExactSql(query, parameters)} — ${msg}`);
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: unknown[],
    _queryRunner?: QueryRunner,
  ) {
    this.capture(query, parameters);
    this.console.warn(`slow ${time}ms ${formatExactSql(query, parameters)}`);
  }

  private capture(query: string, parameters?: unknown[]) {
    try {
      recordAuditQuery(formatExactSql(query, parameters));
    } catch {
      /* never fail a login or other query because the audit logger broke */
    }
  }

  logSchemaBuild(message: string) {
    if (this.echo) this.console.log(message);
  }

  logMigration(message: string) {
    this.console.log(message);
  }

  log(level: 'log' | 'info' | 'warn', message: unknown) {
    const text = typeof message === 'string' ? message : JSON.stringify(message);
    if (level === 'warn') this.console.warn(text);
    else if (this.echo) this.console.log(text);
  }
}

function formatExactSql(query: string, parameters?: unknown[]): string {
  const sql = String(query || '').replace(/\s+/g, ' ').trim();
  if (!parameters?.length) return sql;
  return `${sql} -- PARAMETERS: ${safeParams(parameters)}`;
}

function safeParams(parameters: unknown[]): string {
  try {
    return JSON.stringify(parameters, (_key, value) => {
      if (typeof value === 'string' && value.length > 400) {
        return `${value.slice(0, 400)}…`;
      }
      return value;
    });
  } catch {
    return '[unserializable]';
  }
}
