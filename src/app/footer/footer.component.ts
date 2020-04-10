/**
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
import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { MetadataService } from '../metadata/metadata.service';
import { Base } from '../shared/base';
import { Dockstore } from './../shared/dockstore.model';
import { Metadata } from './../shared/swagger/model/metadata';
import { versions } from './versions';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent extends Base implements OnInit {
  version: string;
  tag: string;
  public prod = true;
  public dsServerURI: any;
  Dockstore = Dockstore;
  private WEBSERVICE_DOWN_STATUS_CODES = [
    0, // Was like this, don't know when it happens
    404, // Web service container is down. Obviously only test with a specific, known, endpoint
    502, // Stack is down
    504 // Angular proxy returns 504 -- for local dev environment
  ];

  constructor(private metadataService: MetadataService) {
    super();
  }

  ngOnInit() {
    this.tag = versions.tag;
    this.dsServerURI = Dockstore.API_URI;
    this.metadataService
      .getMetadata()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (metadata: Metadata) => {
          if (metadata.hasOwnProperty('version')) {
            this.version = metadata['version'];
          } else {
            throw new Error('Version undefined');
          }
        },
        (error: HttpErrorResponse) => {
          console.log(error);
          const webserviceDown = this.WEBSERVICE_DOWN_STATUS_CODES.some(code => code === error.status);
          if (webserviceDown && window.location.pathname !== '/maintenance') {
            window.location.href = '/maintenance';
          }
        }
      );
  }
}
