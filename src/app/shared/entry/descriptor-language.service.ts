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
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntryType } from '../enum/entry-type';
import { SessionQuery } from '../session/session.query';
import { ToolDescriptor } from '../swagger';
import { Workflow } from '../swagger/model/workflow';
import { validationDescriptorPatterns } from '../validationMessages.model';
import { MetadataService } from './../swagger/api/metadata.service';
import { DescriptorLanguageBean } from './../swagger/model/descriptorLanguageBean';

@Injectable()
export class DescriptorLanguageService {
  // Known value for the DescriptorLanguageBeans
  readonly knownCWLValue = 'CWL';
  readonly knownWDLValue = 'WDL';
  readonly knownNFLValue = 'NFL';
  readonly knownServiceValue = 'service';

  public descriptorLanguages$: Observable<Array<Workflow.DescriptorTypeEnum>>;
  public homepageInnerHTML$: Observable<string>;
  public noService$: Observable<DescriptorLanguageBean[]>;
  private descriptorLanguagesBean$ = new BehaviorSubject<DescriptorLanguageBean[]>([]);
  public filteredDescriptorLanguages$: Observable<Array<Workflow.DescriptorTypeEnum>>;
  constructor(private metadataService: MetadataService, private sessionQuery: SessionQuery) {
    this.update();
    this.descriptorLanguages$ = this.descriptorLanguagesBean$.pipe(
      map(descriptorLanguageMap => {
        if (descriptorLanguageMap) {
          return descriptorLanguageMap.map(descriptorLanguage => <Workflow.DescriptorTypeEnum>descriptorLanguage.value.toString());
        }
      })
    );
    this.noService$ = this.descriptorLanguagesBean$.pipe(map(beans => this.filterService(beans)));
    this.homepageInnerHTML$ = this.noService$.pipe(
      map((descriptorLanguageBeans: DescriptorLanguageBean[]) => this.getHomepageInnerHTML(descriptorLanguageBeans))
    );
    const combined$ = combineLatest([this.descriptorLanguages$, this.sessionQuery.entryType$]);
    this.filteredDescriptorLanguages$ = combined$.pipe(map(combined => this.filterLanguages(combined[0], combined[1])));
  }
  update() {
    this.metadataService.getDescriptorLanguages().subscribe((languageBeans: Array<DescriptorLanguageBean>) => {
      this.descriptorLanguagesBean$.next(languageBeans);
    });
  }

  toolDescriptorTypeEnumToWeirdCheckerRegisterString(descriptorType: ToolDescriptor.TypeEnum): 'cwl' | 'wdl' | null {
    let descriptorTypeNoNFL: 'cwl' | 'wdl';
    switch (descriptorType) {
      case ToolDescriptor.TypeEnum.CWL: {
        descriptorTypeNoNFL = 'cwl';
        break;
      }
      case ToolDescriptor.TypeEnum.WDL: {
        descriptorTypeNoNFL = 'wdl';
        break;
      }
      default: {
        this.genericUnhandledTypeError(descriptorType);
        return null;
      }
    }
    return descriptorTypeNoNFL;
  }

  getDescriptorPattern(descriptorType: ToolDescriptor.TypeEnum): string {
    switch (descriptorType) {
      case ToolDescriptor.TypeEnum.CWL: {
        return validationDescriptorPatterns.cwlPath;
      }
      case ToolDescriptor.TypeEnum.WDL: {
        return validationDescriptorPatterns.wdlPath;
      }
      case ToolDescriptor.TypeEnum.NFL: {
        return validationDescriptorPatterns.nflPath;
      }
      case ToolDescriptor.TypeEnum.SERVICE: {
        return '.*';
      }
      default: {
        this.genericUnhandledTypeError(descriptorType);
        return '.*';
      }
    }
  }

  workflowDescriptorTypeEnumToPlaceholderDescriptor(workflowDescriptorTypeEnum: ToolDescriptor.TypeEnum): string {
    switch (workflowDescriptorTypeEnum) {
      case ToolDescriptor.TypeEnum.CWL: {
        return 'e.g. /Dockstore.cwl';
      }
      case ToolDescriptor.TypeEnum.WDL: {
        return 'e.g. /Dockstore.wdl';
      }
      case ToolDescriptor.TypeEnum.NFL: {
        return 'e.g. /nextflow.config';
      }
      default: {
        this.genericUnhandledTypeError(workflowDescriptorTypeEnum);
        return '';
      }
    }
  }

  genericUnhandledTypeError(type: any): void {
    console.error('Unhandled descriptor type: ' + type);
  }

  getHomepageInnerHTML(descriptorLanguageBeans: DescriptorLanguageBean[]): string {
    const innerHTMLArray = [];
    descriptorLanguageBeans.forEach(descriptorLanguageBean => {
      switch (descriptorLanguageBean.value) {
        case this.knownCWLValue: {
          innerHTMLArray.push('<a href="https://www.commonwl.org/" target="_blank" rel="noopener noreferrer">CWL</a>');
          break;
        }
        case this.knownWDLValue: {
          innerHTMLArray.push('<a href="http://openwdl.org/" target="_blank" rel="noopener noreferrer">WDL</a>');
          break;
        }
        case this.knownNFLValue: {
          innerHTMLArray.push('<a href="https://www.nextflow.io/" target="_blank" rel="noopener noreferrer">Nextflow</a>');
          break;
        }
        default: {
          this.genericUnhandledTypeError(descriptorLanguageBean.value);
        }
      }
    });
    const length = innerHTMLArray.length;
    if (length === 0) {
      console.error('Something has gone terribly wrong. Could not get corresponding link to descriptor language');
      return 'descriptor languages';
    }
    if (length === 1) {
      return innerHTMLArray[0];
    }
    if (length === 2) {
      return innerHTMLArray.join(' or ');
    }
    if (length >= 3) {
      innerHTMLArray[length - 1] = 'or ' + innerHTMLArray[length - 1];
      return innerHTMLArray.join(', ');
    }
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
    if (descriptorLanguageBean.value === this.knownServiceValue) {
      return ToolDescriptor.TypeEnum.SERVICE;
    } else {
      return <ToolDescriptor.TypeEnum>descriptorLanguageBean.value.toString();
    }
  }

  filterService(beans: DescriptorLanguageBean[]): DescriptorLanguageBean[] {
    return beans.filter(bean => bean.value !== this.knownServiceValue);
  }

  /**
   * Some entries are not meant to show all descriptor types
   *
   * @param {ToolDescriptor.TypeEnum[]} descriptorTypes
   * @param {EntryType} entryType
   * @returns {ToolDescriptor.TypeEnum[]}
   * @memberof DescriptorLanguageService
   */
  filterLanguages(descriptorTypes: Workflow.DescriptorTypeEnum[], entryType: EntryType): Workflow.DescriptorTypeEnum[] {
    if (entryType === EntryType.BioWorkflow || entryType === EntryType.Tool || !entryType) {
      return descriptorTypes.filter(descriptorType => descriptorType !== Workflow.DescriptorTypeEnum.Service);
    } else {
      return [Workflow.DescriptorTypeEnum.Service];
    }
  }
}
