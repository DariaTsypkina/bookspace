import {
  Catch,
  ArgumentsHost,
  BadRequestException,
  ExceptionFilter,
  HttpStatus,
  INestApplication,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  cleanupOpenApiDoc,
  ZodValidationException,
  ZodValidationPipe,
} from 'nestjs-zod';
import cookieParser from 'cookie-parser';
import type { Response } from 'express';
import type { ZodError, ZodIssue } from 'zod';

type ValidationErrorItem = {
  code: string;
  path: string;
  message: string;
};

type ValidationErrorResponse = {
  statusCode: number;
  error: string;
  code: 'VALIDATION_FAILED';
  errors: ValidationErrorItem[];
};

@Catch(BadRequestException, ZodValidationException)
class ValidationExceptionFilter implements ExceptionFilter<
  BadRequestException | ZodValidationException
> {
  catch(
    exception: BadRequestException | ZodValidationException,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const normalized = this.normalize(exception);

    if (!normalized) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    response.status(HttpStatus.BAD_REQUEST).json(normalized);
  }

  private normalize(exception: unknown): ValidationErrorResponse | null {
    if (!(exception instanceof ZodValidationException)) {
      return null;
    }

    const zodError = exception.getZodError() as ZodError;
    const errors = zodError.issues.map((issue: ZodIssue) => ({
      code: issue.code,
      path: issue.path.join('.'),
      message: issue.message,
    }));

    return this.makeResponse(errors);
  }

  private makeResponse(errors: ValidationErrorItem[]): ValidationErrorResponse {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      code: 'VALIDATION_FAILED',
      errors,
    };
  }
}

export function configureApp(app: INestApplication): void {
  app.use(cookieParser());
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new ValidationExceptionFilter());

  const webOrigin = process.env.WEB_URL ?? 'http://localhost:3000';
  app.enableCors({ origin: [webOrigin], credentials: true });

  const config = new DocumentBuilder()
    .setTitle('Bookspace API')
    .setVersion('1.0')
    .build();
  const openApiDoc = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, cleanupOpenApiDoc(openApiDoc));
}
