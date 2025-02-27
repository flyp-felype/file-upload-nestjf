import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from './file.controller';
import { File } from '@nest-lab/fastify-multer';
import { UploadService } from '../services/upload.service';
describe('FileController', () => {
  let controller: FileController;
  let uploadService: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        {
          provide: UploadService,
          useValue: {
            processFile: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<FileController>(FileController);
    uploadService = module.get<UploadService>(UploadService);
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

      expect(uploadService.processFile).toHaveBeenCalledWith(mockFile);
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
        .spyOn(uploadService, 'processFile')
        .mockRejectedValue(new Error('Processing failed'));

      await expect(controller.uploadFile(mockFile)).rejects.toThrow(
        'Processing failed',
      );
    });
  });
});
