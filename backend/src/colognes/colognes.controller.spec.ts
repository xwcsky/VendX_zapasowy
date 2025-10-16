import { Test, TestingModule } from '@nestjs/testing';
import { ColognesController } from './colognes.controller';

describe('ColognesController', () => {
  let controller: ColognesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColognesController],
    }).compile();

    controller = module.get<ColognesController>(ColognesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
