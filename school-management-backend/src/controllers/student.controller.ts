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
import { StudentService } from '../services/student.service';
import type { CreateStudentDto, UpdateStudentDto } from '../services/student.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createStudentDto: CreateStudentDto) {
    try {
      const student = await this.studentService.create(createStudentDto);
      return {
        success: true,
        data: student,
        message: 'Student created successfully'
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
      const students = await this.studentService.findAll();
      return {
        success: true,
        data: students,
        count: students.length
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

      const students = await this.studentService.searchStudents(query);
      return {
        success: true,
        data: students,
        count: students.length
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get('group/:groupId')
  async findByGroup(@Param('groupId') groupId: string) {
    try {
      const students = await this.studentService.findByGroup(groupId);
      return {
        success: true,
        data: students,
        count: students.length
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get('parent/:parentId')
  async findByParent(@Param('parentId', ParseIntPipe) parentId: number) {
    try {
      const students = await this.studentService.findByParent(parentId);
      return {
        success: true,
        data: students,
        count: students.length
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
  async findOne(@Param('id') id: string) {
    try {
      const student = await this.studentService.findOne(id);
      return {
        success: true,
        data: student
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get(':id/progress')
  async getProgress(@Param('id') id: string) {
    try {
      const studentProgress = await this.studentService.getStudentProgress(id);
      return {
        success: true,
        data: studentProgress
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
  async update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    try {
      const student = await this.studentService.update(id, updateStudentDto);
      return {
        success: true,
        data: student,
        message: 'Student updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Patch(':id/assign-group')
  async assignToGroup(@Param('id') id: string, @Body('groupId') groupId: string) {
    try {
      const student = await this.studentService.assignToGroup(id, groupId);
      return {
        success: true,
        data: student,
        message: 'Student assigned to group successfully'
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
  async remove(@Param('id') id: string) {
    try {
      await this.studentService.remove(id);
      return {
        success: true,
        message: 'Student deleted successfully'
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

