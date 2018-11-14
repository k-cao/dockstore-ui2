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
import { SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';

import { ga4ghWorkflowIdPrefix } from '../constants';
import { GA4GHFilesStateService } from '../entry/GA4GHFiles.state.service';
import { FileService } from '../file.service';
import { FileWrapper, GA4GHService } from '../swagger';

/**
* Abstract class to be implemented by components that have select boxes for a given entry and version
*/
export abstract class EntryFileSelector {
  _selectedVersion: any;

  protected currentDescriptor;
  protected descriptors: Array<any>;
  protected validDescriptors: Array<any>;
  public nullDescriptors: boolean;
  public filePath: string;
  public currentFile;
  public files: Array<any>;
  public published$: Observable<boolean>;
  public downloadFilePath: string;
  public customDownloadHREF: SafeUrl;
  public customDownloadPath: string;
  public validationMessage = null;
  abstract entrypath: string;
  protected abstract entryType: ('tool' | 'workflow');
  content: string = null;

  abstract getDescriptors(version): Array<any>;
  abstract getValidDescriptors(version): Array<any>;
  abstract getFiles(descriptor): Observable<any>;

  constructor(protected fileService: FileService, protected gA4GHFilesStateService: GA4GHFilesStateService,
    protected gA4GHService: GA4GHService) {
  }

  protected getDescriptorPath(path: string, entryType: ('tool' | 'workflow')): string {
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

  onDescriptorChange(descriptor) {
    this.currentDescriptor = descriptor;
    this.reactToDescriptor();
  }

  reactToDescriptor() {
    this.getFiles(this.currentDescriptor)
      .subscribe(files => {
        this.files = files;
        if (this.files.length) {
          this.onFileChange(this.files[0]);
        } else {
          this.currentFile = null;
          this.content = null;
        }}
      );
  }

  onFileChange(file) {
    if (this.currentFile !== file) {
      this.currentFile = file;
      this.reactToFile();
    }
  }

  onVersionChange(value) {
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
    this.gA4GHFilesStateService.injectAuthorizationToken(this.gA4GHService);
    // TODO: Memoize this
    this.gA4GHService.toolsIdVersionsVersionIdTypeDescriptorRelativePathGet(this.currentDescriptor,
      this.entryType === 'workflow' ? ga4ghWorkflowIdPrefix + this.entrypath : this.entrypath,
      this._selectedVersion.name, this.currentFile.path).subscribe((file: FileWrapper) => {
        this.content = file.content;
        this.downloadFilePath = this.getDescriptorPath(this.entrypath, this.entryType);
        this.filePath = this.fileService.getFilePath(this.currentFile);
        this.updateCustomDownloadFileButtonAttributes();
      });
  }

  checkIfValid(isDescriptor: boolean, version: any): void {
    let fileEnum = null;
    if (this.currentDescriptor === 'cwl') {
      if (isDescriptor) {
        fileEnum = 'DOCKSTORE_CWL';
      } else {
        fileEnum = 'CWL_TEST_JSON';
      }
    } else if (this.currentDescriptor === 'wdl') {
      if (isDescriptor) {
        fileEnum = 'DOCKSTORE_CWL';
      } else {
        fileEnum = 'CWL_TEST_JSON';
      }
    }
    if (version) {
      for (const validation of version.validations) {
        if (validation.type === fileEnum) {
          this.validationMessage = validation.message;
          break;
        }
      }
    }
  }
}
