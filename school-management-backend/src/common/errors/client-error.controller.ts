import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { Public } from '../../auth/public.decorator';
import { ErrorTicketService } from './error-ticket.service';
import { ReportClientErrorDto } from './report-client-error.dto';

type RequestUser = {
  id?: number | string;
  sub?: number | string;
  school_id?: number | string | null;
  schoolId?: number | string | null;
};

@Controller('errors')
export class ClientErrorController {
  constructor(private readonly errorTickets: ErrorTicketService) {}

  /**
   * SPA / browser crash reports. Public so login/enrollment failures can report too.
   * Auth is optional — when a JWT is present, user/school are attached to the ticket.
   */
  @Public()
  @Post('report')
  report(
    @Body() body: ReportClientErrorDto,
    @Req() req: Request & { user?: RequestUser; requestId?: string },
  ) {
    const user = req.user;
    const message = (body.message || 'Client error').trim().slice(0, 2000);
    const stack = body.stack?.slice(0, 20000);
    const url = body.url?.slice(0, 2000);
    const component = body.component?.slice(0, 200);

    const ticket = this.errorTickets.open({
      source: 'client',
      message,
      stack,
      path: url,
      url,
      userId:
        user?.id ??
        user?.sub ??
        (body.extra?.user as { id?: number | string } | undefined)?.id ??
        null,
      schoolId:
        user?.school_id ??
        user?.schoolId ??
        (body.extra?.user as { school_id?: number | string } | undefined)?.school_id ??
        null,
      requestId: req.requestId,
      userAgent: body.userAgent || req.headers['user-agent'],
      component,
      extra: body.extra,
    });

    return {
      success: true,
      data: { received: true, ticket },
      message: 'Error report received',
    };
  }
}
