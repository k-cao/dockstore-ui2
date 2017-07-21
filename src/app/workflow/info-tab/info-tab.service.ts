import { RefreshService } from '../../shared/refresh.service';
/*
 *    Copyright 2017 OICR
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

import { ErrorService } from './../../shared/error.service';
import { StateService } from './../../shared/state.service';
import { Workflow } from './../../shared/swagger/model/workflow';
import { WorkflowsService } from './../../shared/swagger/api/workflows.service';
import { WorkflowService } from './../../shared/workflow.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';

@Injectable()
export class InfoTabService {
    public workflowPathEditing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public defaultTestFilePathEditing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private workflows: Workflow[];
    private workflow: Workflow;

    constructor(private workflowsService: WorkflowsService, private workflowService: WorkflowService, private stateService: StateService,
        private errorService: ErrorService, private refreshService: RefreshService) {
        this.workflowService.workflow$.subscribe(workflow => this.workflow = workflow);
        this.workflowService.workflows$.subscribe(workflows => this.workflows = workflows);
    }
    setWorkflowPathEditing(editing: boolean) {
        this.workflowPathEditing$.next(editing);
    }

    setDefaultTestFilePathEditing(editing: boolean) {
        this.defaultTestFilePathEditing$.next(editing);
    }

    updateAndRefresh(workflow: Workflow) {
        const message = 'Workflow Info';
        this.workflowsService.updateWorkflow(this.workflow.id, workflow).subscribe(response => {
            this.stateService.setRefreshMessage('Updating ' + message + '...');
            this.workflowsService.refresh(this.workflow.id).subscribe(refreshResponse => {
                this.workflowService.replaceWorkflow(this.workflows, refreshResponse);
                this.workflowService.setWorkflow(refreshResponse);
                this.refreshService.handleSuccess(message);
            }, error => this.refreshService.handleError(message, error));
        });
    }
}
