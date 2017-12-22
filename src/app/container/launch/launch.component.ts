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

import { ToolDescriptorService } from '../descriptors/tool-descriptor.service';
import { Component, Input } from '@angular/core';

import { DescriptorSelector } from '../../shared/selectors/descriptor-selector';

import { ToolLaunchService } from './tool-launch.service';
import { ContainerService } from '../../shared/container.service';
import { MetadataService } from '../../shared/swagger/api/metadata.service';

@Component({
  selector: 'app-launch',
  templateUrl: './launch.component.html',
  styleUrls: ['./launch.component.css']
})
export class LaunchComponent {

  @Input() path;
  @Input() toolname;

  _selectedVersion: any;
  @Input() set default(value: any) {
    if (value != null) {
      this._selectedVersion = value;
      this.reactToDescriptor();
      this.validDescriptors = this.filterDescriptors(this.descriptors, this._selectedVersion);
    }
  }

  params: string;
  cli: string;
  cwl: string;
  consonance: string;
  descriptors: Array<any>;
  validDescriptors: Array<any>;
  currentDescriptor: string;

  constructor(private launchService: ToolLaunchService,
              private toolDescriptorService: ToolDescriptorService,
              private metadataService: MetadataService) {
    this.metadataService.getDescriptorLanguages().subscribe(map => {
      this.descriptors = map;
      this.validDescriptors = this.filterDescriptors(this.descriptors, this._selectedVersion);
    });
  }

  filterDescriptors(descriptors: Array<any>, version: any): Array<any> {
    const newDescriptors = [];

    // Return empty array if no descriptors present yet
    if (descriptors === undefined || version === undefined) {
      return newDescriptors;
    }

    // Determine if the current version has CWL and/or WDL descriptors
    let hasCwl = false;
    let hasWdl = false;

    for (const sourceFile of version.sourceFiles) {
      if (sourceFile.type === 'DOCKSTORE_CWL') {
        hasCwl = true;
      } else if (sourceFile.type === 'DOCKSTORE_WDL') {
        hasWdl = true;
      }
    }

    // Create a list of valid descriptors
    for (const descriptor of descriptors) {
      if ((descriptor.value === 'CWL' && hasCwl) || (descriptor.value === 'WDL' && hasWdl)) {
        newDescriptors.push(descriptor);
      }
    }

    // Preselect first descriptor in the list
    if (newDescriptors && newDescriptors.length > 0) {
      this.currentDescriptor = newDescriptors[0].value;
    }

    return newDescriptors;
  }

  reactToDescriptor(): void {
    let fullToolPath = this.path;
    if (this.toolname) {
      fullToolPath += '/' + this.toolname;
    }
    this.changeMessages(fullToolPath, this._selectedVersion.name);
  }

  private changeMessages(toolPath: string, versionName: string) {
    this.params = this.launchService.getParamsString(toolPath, versionName, this.currentDescriptor);
    this.cli = this.launchService.getCliString(toolPath, versionName, this.currentDescriptor);
    this.cwl = this.launchService.getCwlString(toolPath, versionName);
    this.consonance = this.launchService.getConsonanceString(toolPath, versionName);
  }

}
