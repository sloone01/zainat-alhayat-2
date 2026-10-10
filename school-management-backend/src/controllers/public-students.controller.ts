import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { StudentService } from '../services/student.service';

@Public()
@Controller('public/students')
export class PublicStudentsController {
  constructor(private readonly studentService: StudentService) {}

  @Get('lookup')
  async lookupByCivilId(
    @Query('civil_id') civilId?: string,
    @Query('school_id') schoolId?: string,
  ) {
    if (!civilId?.trim()) {
      throw new BadRequestException('civil_id is required');
    }
    if (!schoolId?.trim()) {
      throw new BadRequestException('school_id is required');
    }
    const data = await this.studentService.lookupByCivilId(civilId, {
      schoolId: schoolId.trim(),
      publicMode: true,
    });
    return { success: true, data };
  }
}
