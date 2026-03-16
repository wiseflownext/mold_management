import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MoldService } from './mold.service';
import { CreateMoldDto, UpdateMoldDto, UpdateDesignLifeDto, QueryMoldDto, CreateProductDto } from './dto/mold.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditLogService } from '../audit-log/audit-log.service';

@Controller('molds')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MoldController {
  constructor(private moldService: MoldService, private audit: AuditLogService) {}

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateMoldDto, @CurrentUser() user: any, @Req() req: any) {
    const mold = await this.moldService.create(dto);
    this.audit.log({ userId: user.id, userName: user.name, action: 'CREATE', targetType: 'mold', targetId: mold.id, detail: `新增模具 ${dto.moldNumber}`, ip: req.ip }).catch(() => {});
    return mold;
  }

  @Get()
  findAll(@Query() query: QueryMoldDto) {
    return this.moldService.findAll(query);
  }

  @Get('statistics')
  getStatistics() {
    return this.moldService.getStatistics();
  }

  @Get('today-summary')
  getTodaySummary() {
    return this.moldService.getTodaySummary();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.moldService.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMoldDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const result = await this.moldService.update(id, dto);
    if (dto.status) {
      this.audit.log({ userId: user.id, userName: user.name, action: 'STATUS_CHANGE', targetType: 'mold', targetId: id, detail: `状态变更为 ${dto.status}`, ip: req.ip });
    } else {
      this.audit.log({ userId: user.id, userName: user.name, action: 'UPDATE', targetType: 'mold', targetId: id, detail: `编辑模具信息`, ip: req.ip }).catch(() => {});
    }
    return result;
  }

  @Put(':id/design-life')
  @Roles('admin')
  updateDesignLife(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDesignLifeDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.moldService.updateDesignLife(id, dto, userId);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Req() req: any) {
    const mold = await this.moldService.findOne(id);
    await this.moldService.remove(id);
    this.audit.log({ userId: user.id, userName: user.name, action: 'DELETE', targetType: 'mold', targetId: id, detail: `删除模具 ${mold.moldNumber}`, ip: req.ip });
  }

  @Post(':id/products')
  @Roles('admin')
  addProduct(@Param('id', ParseIntPipe) id: number, @Body() data: CreateProductDto) {
    return this.moldService.addProduct(id, data);
  }

  @Put('products/:productId')
  @Roles('admin')
  updateProduct(@Param('productId', ParseIntPipe) productId: number, @Body() data: CreateProductDto) {
    return this.moldService.updateProduct(productId, data);
  }

  @Delete('products/:productId')
  @Roles('admin')
  removeProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.moldService.removeProduct(productId);
  }
}
