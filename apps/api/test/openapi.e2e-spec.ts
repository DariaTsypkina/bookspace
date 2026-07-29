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

    type OpenApiParameter = {
      name?: string;
      in?: string;
      schema?: {
        type?: string;
        maxLength?: number;
        minimum?: number;
        maximum?: number;
      };
    };

    const parameters = (
      response.body as {
        paths?: Record<string, { get?: { parameters?: OpenApiParameter[] } }>;
      }
    ).paths?.['/catalog/search']?.get?.parameters;

    expect(parameters).toBeDefined();
    const qParam = parameters?.find(
      (parameter) => parameter.name === 'q' && parameter.in === 'query',
    );
    const limitParam = parameters?.find(
      (parameter) => parameter.name === 'limit' && parameter.in === 'query',
    );

    expect(qParam?.schema?.type).toBe('string');
    expect(qParam?.schema?.maxLength).toBe(200);
    expect(limitParam?.schema?.type).toBe('integer');
    expect(limitParam?.schema?.minimum).toBe(1);
    expect(limitParam?.schema?.maximum).toBe(50);
  });

  it('GET /docs-json exposes Zod-based admin context DTO schemas', async () => {
    const response = await request(app.getHttpServer())
      .get('/docs-json')
      .expect(200);

    const schemas = (response.body as { components?: { schemas?: object } })
      .components?.schemas;

    expect(schemas).toBeDefined();
    expect(schemas).toHaveProperty('AdminContextPatchDto');
    expect(schemas).toHaveProperty('AdminContextExtractDto');
  });
});
