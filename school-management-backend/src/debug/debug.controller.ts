import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@ApiTags('debug')
@Controller('debug')
export class DebugController {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  @Get('info')
  @ApiOperation({ summary: 'Get system information' })
  @ApiResponse({ status: 200, description: 'System information' })
  getSystemInfo() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100,
      },
      database: {
        isConnected: this.dataSource.isInitialized,
        driver: this.dataSource.driver.options.type,
      },
      cors: {
        origin: process.env.CORS_ORIGIN || 'not set',
        credentials: process.env.CORS_CREDENTIALS || 'not set',
      },
      service: 'Zinat Al-Haya School Management API'
    };
  }

  @Get('database')
  @ApiOperation({ summary: 'Test database connection' })
  @ApiResponse({ status: 200, description: 'Database connection status' })
  async testDatabase() {
    try {
      // Test basic query
      const result = await this.dataSource.query('SELECT NOW() as current_time, version() as db_version');
      
      // Get table count
      const tables = await this.dataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);

      return {
        status: 'connected',
        timestamp: new Date().toISOString(),
        connection: {
          isInitialized: this.dataSource.isInitialized,
          hasMetadata: this.dataSource.hasMetadata,
          driver: this.dataSource.driver.options.type,
        },
        query_result: result[0],
        tables: {
          count: tables.length,
          names: tables.map(t => t.table_name),
        },
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        connection: {
          isInitialized: this.dataSource.isInitialized,
          hasMetadata: this.dataSource.hasMetadata,
        },
      };
    }
  }

  @Get('tables')
  @ApiOperation({ summary: 'List all database tables' })
  @ApiResponse({ status: 200, description: 'List of database tables' })
  async getTables() {
    try {
      const tables = await this.dataSource.query(`
        SELECT 
          table_name,
          table_type,
          (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);

      return {
        status: 'success',
        timestamp: new Date().toISOString(),
        tables: tables,
        total_count: tables.length,
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  @Get('table/:tableName')
  @ApiOperation({ summary: 'Get table structure and sample data' })
  @ApiParam({ name: 'tableName', description: 'Name of the table to inspect' })
  @ApiResponse({ status: 200, description: 'Table structure and data' })
  async getTableInfo(@Param('tableName') tableName: string) {
    try {
      // Get table structure
      const columns = await this.dataSource.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      // Get row count
      const countResult = await this.dataSource.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      const rowCount = parseInt(countResult[0].count);

      // Get sample data (first 5 rows)
      const sampleData = await this.dataSource.query(`SELECT * FROM "${tableName}" LIMIT 5`);

      return {
        status: 'success',
        timestamp: new Date().toISOString(),
        table: tableName,
        structure: {
          columns: columns,
          column_count: columns.length,
        },
        data: {
          total_rows: rowCount,
          sample_rows: sampleData,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        table: tableName,
        error: error.message,
      };
    }
  }

  @Post('query')
  @ApiOperation({ summary: 'Execute a custom SQL query (SELECT only)' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        query: { type: 'string', description: 'SQL query to execute (SELECT only)' } 
      } 
    } 
  })
  @ApiResponse({ status: 200, description: 'Query results' })
  async executeQuery(@Body() body: { query: string }) {
    try {
      // Only allow SELECT queries for safety
      const query = body.query.trim().toLowerCase();
      if (!query.startsWith('select')) {
        return {
          status: 'error',
          timestamp: new Date().toISOString(),
          error: 'Only SELECT queries are allowed for security reasons',
        };
      }

      const result = await this.dataSource.query(body.query);

      return {
        status: 'success',
        timestamp: new Date().toISOString(),
        query: body.query,
        results: result,
        row_count: result.length,
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        query: body.query,
        error: error.message,
      };
    }
  }
}
