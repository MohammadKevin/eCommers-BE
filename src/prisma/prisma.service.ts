import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

function getAdapter() {
  const dbUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/E-commers';
  const url = new URL(dbUrl);

  return new PrismaMariaDb({
    host: url.hostname || 'localhost',
    port: url.port ? parseInt(url.port, 10) : 3306,
    user: url.username ? decodeURIComponent(url.username) : 'root',
    password: url.password ? decodeURIComponent(url.password) : '',
    database: url.pathname.replace(/^\//, '') || 'E-commers',
    connectionLimit: 10,
  });
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({ adapter: getAdapter() });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
