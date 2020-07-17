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
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewChecked, Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Observable } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { AlertService } from '../../shared/alert/state/alert.service';
import { Base } from '../../shared/base';
import { formInputDebounceTime } from '../../shared/constants';
import { ContainerService } from '../../shared/container.service';
import { ContainersService, DockstoreTool, SourceFile } from '../../shared/swagger';
import { ContainertagsService } from '../../shared/swagger/api/containertags.service';
import { Tag } from '../../shared/swagger/model/tag';
import { ToolDescriptor } from '../../shared/swagger/model/toolDescriptor';
import { ToolQuery } from '../../shared/tool/tool.query';
import { formErrors, validationDescriptorPatterns, validationMessages } from '../../shared/validationMessages.model';

@Component({
  selector: 'app-add-tag',
  templateUrl: './add-tag.component.html',
  styleUrls: ['./add-tag.component.css']
})
export class AddTagComponent extends Base implements OnInit, AfterViewChecked {
  addTagForm: NgForm;
  @ViewChild('addTagForm', { static: true }) currentForm: NgForm;
  public DescriptorType = ToolDescriptor.TypeEnum;
  public tool: DockstoreTool;
  public formErrors = formErrors;
  public validationPatterns = validationDescriptorPatterns;
  public trackByIndex: number;
  editMode = true;
  unsavedVersion: Tag;
  unsavedTestCWLFile = '';
  unsavedTestWDLFile = '';
  unsavedCWLTestParameterFilePaths: string[] = [];
  unsavedWDLTestParameterFilePaths: string[] = [];
  // Originally set to false because we made the defaults not duplicate of each other
  public hasDuplicateCWL = false;
  public hasDuplicateWDL = false;
  constructor(
    private containerService: ContainerService,
    private containertagsService: ContainertagsService,
    private containersService: ContainersService,
    private toolQuery: ToolQuery,
    private alertService: AlertService,
    private matDialog: MatDialog
  ) {
    super();
  }

  initializeTag() {
    this.unsavedVersion = {
      name: '',
      reference: '',
      image_id: '',
      dockerfile_path: '',
      cwl_path: '',
      wdl_path: '',
      hidden: false,
      automated: false,
      dirtyBit: false,
      verified: false,
      verifiedSource: null,
      size: 0
    };
    this.unsavedCWLTestParameterFilePaths = [];
    this.unsavedWDLTestParameterFilePaths = [];
  }

  loadDefaults() {
    if (this.tool) {
      this.unsavedVersion.cwl_path = this.tool.default_cwl_path;
      this.unsavedVersion.wdl_path = this.tool.default_wdl_path;
      this.unsavedVersion.dockerfile_path = this.tool.default_dockerfile_path;
      if (this.tool.defaultCWLTestParameterFile) {
        this.unsavedTestCWLFile = this.tool.defaultCWLTestParameterFile;
      }
      if (this.tool.defaultWDLTestParameterFile) {
        this.unsavedTestWDLFile = this.tool.defaultWDLTestParameterFile;
      }
    }
  }

  ngOnInit() {
    this.initializeTag();
    this.toolQuery.tool$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(tool => {
      // One day, we will figure out how to handle form changes with state management's read only state
      this.tool = JSON.parse(JSON.stringify(tool));
      this.loadDefaults();
    });
  }

  addTestParameterFile(descriptorType: ToolDescriptor.TypeEnum) {
    switch (descriptorType) {
      case this.DescriptorType.CWL: {
        const newTestFile = this.unsavedTestCWLFile;
        this.unsavedCWLTestParameterFilePaths.push(newTestFile);
        this.unsavedTestCWLFile = '';
        break;
      }
      case this.DescriptorType.WDL: {
        const newTestFile = this.unsavedTestWDLFile;
        this.unsavedWDLTestParameterFilePaths.push(newTestFile);
        this.unsavedTestWDLFile = '';
        break;
      }
      default: {
        console.log('No idea how you submitted in neither edit or add mode');
      }
    }
  }

  removeTestParameterFile(index: number, descriptorType: ToolDescriptor.TypeEnum) {
    switch (descriptorType) {
      case this.DescriptorType.CWL: {
        this.unsavedCWLTestParameterFilePaths.splice(index, 1);
        break;
      }
      case this.DescriptorType.WDL: {
        this.unsavedWDLTestParameterFilePaths.splice(index, 1);
        break;
      }
      default: {
        console.log('No idea how you submitted in neither edit or add mode');
      }
    }
  }

  addTag() {
    this.alertService.start('Adding tag');
    this.containertagsService.addTags(this.tool.id, [this.unsavedVersion]).subscribe(
      (tags: Tag[]) => {
        this.tool.workflowVersions = tags;
        const id = this.tool.id;
        const tagName = this.unsavedVersion.name;
        // Store the unsaved test files if valid and exist
        if (this.unsavedTestCWLFile.length > 0) {
          this.addTestParameterFile(this.DescriptorType.CWL);
        }
        if (this.unsavedTestWDLFile.length > 0) {
          this.addTestParameterFile(this.DescriptorType.WDL);
        }
        this.initializeTag();
        // Using the string 'CWL' because this parameter only accepts 'CWL' or 'WDL' and not 'NFL'
        const addCWL: Observable<SourceFile[]> = this.containersService.addTestParameterFiles(
          id,
          this.unsavedCWLTestParameterFilePaths,
          'CWL',
          tagName,
          null
        );
        // Using the string 'WDL' because this parameter only accepts 'CWL' or 'WDL' and not 'NFL'
        const addWDL: Observable<SourceFile[]> = this.containersService.addTestParameterFiles(
          id,
          this.unsavedWDLTestParameterFilePaths,
          'WDL',
          tagName,
          null
        );
        forkJoin([addCWL, addWDL]).subscribe(
          () => {
            this.containersService.refresh(id).subscribe(
              (tool: DockstoreTool) => {
                this.containerService.setTool(tool);
                this.alertService.detailedSuccess();
                this.matDialog.closeAll();
                this.loadDefaults();
              },
              (error: HttpErrorResponse) => {
                this.containerService.setTool(this.tool);
                this.alertService.detailedError(error);
              }
            );
          },
          (error: HttpErrorResponse) => {
            this.containerService.setTool(this.tool);
            this.alertService.detailedError(error);
          }
        );
      },
      (error: HttpErrorResponse) => this.alertService.detailedError(error)
    );
  }

  // Validation starts here, should move most of these to a service somehow
  ngAfterViewChecked() {
    this.formChanged();
  }

  formChanged() {
    if (this.currentForm === this.addTagForm) {
      return;
    }
    this.addTagForm = this.currentForm;
    if (this.addTagForm) {
      this.addTagForm.valueChanges
        .pipe(
          debounceTime(formInputDebounceTime),
          takeUntil(this.ngUnsubscribe)
        )
        .subscribe(data => this.onValueChanged(data));
    }
  }
  onValueChanged(data?: any) {
    if (!this.addTagForm) {
      return;
    }
    const form = this.addTagForm.form;
    for (const field in formErrors) {
      if (formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        formErrors[field] = '';
        const control = form.get(field);
        if (control && !control.valid) {
          const messages = validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  /**
   * Checks if there's a duplicate CWL or WDL test parameter file
   * TODO: Not have this run on keyup, there should be a debouncer for when the user types rapidly
   *
   * @memberof AddTagComponent
   */
  updateDuplicateTestJsonCheck() {
    this.hasDuplicateCWL = this.hasDuplicateTestJsonCommon(this.unsavedTestCWLFile, this.unsavedTestWDLFile);
    this.hasDuplicateWDL = this.hasDuplicateTestJsonCommon(this.unsavedTestWDLFile, this.unsavedTestCWLFile);
  }

  /**
   * Mainly checks 3 things, if we're checking the CWL test parameter file that's about to be added then:
   * - The current list of WDL test parameter files cannot already have it
   * - The current list of CWL test parameter files cannot already have it
   * - The current WDL test parameter file to be added cannot be the same
   *   with the exception that both are empty since nothing happens regardless)
   *
   * @private
   * @param {string} focusedTestFilePath    The test parameter file we're currently checking
   * @param {string} unfocusedTestFilePath  The other test parameter file we're not currently checking
   * @returns {boolean}                     Whether or not a duplicate test file exists
   * @memberof AddTagComponent
   */
  private hasDuplicateTestJsonCommon(focusedTestFilePath: string, unfocusedTestFilePath: string): boolean {
    if (!focusedTestFilePath) {
      return false;
    } else {
      const paths = this.unsavedCWLTestParameterFilePaths.concat(this.unsavedWDLTestParameterFilePaths).concat(unfocusedTestFilePath);
      return paths.includes(focusedTestFilePath);
    }
  }
}
