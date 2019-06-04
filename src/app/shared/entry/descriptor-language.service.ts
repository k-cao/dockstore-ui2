/*
 *    Copyright 2018 OICR
 *
 *    Licensed under the Apache License, Version 2.0 (the "License")
 *    you may not use this file except in compliance with the License
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { MetadataService } from './../swagger/api/metadata.service';
import { DescriptorLanguageBean } from './../swagger/model/descriptorLanguageBean';
import { ToolDescriptor } from '../swagger';
import { WorkflowClass } from '../enum/workflow-class';
import { WorkflowQuery } from '../state/workflow.query';

@Injectable()
export class DescriptorLanguageService {
  private descriptorLanguages$: Observable<Array<ToolDescriptor.TypeEnum>>;
  private descriptorLanguagesBean$ = new BehaviorSubject<DescriptorLanguageBean[]>([]);
  public filteredDescriptorLanguages$: Observable<Array<ToolDescriptor.TypeEnum>>;

  constructor(private metadataService: MetadataService, private workflowQuery: WorkflowQuery) {
    this.update();
    this.descriptorLanguages$ = this.descriptorLanguagesBean$.pipe(
      map(descriptorLanguageMap => {
        if (descriptorLanguageMap) {
          return descriptorLanguageMap.map(descriptorLanguage =>
            this.convertDescriptorLanguageBeanToToolDescriptorTypeEnum(descriptorLanguage)
          );
        }
      })
    );
    const combined$ = combineLatest(this.descriptorLanguages$, this.workflowQuery.workflowClass$);
    this.filteredDescriptorLanguages$ = combined$.pipe(
      map(combined => this.filterLanguages(combined[0], combined[1]))
    );
  }
  update() {
    this.metadataService.getDescriptorLanguages().subscribe((languageBeans: Array<DescriptorLanguageBean>) => {
      this.descriptorLanguagesBean$.next(languageBeans);
    });
  }

  /**
   * In almost all cases, the string value from the DescriptorLanguageBean matches the ToolDescriptor.TypeEnum exactly.
   * However, for services, it does not.
   *
   * @param {DescriptorLanguageBean} descriptorLanguageBean
   * @returns
   * @memberof DescriptorLanguageService
   */
  convertDescriptorLanguageBeanToToolDescriptorTypeEnum(descriptorLanguageBean: DescriptorLanguageBean): ToolDescriptor.TypeEnum {
    if (descriptorLanguageBean.value === 'service') {
      return ToolDescriptor.TypeEnum.DOCKSTORESERVICE;
    } else {
      return <ToolDescriptor.TypeEnum>descriptorLanguageBean.value.toString();
    }
  }

  filterLanguages(thing: ToolDescriptor.TypeEnum[], workflowClass: WorkflowClass): ToolDescriptor.TypeEnum[] {
    if (workflowClass === WorkflowClass.BioWorkflow || !workflowClass) {
      return thing.filter(thingy => thingy !== ToolDescriptor.TypeEnum.DOCKSTORESERVICE);
    } else {
      return [ToolDescriptor.TypeEnum.DOCKSTORESERVICE];
    }
  }
}
