import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CredentialService } from './credential.service';
import { CreateCredentialDto, UpdateCredentialDto, TestCredentialDto } from './dto/credential.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('credentials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('credentials')
export class CredentialController {
  constructor(private readonly credentialService: CredentialService) {}

  @Post()
  @ApiOperation({ summary: '创建凭证' })
  @ApiResponse({ status: 201, description: '凭证创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  async create(@Body() createCredentialDto: CreateCredentialDto, @Request() req) {
    const credential = await this.credentialService.create(createCredentialDto, req.user.id);
    return {
      success: true,
      message: '凭证创建成功',
      data: credential
    };
  }

  @Get()
  @ApiOperation({ summary: '获取凭证列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Request() req
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    
    const result = await this.credentialService.findAll(req.user.id, pageNum, limitNum);
    
    return {
      success: true,
      message: '获取凭证列表成功',
      data: {
        credentials: result.credentials,
        pagination: {
          total: result.total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(result.total / limitNum)
        }
      }
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个凭证' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '凭证不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  async findOne(@Param('id') id: string, @Request() req) {
    const credential = await this.credentialService.findOne(id, req.user.id);
    return {
      success: true,
      message: '获取凭证成功',
      data: credential
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新凭证' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '凭证不存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  async update(
    @Param('id') id: string,
    @Body() updateCredentialDto: UpdateCredentialDto,
    @Request() req
  ) {
    const credential = await this.credentialService.update(id, updateCredentialDto, req.user.id);
    return {
      success: true,
      message: '凭证更新成功',
      data: credential
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除凭证' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '凭证不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Request() req) {
    await this.credentialService.remove(id, req.user.id);
    return {
      success: true,
      message: '凭证删除成功'
    };
  }

  @Post('test')
  @ApiOperation({ summary: '测试凭证连接' })
  @ApiResponse({ status: 200, description: '测试完成' })
  @ApiResponse({ status: 404, description: '凭证不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  async testConnection(@Body() testCredentialDto: TestCredentialDto, @Request() req) {
    const result = await this.credentialService.testConnection(testCredentialDto, req.user.id);
    return {
      success: result.success,
      message: result.success ? '连接测试成功' : '连接测试失败',
      data: {
        success: result.success,
        message: result.message,
        error: result.error
      }
    };
  }

  @Get(':id/test-status')
  @ApiOperation({ summary: '获取凭证测试状态' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '凭证不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getTestStatus(@Param('id') id: string, @Request() req) {
    const credential = await this.credentialService.findOne(id, req.user.id);
    return {
      success: true,
      message: '获取测试状态成功',
      data: {
        lastTestedAt: credential.lastTestedAt,
        testPassed: credential.testPassed,
        testError: credential.testError
      }
    };
  }
}