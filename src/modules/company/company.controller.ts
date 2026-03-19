import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto, UpdateCompanyDto, InitAdminDto } from './dto/company.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'admin')
export class CompanyController {
  constructor(private service: CompanyService) {}

  @Post()
  create(@Body() dto: CreateCompanyDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCompanyDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post(':id/init-admin')
  initAdmin(@Param('id', ParseIntPipe) id: number, @Body() dto: InitAdminDto) {
    return this.service.initAdmin(id, dto);
  }
}
