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
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ga4ghPath, ga4ghWorkflowIdPrefix } from './constants';
import { DescriptorTypeCompatService } from './descriptor-type-compat.service';
import { Dockstore } from './dockstore.model';
import { SourceFile, Tag, ToolDescriptor, ToolFile, WorkflowVersion } from './swagger';

const wdlImportHttpRegEx: RegExp = new RegExp(/^\s*import\s+"?https?/, 'm');
const cwlImportHttpRegEx: RegExp = new RegExp(/^[^#]+((run)|(\$((import)|(include)|(mixin))))\s*:\s+\"?https?/, 'm');

@Injectable({ providedIn: 'root' })
export class FileService {
  constructor(private sanitizer: DomSanitizer, private descriptorTypeCompatService: DescriptorTypeCompatService) {}

  /**
   * Get the download path of a descriptor
   * TODO: Convert to pipe
   * @param {string} entryPath         the entry's path (e.g. "quay.io/pancancer/pcawg-dkfz-workflow")
   * @param {string} entryVersion      the version object of the entry
   * @param {string} sourceFile        the SourceFile object
   * @param {string} descriptorType    the descriptor type (e.g. "cwl")
   * @param {string} entryType         the entry type, either "tool" or "workflow"
   * @returns {string}                 the url to download the test parameter file
   * @memberof FileService
   */
  getDescriptorPath(
    entryPath: string,
    entryVersion: Tag | WorkflowVersion,
    sourceFile: SourceFile,
    descriptorType: ToolDescriptor.TypeEnum,
    entryType: string
  ): string {
    if (!entryPath || !entryVersion || !sourceFile || !descriptorType || !entryType) {
      return null;
    } else {
      const type = this.descriptorTypeCompatService.toolDescriptorTypeEnumToPlainTRS(descriptorType);
      if (type === null) {
        return null;
      }
      const id = entryType === 'workflow' ? ga4ghWorkflowIdPrefix + entryPath : entryPath;
      const versionId = entryVersion.name;
      const relativePath = sourceFile.path;
      return this.getDownloadFilePath(id, versionId, type, relativePath);
    }
  }

  /**
   * Given the TRS endpoint parameters, get the download file HREF
   *
   * @param {string} id  The TRS id
   * @param {string} versionId  The TRS version_id
   * @param {string} type  The TRS type
   * @param {string} relativePath  The TRS relative_path
   * @returns {(string | null)}   The url to download the file, null if something went wrong
   * @memberof FileService
   */
  public getDownloadFilePath(id: string, versionId: string, type: string, relativePath: string): string | null {
    if (!id || !versionId || !type || !relativePath) {
      console.error('One of the TRS endpoint parameters is not truthy');
      return null;
    }
    const basepath = Dockstore.API_URI + ga4ghPath + '/';
    // Encode the relativePath even though the webservice can handle it because the browser cannot handle '..'
    const urlStringSegments = ['tools', id, 'versions', versionId, type, 'descriptor', relativePath].map(urlStringSegment =>
      encodeURIComponent(urlStringSegment)
    );
    return basepath + urlStringSegments.join('/');
  }

  // Get the path of the file
  getFilePath(file: ToolFile): string {
    if (file != null) {
      return file.path;
    }
    return null;
  }

  /**
   * Constructing the custom download link involves setting 2 attributes ('href' and 'download')
   * This gets the 'href' attribute
   * @param {string} content  The file contents
   * @returns {SafeUrl}    What to set for the 'href' attribute
   * @memberof FileService
   */
  getFileData(content: string): SafeUrl {
    if (content) {
      return this.sanitizer.bypassSecurityTrustUrl('data:text/plain,' + encodeURIComponent(content));
    } else {
      return null;
    }
  }

  /**
   * Constructing the custom download link involves setting 2 attributes ('href' and 'download')
   * This gets the 'download' attribute
   * @param {string} path  Full path of the file
   * @returns {string}     What to set for the 'download' attribute
   * @memberof FileService
   */
  getFileName(path: string): string {
    if (path) {
      const splitFileName = path.split('/');
      const filename = splitFileName[splitFileName.length - 1];
      return filename;
    } else {
      return null;
    }
  }

  hasHttpImport(sourceFile: SourceFile): boolean {
    if (sourceFile) {
      if (sourceFile.type === SourceFile.TypeEnum.DOCKSTOREWDL) {
        return wdlImportHttpRegEx.test(sourceFile.content);
      } else if (sourceFile.type === SourceFile.TypeEnum.DOCKSTORECWL) {
        return cwlImportHttpRegEx.test(sourceFile.content);
      }
    }
    return false;
  }
}
