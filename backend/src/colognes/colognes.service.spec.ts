import { Test, TestingModule } from '@nestjs/testing';
import { ColognesService } from './colognes.service';

describe('ColognesService', () => {
  let service: ColognesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ColognesService],
    }).compile();

    service = module.get<ColognesService>(ColognesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
