import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ID } from '@datorama/akita';
import { finalize } from 'rxjs/operators';
import { ToolTesterService } from '../openapi/api/toolTester.service';
import { ToolTesterLog } from '../openapi/model/toolTesterLog';
import { AvailableLogsStore } from './available-logs.store';

@Injectable({ providedIn: 'root' })
export class AvailableLogsService {

  constructor(private availableLogsStore: AvailableLogsStore,
    private toolTesterService: ToolTesterService) {
  }

  get(toolId: string, toolVersionName: string) {
    this.availableLogsStore.setLoading(true);
    this.availableLogsStore.remove();
    this.toolTesterService.search(toolId, toolVersionName).pipe(
      finalize(() => this.availableLogsStore.setLoading(false))).subscribe((entities) => {
        let id = 0;
        entities.forEach(entity => {
          this.availableLogsStore.createOrReplace(id, entity);
          id = id + 1;
        });
        this.availableLogsStore.setLoading(false);
      }, (error: HttpErrorResponse) => {
        // Silently fail (simply no logs will be displayed, Dockstore logging will know it has failed)
        console.error(error);
      });
  }

  add(availableLog: ToolTesterLog) {
    this.availableLogsStore.add(availableLog);
  }

  update(id, availableLog: Partial<ToolTesterLog>) {
    this.availableLogsStore.update(id, availableLog);
  }

  remove(id: ID) {
    this.availableLogsStore.remove(id);
  }
}
