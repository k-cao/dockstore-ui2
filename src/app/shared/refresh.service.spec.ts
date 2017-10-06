import { Workflow } from './swagger/model/workflow';
import { DockstoreTool } from './swagger/model/dockstoreTool';
import { UsersService } from './swagger/api/users.service';
import { WorkflowService } from './workflow.service';
import { ContainerService } from './container.service';
import { WorkflowsService } from './swagger/api/workflows.service';
import { ErrorService } from './../container/error.service';
import { ContainersService } from './swagger/api/containers.service';
import { ContainersStubService, StateStubService, ErrorStubService, WorkflowsStubService,
    ContainerStubService, WorkflowStubService, UsersStubService } from './../test/service-stubs';
import { StateService } from './state.service';
import { RefreshService } from './refresh.service';
import { ImageProviderService } from './image-provider.service';
import { TestBed, inject } from '@angular/core/testing';

describe('RefreshService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [RefreshService, StateService,
                { provide: ContainersService, useClass: ContainersStubService },
                { provide: ErrorService, useClass: ErrorStubService },
                { provide: WorkflowsService, useClass: WorkflowsStubService },
                { provide: ContainerService, useClass: ContainerStubService },
                { provide: WorkflowService, useClass: WorkflowStubService },
                { provide: UsersService, useClass: UsersStubService }
            ]
        });
    });

    it('should be created', inject([RefreshService], (service: RefreshService) => {
        expect(service).toBeTruthy();
    }));

    it('should refresh tool', inject([RefreshService, StateService, ContainerService],
        (service: RefreshService, stateService: StateService, containerService: ContainerService) => {
            const refreshedTool: DockstoreTool = {
                default_cwl_path: 'refreshedDefaultCWLPath',
                default_dockerfile_path: 'refreshedDefaultDockerfilePath',
                default_wdl_path: 'refreshedDefaultWDLPath',
                gitUrl: 'refreshedGitUrl',
                mode: DockstoreTool.ModeEnum.AUTODETECTQUAYTAGSAUTOMATEDBUILDS,
                name: 'refreshedName',
                namespace: 'refreshedNamespace',
                private_access: false,
                registry: DockstoreTool.RegistryEnum.QUAYIO,
                toolname: 'refreshedToolname'
            };
        service.refreshTool();
        stateService.refreshMessage$.subscribe(refreshing => {
            expect(refreshing).toBeFalsy();
        });
        containerService.tool$.subscribe(tool => {
            expect(tool).toEqual(refreshedTool);
        });
    }));
    it('should refresh workflow', inject([RefreshService, StateService, WorkflowService],
        (service: RefreshService, stateService: StateService, workflowService: WorkflowService) => {
            const refreshedWorkflow: Workflow = {
                'descriptorType': 'cwl',
                'gitUrl': 'refreshedGitUrl',
                'mode': Workflow.ModeEnum.FULL,
                'organization': 'refreshedOrganization',
                'repository': 'refreshedRepository',
                'workflow_path': 'refreshedWorkflowPath',
                'workflowVersions': []
            };
        service.refreshWorkflow();
        stateService.refreshMessage$.subscribe(refreshing => {
            expect(refreshing).toBeFalsy();
        });
        workflowService.workflow$.subscribe(workflow => {
            expect(workflow).toEqual(refreshedWorkflow);
        });
    }));
    it('should refresh all tools', inject([RefreshService, ContainerService],
        (service: RefreshService, containerService: ContainerService) => {
        service.refreshAllTools(0);
        containerService.tools$.subscribe(tools => {
            expect(tools).toEqual([]);
        });
    }));
    it('should refresh all workflows', inject([RefreshService, WorkflowService],
        (service: RefreshService, workflowService: WorkflowService) => {
        service.refreshAllWorkflows(0);
        workflowService.workflows$.subscribe(workflow => expect(workflow).toEqual([]));

    }));
});
