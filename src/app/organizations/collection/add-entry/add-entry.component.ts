import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Observable } from 'rxjs';
import { Collection, OrganizationUser } from '../../../shared/swagger';
import { AddEntryQuery } from '../state/add-entry.query';
import { AddEntryService } from '../state/add-entry.service';

@Component({
  selector: 'add-entry',
  templateUrl: './add-entry.component.html',
  styleUrls: ['./add-entry.component.scss']
})
export class AddEntryComponent implements OnInit {
  public memberships$: Observable<Array<OrganizationUser>>;
  public collections$: Observable<Array<Collection>>;
  isLoading$: Observable<boolean>;
  selectedOrganizationId: number;
  selectedCollectionId: number;
  constructor(
    private addEntryQuery: AddEntryQuery,
    private addEntryService: AddEntryService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddEntryComponent>
  ) {}

  ngOnInit() {
    this.isLoading$ = this.addEntryQuery.isLoading$;
    this.addEntryService.updateMemberships();
    this.memberships$ = this.addEntryQuery.memberships$;
    this.collections$ = this.addEntryQuery.filteredCollections$;
  }

  /**
   * Called when organization is selected from dropdown
   * @param event event.value is the id of the organization to add
   */
  onOrganizationChange(event: MatSelectChange) {
    this.selectedCollectionId = null;
    this.addEntryService.updateCollections(event.value);
  }

  /**
   * Attempts to add the entry to the selected collection
   */
  addToCollection() {
    if (this.selectedCollectionId && this.selectedOrganizationId) {
      this.addEntryService.addEntryToCollection(this.selectedOrganizationId, this.selectedCollectionId, this.data.entryId);
    }
  }
}
