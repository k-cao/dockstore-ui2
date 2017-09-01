import { updatedWorkflow } from './../../test/mocked-objects';
import { WorkflowVersion } from './../../shared/swagger/model/workflowVersion';
import { WorkflowsService } from './../../shared/swagger/api/workflows.service';
import { WorkflowService } from './../../shared/workflow.service';
import { DateService } from './../../shared/date.service';
import { DateStubService, DockstoreStubService, WorkflowStubService, WorkflowsStubService } from './../../test/service-stubs';
import { DockstoreService } from './../../shared/dockstore.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionsWorkflowComponent } from './versions.component';

describe('VersionsWorkflowComponent', () => {
  let component: VersionsWorkflowComponent;
  let fixture: ComponentFixture<VersionsWorkflowComponent>;
  let workflowService: WorkflowService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VersionsWorkflowComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [DockstoreService,
        { provide: DateService, useClass: DateStubService},
        { provide: WorkflowService, useClass: WorkflowStubService},
        { provide: WorkflowsService, useClass: WorkflowsStubService}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionsWorkflowComponent);
    component = fixture.componentInstance;
    component.versions = [];
    fixture.detectChanges();
    workflowService = fixture.debugElement.injector.get(WorkflowService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should update default version and then set current workflow based on response', () => {
    const workflowVersion: WorkflowVersion = {id: 5, reference: 'stuff', name: 'name'};
    component.updateDefaultVersion('name');
    fixture.detectChanges();
    workflowService.workflow$.subscribe(workflow => expect(workflow).toEqual(updatedWorkflow));
  });

  it('should get verified source', () => {
    const source1 = {version: '1', verifiedSource: 'a'};
    const source2 = {version: '2', verifiedSource: 'b'};
    const source3 = {version: '3', verifiedSource: 'c'};
    component.verifiedSource = [source1, source2, source3];
    fixture.detectChanges();
    console.log(component.verifiedSource);
    expect(component.getVerifiedSource('1')).toEqual('a');
    expect(component.getVerifiedSource('2')).toEqual('b');
    expect(component.getVerifiedSource('3')).toEqual('c');
    expect(component.getVerifiedSource('4')).toEqual('');
  });
});
