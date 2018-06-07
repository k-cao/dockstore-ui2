import { Component, Input } from '@angular/core';
import { Files } from '../../shared/files';
import { WorkflowVersion } from './../../shared/swagger/model/workflowVersion';
import { HostedService } from './../../shared/swagger/api/hosted.service';
import { WorkflowService } from './../../shared/workflow.service';
import { RefreshService } from './../../shared/refresh.service';

@Component({
  selector: 'app-workflow-file-editor',
  templateUrl: './workflow-file-editor.component.html',
  styleUrls: ['./workflow-file-editor.component.scss']
})
export class WorkflowFileEditorComponent extends Files {
  descriptorFiles = [];
  testParameterFiles = [];
  originalSourceFiles = [];
  _selectedVersion: WorkflowVersion;
  @Input() descriptorType: string;
  @Input() set selectedVersion(value: WorkflowVersion) {
    this._selectedVersion = value;
    if (value != null) {
      this.originalSourceFiles =  jQuery.extend(true, [], value.sourceFiles);
      this.loadVersionSourcefiles();
    }
  }
  constructor(private hostedService: HostedService, private workflowService: WorkflowService, private refreshService: RefreshService) {
    super();
  }

  /**
   * Deletes the current version of the workflow
   */
  deleteVersion() {
    const message = 'Delete Version';
    this.hostedService.deleteHostedWorkflowVersion(
        this.id * 1, // Converts to a number
        this._selectedVersion.name).subscribe(result => {
          this.workflowService.setWorkflow(result);
          this.refreshService.handleSuccess(message);
        }, error =>  {
          if (error) {
              this.refreshService.handleError(message, error);
          }
        }
      );
  }

  /**
   * Splits up the sourcefiles for the version into descriptor files and test parameter files
   */
  loadVersionSourcefiles() {
    this.descriptorFiles = this.getDescriptorFiles(this._selectedVersion.sourceFiles);
    this.testParameterFiles = this.getTestFiles(this._selectedVersion.sourceFiles);
  }

  /**
   * Combines sourcefiles into one array
   * @return {Array<SourceFile>} Array of sourcefiles
   */
  getCombinedSourceFiles() {
    let baseFiles = [];
    if (this.descriptorFiles) {
      baseFiles = baseFiles.concat(this.descriptorFiles);
    }
    if (this.testParameterFiles) {
      baseFiles = baseFiles.concat(this.testParameterFiles);
    }
    return baseFiles;
  }

  /**
   * Creates a new version based on changes made
   */
  saveVersion() {
    const message = 'Save Version';
    const newSourceFiles = this.commonSaveVersion();

    this.hostedService.editHostedWorkflow(
        this.id,
        newSourceFiles).subscribe(result => {
          this.toggleEdit();
          this.workflowService.setWorkflow(result);
          this.refreshService.handleSuccess(message);
        }, error =>  {
          if (error) {
            this.refreshService.handleError(message, error);
          }
        }
      );
  }

  /**
   * Resets the files back to their original state
   */
  resetFiles() {
    this.descriptorFiles = this.getDescriptorFiles(this.originalSourceFiles);
    this.testParameterFiles = this.getTestFiles(this.originalSourceFiles);
  }
}
