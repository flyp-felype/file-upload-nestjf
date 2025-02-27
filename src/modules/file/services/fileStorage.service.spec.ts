import { Test, TestingModule } from '@nestjs/testing';
import { FileStorageService } from './fileStorage.service';
import * as fs from 'fs';
import * as path from 'path';
import { File } from '@nest-lab/fastify-multer';

describe('FileStorageService', () => {
  let service: FileStorageService;

  const mockUploadDir = path.join(__dirname, 'uploads');

  const mockFile: File = {
    fieldname: 'file',
    originalname: 'test.csv',
    encoding: '7bit',
    mimetype: 'text/csv',
    buffer: Buffer.from('test,1,2,3'),
    size: 123,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileStorageService],
    }).compile();

    service = module.get<FileStorageService>(FileStorageService);

    if (fs.existsSync(mockUploadDir)) {
      fs.rmdirSync(mockUploadDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(mockUploadDir)) {
      fs.rmdirSync(mockUploadDir, { recursive: true });
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveFile', () => {
    it('should save the file in the upload directory and return the path', () => {
      const filePath = service.saveFile(mockFile);

      expect(fs.existsSync(filePath)).toBeTruthy();
      expect(filePath).toBe(path.join(mockUploadDir, mockFile.originalname));
    });

    it('should create the upload directory if it does not exist', () => {
      expect(fs.existsSync(mockUploadDir)).toBeFalsy();

      const filePath = service.saveFile(mockFile);

      expect(fs.existsSync(mockUploadDir)).toBeTruthy();
      expect(filePath).toBe(path.join(mockUploadDir, mockFile.originalname));
    });
  });
});
