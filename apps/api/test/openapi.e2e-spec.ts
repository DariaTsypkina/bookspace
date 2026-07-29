import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';

describe('OpenAPI (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /docs-json exposes Zod-based auth DTO schemas', async () => {
    const response = await request(app.getHttpServer())
      .get('/docs-json')
      .expect(200);

    const schemas = (response.body as { components?: { schemas?: object } })
      .components?.schemas;

    expect(schemas).toBeDefined();
    expect(schemas).toHaveProperty('RegisterDto');
    expect(schemas).toHaveProperty('LoginDto');
  });

  it('GET /docs-json documents catalog search query params from Zod DTO', async () => {
    const response = await request(app.getHttpServer())
      .get('/docs-json')
      .expect(200);

    const operation = (
      response.body as {
        paths?: Record<string, { get?: { parameters?: unknown[] } }>;
      }
    ).paths?.['/catalog/search']?.get;

    expect(operation?.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'q',
          in: 'query',
          schema: expect.objectContaining({
            type: 'string',
            maxLength: 200,
          }),
        }),
        expect.objectContaining({
          name: 'limit',
          in: 'query',
          schema: expect.objectContaining({
            type: 'integer',
            minimum: 1,
            maximum: 50,
          }),
        }),
      ]),
    );
  });
});
