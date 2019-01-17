import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';
import { AkitaNgFormsManager } from '@datorama/akita-ng-forms-manager';
import { Observable } from 'rxjs';

import { TagEditorMode } from '../../../shared/enum/tagEditorMode.enum';
import { CreateCollectionQuery } from '../state/create-collection.query';
import { CreateCollectionService } from '../state/create-collection.service';

export interface FormsState {
  createCollection: {
    name: string;
    description: string;
  };
}

@Component({
  templateUrl: './create-collection.component.html',
  styleUrls: ['./create-collection.component.scss']
})
export class CreateCollectionComponent implements OnInit, OnDestroy {
  createCollectionForm: FormGroup;
  public title: string;
  public loading$: Observable<boolean>;
  constructor(private createCollectionQuery: CreateCollectionQuery,
              private createCollectionService: CreateCollectionService, @Inject(MAT_DIALOG_DATA) public data: any,
              private builder: FormBuilder, private formsManager: AkitaNgFormsManager<FormsState>
  ) { }

  ngOnInit() {
    this.loading$ = this.createCollectionQuery.loading$;
    this.createCollectionService.clearState();
    let name = null;
    let description = null;
    this.formsManager.remove('createCollection');
    if (this.data.mode === TagEditorMode.Add) {
      this.title = 'Create Collection';
    } else {
      this.title = 'Edit Collection';
      name = this.data.collection.value.name;
      description = this.data.collection.value.description;
    }
    this.createCollectionForm = this.builder.group({
      name: [name, [Validators.required, Validators.maxLength(39), Validators.minLength(3), Validators.pattern(/^[a-zA-Z][a-zA-Z\d]*$/)]],
      description: [description]
    });
    this.formsManager.upsert('createCollection', this.createCollectionForm);
    this.extractData();

  }

  createCollection() {
    if (this.data.mode === TagEditorMode.Add) {
      this.createCollectionService.createCollection(this.createCollectionForm.value);
    } else {
      this.createCollectionService.editCollection(this.createCollectionForm.value, this.data.collection.value.id);
    }
  }

  get name(): AbstractControl {
    return this.createCollectionForm.get('name');
  }

   get description(): AbstractControl {
    return this.createCollectionForm.get('description');
  }

  ngOnDestroy(): void {
    this.formsManager.unsubscribe();
  }

  extractData(): void {

  }
}
