import { ActivatedRouteSnapshot } from '@angular/router';
import { LoggerService } from '../../services/logger.service';

export interface HandlerContext {
  route: ActivatedRouteSnapshot;
  logger: LoggerService;
}
