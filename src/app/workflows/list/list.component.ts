import { Component, Input } from '@angular/core';
import { CommunicatorService } from '../../shared/communicator.service';

import { ToolLister } from '../../shared/tool-lister';

import { ListService } from '../../shared/list.service';
import { ProviderService } from '../../shared/provider.service';

import { WorkflowObservableService } from '../../shared/workflow-observable.service';

@Component({
  selector: 'app-list-workflows',
  templateUrl: './list.component.html'
})
export class ListWorkflowsComponent extends ToolLister {
@Input() previewMode: boolean;
  // TODO: make an API endpoint to retrieve only the necessary properties for the workflows table
  // gitUrl

  constructor(private communicatorService: CommunicatorService,
              private workflowObjService: WorkflowObservableService,
              listService: ListService, providerService: ProviderService) {
    super(listService, providerService, 'workflows');
  }

  sendWorkflowInfo(workflow) {
    this.communicatorService.setWorkflow(workflow);
    this.workflowObjService.setWorkflow(workflow);
  }

  initToolLister(): void {
  }

}
