/*
 *    Copyright 2017 OICR
 *
 *    Licensed under the Apache License, Version 2.0 (the 'License');
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an 'AS IS' BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */
import { Component, ElementRef, HostListener, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { filterNil } from '@datorama/akita';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Dockstore } from '../../shared/dockstore.model';
import { EntryTab } from '../../shared/entry/entry-tab';
import { WorkflowQuery } from '../../shared/state/workflow.query';
import { Workflow } from './../../shared/swagger/model/workflow';
import { WorkflowVersion } from './../../shared/swagger/model/workflowVersion';
import { DagQuery } from './state/dag.query';
import { DagService } from './state/dag.service';
import { DagStore } from './state/dag.store';

@Component({
  selector: 'app-dag',
  templateUrl: './dag.component.html',
  styleUrls: ['./dag.component.scss'],
  providers: [DagStore, DagQuery, DagService]
})
export class DagComponent extends EntryTab implements OnInit, OnChanges {
  @Input() validVersions: Array<WorkflowVersion>;
  @Input() defaultVersion: WorkflowVersion;
  @Input() id: number;
  @Input() selectedVersion: WorkflowVersion;

  @ViewChild('exportLink') exportLink: ElementRef;
  @ViewChild('cy') cyElement: ElementRef;

  public dagResult$: Observable<any>;
  private cy: any;
  public expanded: Boolean = false;

  public workflow$: Observable<Workflow>;
  public missingTool$: Observable<boolean>;
  public dagType: 'classic' | 'cwlviewer' = 'classic';
  public enableCwlViewer = Dockstore.FEATURES.enableCwlViewer;
  public refreshCounter = 1;

  @HostListener('window:keyup.escape', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.expanded) {
      this.expanded = false;
      this.refreshDocument(this.cy);
    }
  }

  reset() {
    this.refreshCounter++;
    this.refreshDocument(this.cy);
  }

  constructor(private dagService: DagService, private workflowQuery: WorkflowQuery, private dagQuery: DagQuery) {
    super();
  }

  /**
   * For some reason the cy element is not guaranteed to be visible and ready when ngAfterViewinit is called.
   * Using window.requestAnimationFrame() to wait for the element to be visible before subscribing to dagResult$
   * In practice, the wait lasts around 181ms and recursively calls step once
   *
   * @memberof DagComponent
   */
  refreshDocument(cy: any) {
    const self = this;
    function step() {
      if (self.cyElement) {
        self.cy = self.dagService.refreshDocument(cy, self.cyElement.nativeElement);
      } else {
        window.requestAnimationFrame(step);
      }
    }
    window.requestAnimationFrame(step);
  }

  toggleExpand() {
    this.expanded = !this.expanded;
    this.refreshDocument(this.cy);
  }

  ngOnInit() {
    this.dagResult$ = this.dagQuery.dagResults$;
    this.workflow$ = this.workflowQuery.workflow$;
    this.missingTool$ = this.dagQuery.missingTool$;
    this.dagResult$.pipe(filterNil, takeUntil(this.ngUnsubscribe)).subscribe(dagResults => {
      this.refreshDocument(this.cy);
    }, error => console.error('Something went terribly wrong with dagResult$'));
  }

  ngOnChanges() {
    this.dagService.getDAGResults(this.selectedVersion, this.id);
  }

  download() {
    this.dagService.download(this.cy, this.selectedVersion.name, this.exportLink);
  }
}
