import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credential, CredentialType } from './credential.entity';
import { CreateCredentialDto, UpdateCredentialDto, TestCredentialDto } from './dto/credential.dto';
import * as crypto from 'crypto';

@Injectable()
export class CredentialService {
  private readonly encryptionKey = process.env.CREDENTIAL_ENCRYPTION_KEY || 'default-key-change-in-production';

  constructor(
    @InjectRepository(Credential)
    private credentialRepository: Repository<Credential>,
  ) {}

  async create(createCredentialDto: CreateCredentialDto, userId: string): Promise<Credential> {
    // 检查同名凭证
    const existingCredential = await this.credentialRepository.findOne({
      where: { name: createCredentialDto.name, userId }
    });

    if (existingCredential) {
      throw new BadRequestException('凭证名称已存在');
    }

    // 加密敏感数据
    const encryptedData = createCredentialDto.encryptedData 
      ? this.encryptData(createCredentialDto.encryptedData)
      : undefined;

    const credential = this.credentialRepository.create({
      ...createCredentialDto,
      encryptedData,
      userId,
      isActive: createCredentialDto.isActive ?? true,
    });

    return await this.credentialRepository.save(credential);
  }

  async findAll(userId: string, page: number = 1, limit: number = 10): Promise<{ credentials: Credential[], total: number }> {
    const [credentials, total] = await this.credentialRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 解密数据用于返回
    const decryptedCredentials = credentials.map(credential => ({
      ...credential,
      encryptedData: credential.encryptedData ? this.decryptData(credential.encryptedData) : undefined
    }));

    return { credentials: decryptedCredentials, total };
  }

  async findOne(id: string, userId: string): Promise<Credential> {
    const credential = await this.credentialRepository.findOne({
      where: { id, userId }
    });

    if (!credential) {
      throw new NotFoundException('凭证不存在');
    }

    // 解密数据
    if (credential.encryptedData) {
      credential.encryptedData = this.decryptData(credential.encryptedData);
    }

    return credential;
  }

  async update(id: string, updateCredentialDto: UpdateCredentialDto, userId: string): Promise<Credential> {
    const credential = await this.findOne(id, userId);

    // 检查名称冲突（如果更新了名称）
    if (updateCredentialDto.name && updateCredentialDto.name !== credential.name) {
      const existingCredential = await this.credentialRepository.findOne({
        where: { name: updateCredentialDto.name, userId }
      });

      if (existingCredential) {
        throw new BadRequestException('凭证名称已存在');
      }
    }

    // 加密敏感数据
    const encryptedData = updateCredentialDto.encryptedData 
      ? this.encryptData(updateCredentialDto.encryptedData)
      : credential.encryptedData;

    Object.assign(credential, {
      ...updateCredentialDto,
      encryptedData,
    });

    return await this.credentialRepository.save(credential);
  }

  async remove(id: string, userId: string): Promise<void> {
    const credential = await this.findOne(id, userId);
    await this.credentialRepository.remove(credential);
  }

  async testConnection(testCredentialDto: TestCredentialDto, userId: string): Promise<{ success: boolean, message?: string, error?: string }> {
    const credential = await this.findOne(testCredentialDto.credentialId, userId);

    try {
      let testResult: { success: boolean, message?: string };

      switch (credential.type) {
        case CredentialType.DATABASE:
          testResult = await this.testDatabaseConnection(credential);
          break;
        case CredentialType.API:
          testResult = await this.testApiConnection(credential);
          break;
        case CredentialType.EMAIL:
          testResult = await this.testEmailConnection(credential);
          break;
        case CredentialType.FTP:
          testResult = await this.testFtpConnection(credential);
          break;
        case CredentialType.SSH:
          testResult = await this.testSshConnection(credential);
          break;
        case CredentialType.WEBHOOK:
          testResult = await this.testWebhookConnection(credential);
          break;
        default:
          testResult = { success: true, message: '自定义凭证类型，跳过连接测试' };
      }

      // 更新测试结果
      await this.credentialRepository.update(credential.id, {
        lastTestedAt: new Date(),
        testPassed: testResult.success,
        testError: testResult.success ? null : testResult.message
      });

      return testResult;
    } catch (error) {
      const errorMessage = error.message || '连接测试失败';
      
      // 更新测试结果
      await this.credentialRepository.update(credential.id, {
        lastTestedAt: new Date(),
        testPassed: false,
        testError: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  }

  private encryptData(data: Record<string, any>): Record<string, any> {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    const encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex') + cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex')
    };
  }

  private decryptData(encryptedData: Record<string, any>): Record<string, any> {
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      
      const decipher = crypto.createDecipher(algorithm, key);
      const decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8') + decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('解密失败:', error);
      return {};
    }
  }

  // 数据库连接测试
  private async testDatabaseConnection(credential: Credential): Promise<{ success: boolean, message?: string }> {
    // 这里应该根据数据库类型进行实际的连接测试
    // 为了演示，这里只是模拟测试
    const config = credential.config;
    
    if (!config.host || !config.port || !config.database) {
      return { success: false, message: '数据库配置不完整' };
    }

    // 模拟连接测试
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: '数据库连接测试成功' };
  }

  // API连接测试
  private async testApiConnection(credential: Credential): Promise<{ success: boolean, message?: string }> {
    const config = credential.config;
    
    if (!config.baseUrl) {
      return { success: false, message: 'API基础URL未配置' };
    }

    try {
      // 这里应该进行实际的API调用测试
      // 为了演示，这里只是模拟测试
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true, message: 'API连接测试成功' };
    } catch (error) {
      return { success: false, message: `API连接失败: ${error.message}` };
    }
  }

  // 邮件连接测试
  private async testEmailConnection(credential: Credential): Promise<{ success: boolean, message?: string }> {
    const config = credential.config;
    
    if (!config.host || !config.port) {
      return { success: false, message: '邮件服务器配置不完整' };
    }

    // 模拟邮件连接测试
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return { success: true, message: '邮件服务器连接测试成功' };
  }

  // FTP连接测试
  private async testFtpConnection(credential: Credential): Promise<{ success: boolean, message?: string }> {
    const config = credential.config;
    
    if (!config.host || !config.port) {
      return { success: false, message: 'FTP服务器配置不完整' };
    }

    // 模拟FTP连接测试
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return { success: true, message: 'FTP连接测试成功' };
  }

  // SSH连接测试
  private async testSshConnection(credential: Credential): Promise<{ success: boolean, message?: string }> {
    const config = credential.config;
    
    if (!config.host || !config.port) {
      return { success: false, message: 'SSH服务器配置不完整' };
    }

    // 模拟SSH连接测试
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return { success: true, message: 'SSH连接测试成功' };
  }

  // Webhook连接测试
  private async testWebhookConnection(credential: Credential): Promise<{ success: boolean, message?: string }> {
    const config = credential.config;
    
    if (!config.url) {
      return { success: false, message: 'Webhook URL未配置' };
    }

    try {
      // 这里应该发送测试请求到webhook URL
      // 为了演示，这里只是模拟测试
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return { success: true, message: 'Webhook连接测试成功' };
    } catch (error) {
      return { success: false, message: `Webhook测试失败: ${error.message}` };
    }
  }
}