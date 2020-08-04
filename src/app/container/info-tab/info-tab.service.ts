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
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertService } from '../../shared/alert/state/alert.service';
import { Base } from '../../shared/base';
import { ContainerService } from '../../shared/container.service';
import { ExtendedDockstoreToolQuery } from '../../shared/extended-dockstoreTool/extended-dockstoreTool.query';
import { ExtendedDockstoreTool } from '../../shared/models/ExtendedDockstoreTool';
import { ContainersService } from '../../shared/swagger/api/containers.service';
import { DockstoreTool } from '../../shared/swagger/model/dockstoreTool';

@Injectable()
export class InfoTabService extends Base {
  public dockerFileEditing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public cwlPathEditing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public wdlPathEditing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public cwlTestPathEditing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public wdlTestPathEditing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private tools: DockstoreTool[];

  /**
   * The original tool that should be in sync with the database
   *
   * @private
   * @type {ExtendedDockstoreTool}
   * @memberof InfoTabService
   */
  private originalTool: ExtendedDockstoreTool;

  /**
   * The tool with info that may have been modified but not saved
   *
   * @private
   * @type {ExtendedDockstoreTool}
   * @memberof InfoTabService
   */
  private currentTool: ExtendedDockstoreTool;
  constructor(
    private containersService: ContainersService,
    private alertService: AlertService,
    private containerService: ContainerService,
    private extendedDockstoreToolQuery: ExtendedDockstoreToolQuery
  ) {
    super();
    this.extendedDockstoreToolQuery.extendedDockstoreTool$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((extendedDockstoreTool: ExtendedDockstoreTool) => {
        if (extendedDockstoreTool) {
          this.tool = extendedDockstoreTool;
          this.cancelEditing();
        }
      });
    this.containerService.tools$.subscribe(tools => (this.tools = tools));
  }
  setDockerFileEditing(editing: boolean) {
    this.dockerFileEditing$.next(editing);
  }

  setCWLPathEditing(editing: boolean) {
    this.cwlPathEditing$.next(editing);
  }

  setWDLPathEditing(editing: boolean) {
    this.wdlPathEditing$.next(editing);
  }

  setCWLTestPathEditing(editing: boolean) {
    this.cwlTestPathEditing$.next(editing);
  }

  setWDLTestPathEditing(editing: boolean) {
    this.wdlTestPathEditing$.next(editing);
  }

  updateAndRefresh(tool: ExtendedDockstoreTool) {
    const message = 'Tool Info';
    const partialTool = this.getPartialToolForUpdate(tool);
    this.alertService.start('Updating ' + message);
    this.containersService.updateContainer(this.tool.id, partialTool).subscribe(
      response => {
        this.alertService.start('Refreshing ' + message);
        this.containersService.refresh(this.tool.id).subscribe(
          refreshResponse => {
            this.containerService.replaceTool(refreshResponse);
            this.containerService.setTool(refreshResponse);
            this.alertService.detailedSuccess();
          },
          error => {
            this.alertService.detailedError(error);
            this.restoreTool();
          }
        );
      },
      error => {
        this.alertService.detailedError(error);
        this.restoreTool();
      }
    );
  }

  /**
   * PUT /containers/{containerId} only allows the updating of selected properties.
   * Sending back only the ones relevant.
   * Additionally, the webservice does not appear to understand starredUsers which causes an error.
   */
  private getPartialToolForUpdate(tool: ExtendedDockstoreTool): DockstoreTool {
    const partialTool: DockstoreTool = {
      gitUrl: tool.gitUrl,
      mode: tool.mode,
      name: tool.name,
      private_access: tool.private_access,
      namespace: tool.namespace,
      registry_string: tool.registry_string,
      tool_maintainer_email: tool.tool_maintainer_email,
      defaultVersion: tool.defaultVersion,
      default_cwl_path: tool.default_cwl_path,
      default_wdl_path: tool.default_wdl_path,
      defaultCWLTestParameterFile: tool.defaultCWLTestParameterFile,
      defaultWDLTestParameterFile: tool.defaultWDLTestParameterFile,
      default_dockerfile_path: tool.default_dockerfile_path
    };
    return partialTool;
  }

  get tool(): ExtendedDockstoreTool {
    return this.currentTool;
  }

  set tool(tool: ExtendedDockstoreTool) {
    this.originalTool = tool;
    this.currentTool = Object.assign({}, tool);
  }

  /**
   * Cancels editing for all editable fields
   *
   * @memberof InfoTabService
   */
  cancelEditing(): void {
    this.dockerFileEditing$.next(false);
    this.cwlPathEditing$.next(false);
    this.wdlPathEditing$.next(false);
    this.wdlTestPathEditing$.next(false);
    this.cwlTestPathEditing$.next(false);
    this.restoreTool();
  }

  /**
   * Reverts the tool info back to the original
   *
   * @memberof InfoTabService
   */
  restoreTool(): void {
    this.tool = this.originalTool;
  }

  /**
   * Saves the current workflow into the workflow variable
   *
   * @memberof InfoTabService
   */
  saveTool(): void {
    this.tool = this.currentTool;
  }
}
