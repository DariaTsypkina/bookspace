import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpOutboundModule } from './http-outbound.module';

describe('HttpOutboundModule', () => {
  it('provides injectable HttpService from registered HttpModule', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpOutboundModule],
    }).compile();

    const http = module.get(HttpService);

    expect(http).toBeInstanceOf(HttpService);
    expect(http.axiosRef).toBeDefined();
    expect(http.axiosRef.defaults.timeout).toBe(10_000);
  });
});
