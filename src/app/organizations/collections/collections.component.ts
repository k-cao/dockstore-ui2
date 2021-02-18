/*
 *    Copyright 2019 OICR
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
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HashMap } from '@datorama/akita';
import { Base } from 'app/shared/base';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TagEditorMode } from '../../shared/enum/tagEditorMode.enum';
import { Collection } from '../../shared/swagger';
import { CollectionsQuery } from '../state/collections.query';
import { CollectionsService } from '../state/collections.service';
import { OrganizationQuery } from '../state/organization.query';
import { CreateCollectionComponent } from './create-collection/create-collection.component';

@Component({
  selector: 'collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss'],
})
export class CollectionsComponent extends Base implements OnInit, OnChanges {
  @Input() organizationID: number;
  @Input() organizationName: string;
  loading$: Observable<boolean>;
  canEdit$: Observable<boolean>;
  collections$: Observable<HashMap<Collection>>;
  @Output() collectionsLength = new EventEmitter<number>();
  constructor(
    private collectionsQuery: CollectionsQuery,
    private organizationQuery: OrganizationQuery,
    private collectionsService: CollectionsService,
    private matDialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.loading$ = this.collectionsQuery.loading$;
    this.canEdit$ = this.organizationQuery.canEdit$;
    this.collections$ = this.collectionsQuery.collections$;
    this.collections$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((collectionList) => {
      this.collectionsLength.emit(Object.keys(collectionList).length);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.collectionsService.clearState();
    this.collectionsService.updateCollections(this.organizationID);
  }

  editCollection(collection: Collection) {
    this.matDialog.open(CreateCollectionComponent, { data: { collection: collection, mode: TagEditorMode.Edit }, width: '600px' });
  }

  createCollection() {
    this.matDialog.open(CreateCollectionComponent, { data: { collection: null, mode: TagEditorMode.Add }, width: '600px' });
  }
}
