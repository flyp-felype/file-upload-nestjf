import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from './file.controller';
import { FileService } from '../../file/services/file.service';
import { File } from '@nest-lab/fastify-multer';
describe('FileController', () => {
  let controller: FileController;
  let fileService: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        {
          provide: FileService,
          useValue: {
            processFile: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<FileController>(FileController);
    fileService = module.get<FileService>(FileService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should call fileService.processFile and return success message', async () => {
      const mockFile = {
        originalname: 'testfile.txt',
        buffer: Buffer.from('test content'),
      } as File;

      const result = await controller.uploadFile(mockFile);

      expect(fileService.processFile).toHaveBeenCalledWith(mockFile);
      expect(result).toEqual({
        message: 'Arquivo recebido com sucesso',
        name: 'testfile.txt',
      });
    });

    it('should handle errors thrown by fileService.processFile', async () => {
      const mockFile = {
        originalname: 'testfile.txt',
        buffer: Buffer.from('test content'),
      } as File;

      jest
        .spyOn(fileService, 'processFile')
        .mockRejectedValue(new Error('Processing failed'));

      await expect(controller.uploadFile(mockFile)).rejects.toThrow(
        'Processing failed',
      );
    });
  });
});
