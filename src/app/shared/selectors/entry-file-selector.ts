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
import { OnDestroy } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { FilesQuery } from '../../workflow/files/state/files.query';
import { FilesService } from '../../workflow/files/state/files.service';
import { ga4ghWorkflowIdPrefix } from '../constants';
import { FileService } from '../file.service';
import { GA4GHFilesService } from '../ga4gh-files/ga4gh-files.service';
import { FileWrapper, GA4GHService, SourceFile, Tag, ToolDescriptor, ToolFile, WorkflowVersion } from '../swagger';

/**
 * Abstract class to be implemented by components that have select boxes for a given entry and version
 */
export abstract class EntryFileSelector implements OnDestroy {
  _selectedVersion: any;

  private ngUnsubscribe: Subject<{}> = new Subject();
  protected currentDescriptor: ToolDescriptor.TypeEnum;
  protected descriptors: Array<any>;
  protected validDescriptors: Array<any>;
  public nullDescriptors = false;
  public filePath: string;
  public currentFile: any;
  public files: Array<ToolFile>;
  public published$: Observable<boolean>;
  public downloadFilePath: string;
  public customDownloadHREF: SafeUrl;
  public customDownloadPath: string;
  public loading = false;
  public validationMessage = null;
  abstract entrypath: string;
  protected abstract entryType: 'tool' | 'workflow';
  content: string = null;

  abstract getDescriptors(version): Array<any>;
  abstract getValidDescriptors(version): Array<any>;
  abstract getFiles(descriptor: ToolDescriptor.TypeEnum): Observable<any>;

  constructor(
    protected fileService: FileService,
    protected gA4GHFilesService: GA4GHFilesService,
    protected gA4GHService: GA4GHService,
    protected filesService: FilesService,
    protected filesQuery: FilesQuery
  ) {}

  protected getDescriptorPath(path: string, entryType: 'tool' | 'workflow'): string {
    return this.fileService.getDescriptorPath(path, this._selectedVersion, this.currentFile, this.currentDescriptor, entryType);
  }

  reactToVersion(): void {
    this.descriptors = this.getDescriptors(this._selectedVersion);
    this.validDescriptors = this.getValidDescriptors(this._selectedVersion);
    if (this.descriptors) {
      this.nullDescriptors = false;
      if (this.descriptors.length) {
        if (this.validDescriptors && this.validDescriptors.length) {
          this.onDescriptorChange(this.validDescriptors[0]);
        } else {
          this.onDescriptorChange(this.descriptors[0]);
        }
      }
    } else {
      this.nullDescriptors = true;
    }
  }

  onDescriptorChange(descriptor: ToolDescriptor.TypeEnum) {
    this.currentDescriptor = descriptor;
    this.reactToDescriptor();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  reactToDescriptor() {
    this.getFiles(this.currentDescriptor)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(files => {
        this.nullDescriptors = false;
        this.files = files;
        if (!this.files) {
          this.nullDescriptors = true;
        } else if (this.files.length) {
          this.onFileChange(this.files[0]);
        } else {
          this.currentFile = null;
          this.content = null;
        }
      });
  }

  onFileChange(file: ToolFile) {
    if (this.currentFile !== file) {
      this.currentFile = file;
      this.reactToFile();
    }
  }

  onVersionChange(value: Tag) {
    this._selectedVersion = value;
    this.reactToVersion();
  }

  clearContent() {
    this.content = null;
  }

  /**
   * Update the custom download button attributes ('href' and 'download')
   *
   * @memberof EntryFileSelector
   */
  updateCustomDownloadFileButtonAttributes(): void {
    this.customDownloadHREF = this.fileService.getFileData(this.content);
    this.customDownloadPath = this.fileService.getFileName(this.filePath);
  }

  /**
   * Get the file using the descriptor/{relative-path} endpoint
   *
   * @memberof EntryFileSelector
   */
  reactToFile(): void {
    if (this._selectedVersion.valid) {
      this.loading = true;
    }
    this.gA4GHFilesService.injectAuthorizationToken(this.gA4GHService);
    const existingFileWrapper = this.filesQuery.getEntity(this.currentFile.path);
    if (existingFileWrapper) {
      this.loading = false;
      this.content = existingFileWrapper.content;
      this.downloadFilePath = this.getDescriptorPath(this.entrypath, this.entryType);
      this.filePath = this.fileService.getFilePath(this.currentFile);
      this.updateCustomDownloadFileButtonAttributes();
    } else {
      this.gA4GHService
        .toolsIdVersionsVersionIdTypeDescriptorRelativePathGet(
          this.currentDescriptor,
          this.entryType === 'workflow' ? ga4ghWorkflowIdPrefix + this.entrypath : this.entrypath,
          this._selectedVersion.name,
          this.currentFile.path
        )
        .pipe(finalize(() => (this.loading = false)))
        .subscribe((file: FileWrapper) => {
          this.filesService.update(this.currentFile.path, file);
          this.content = file.content;
          this.downloadFilePath = this.getDescriptorPath(this.entrypath, this.entryType);
          this.filePath = this.fileService.getFilePath(this.currentFile);
          this.updateCustomDownloadFileButtonAttributes();
        });
    }
  }

  /**
   * Retrieve the correct validation messages
   * @param isDescriptor Yes if looking at descriptor, false otherwise (test params)
   * @param version The version of interest
   */
  checkIfValid(isDescriptor: boolean, version: WorkflowVersion | Tag): void {
    let fileEnum = null;
    if (this.currentDescriptor === ToolDescriptor.TypeEnum.CWL) {
      if (isDescriptor) {
        fileEnum = 'DOCKSTORE_CWL';
      } else {
        fileEnum = 'CWL_TEST_JSON';
      }
    } else if (this.currentDescriptor === ToolDescriptor.TypeEnum.WDL) {
      if (isDescriptor) {
        fileEnum = 'DOCKSTORE_WDL';
      } else {
        fileEnum = 'WDL_TEST_JSON';
      }
    } else if (this.currentDescriptor === ToolDescriptor.TypeEnum.NFL) {
      if (isDescriptor) {
        fileEnum = 'NEXTFLOW_CONFIG';
      }
    }
    if (fileEnum && version && version.validations) {
      for (const validation of version.validations) {
        if (validation.type === fileEnum) {
          const validationObject = JSON.parse(validation.message);

          if (validationObject && Object.keys(validationObject).length === 0 && validationObject.constructor === Object) {
            this.validationMessage = null;
          } else {
            this.validationMessage = validationObject;
          }
          break;
        }
      }
    }
  }
}
