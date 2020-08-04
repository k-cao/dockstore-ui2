import { Injectable } from '@angular/core';
import { DescriptorTypeCompatService } from 'app/shared/descriptor-type-compat.service';
import { FileService } from 'app/shared/file.service';
import { SourceFile, ToolDescriptor, WorkflowsService } from 'app/shared/openapi';
import { Observable } from 'rxjs';
import { ga4ghWorkflowIdPrefix } from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class SourceFileTabsService {
  constructor(
    private workflowsService: WorkflowsService,
    private fileService: FileService,
    private descriptorTypeCompatService: DescriptorTypeCompatService
  ) {}

  /**
   * Retrieve all source files for the given workflow version
   * @param workflowId
   * @param versionId
   */
  getSourceFiles(workflowId: number, versionId: number): Observable<SourceFile[]> {
    return this.workflowsService.getWorkflowVersionsSourcefiles(workflowId, versionId);
  }

  /**
   * Return a set of file types for the given file set
   * @param files
   */
  getFileTypes(files: SourceFile[]): SourceFile.TypeEnum[] {
    const fileTypes: Array<SourceFile.TypeEnum> = [];
    files.forEach((file: SourceFile) => {
      if (!fileTypes.includes(file.type)) {
        fileTypes.push(file.type);
      }
    });
    // Push /dockstore.yml configuration files to the end
    let ymlIndex = fileTypes.indexOf(SourceFile.TypeEnum.DOCKSTOREYML);
    if (ymlIndex >= 0) {
      fileTypes.splice(ymlIndex, 1);
      fileTypes.push(SourceFile.TypeEnum.DOCKSTOREYML);
    }

    ymlIndex = fileTypes.indexOf(SourceFile.TypeEnum.DOCKSTORESERVICEYML);
    if (ymlIndex >= 0) {
      fileTypes.splice(ymlIndex, 1);
      fileTypes.push(SourceFile.TypeEnum.DOCKSTORESERVICEYML);
    }
    return fileTypes;
  }

  /**
   * Retrieve download path for a sourcefile
   * @param descriptorType
   * @param filePath
   * @param versionName
   */
  getDescriptorPath(descriptorType: ToolDescriptor.TypeEnum, filePath: string, versionName: string): string {
    const type = this.descriptorTypeCompatService.toolDescriptorTypeEnumToPlainTRS(descriptorType);
    if (type === null) {
      return null;
    }
    const id = ga4ghWorkflowIdPrefix + filePath;
    return this.fileService.getDownloadFilePath(id, versionName, type, filePath);
  }
}
