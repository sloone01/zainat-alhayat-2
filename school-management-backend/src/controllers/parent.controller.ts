import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import { ParentService } from '../services/parent.service';
import type { CreateParentDto, UpdateParentDto } from '../services/parent.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('parents')
@UseGuards(JwtAuthGuard)
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createParentDto: CreateParentDto) {
    try {
      const parent = await this.parentService.create(createParentDto);
      return {
        success: true,
        data: parent,
        message: 'Parent created successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get()
  async findAll() {
    try {
      const parents = await this.parentService.findAll();
      return {
        success: true,
        data: parents,
        count: parents.length
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get('search')
  async search(@Query('q') query: string) {
    try {
      if (!query) {
        return {
          success: false,
          message: 'Search query is required'
        };
      }

      const parents = await this.parentService.searchParents(query);
      return {
        success: true,
        data: parents,
        count: parents.length
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const parent = await this.parentService.findOne(id);
      return {
        success: true,
        data: parent
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateParentDto: UpdateParentDto) {
    try {
      const parent = await this.parentService.update(id, updateParentDto);
      return {
        success: true,
        data: parent,
        message: 'Parent updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Patch(':id/assign-student')
  async assignToStudent(@Param('id', ParseIntPipe) id: number, @Body('studentId') studentId: string) {
    try {
      const parent = await this.parentService.assignToStudent(id, studentId);
      return {
        success: true,
        data: parent,
        message: 'Parent assigned to student successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.parentService.remove(id);
      return {
        success: true,
        message: 'Parent deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }
}