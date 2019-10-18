import { Component, OnInit } from '@angular/core';
import { EntryWizardService } from '../state/entry-wizard.service';
import { EntryWizardQuery } from '../state/entry-wizard.query';
import { EntryWizard } from '../state/entry-wizard.model';
import { Observable } from 'rxjs';
import { Repository } from '../openapi/model/repository';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'entry-wizard',
  templateUrl: './entry-wizard.component.html',
  styleUrls: ['./entry-wizard.component.scss']
})
export class EntryWizardComponent implements OnInit {
  isLoading$: Observable<boolean>;
  gitRegistries$: Observable<string[]>;
  gitOrganizations$: Observable<string[]>;
  gitRepositories$: Observable<Repository[]>;
  selectedGitRegistry: string = null;
  selectedGitOrganization: string = null;

  constructor(private entryWizardQuery: EntryWizardQuery, private entryWizardService: EntryWizardService) {}

  ngOnInit() {
    this.entryWizardService.updateGitRegistries();
    this.isLoading$ = this.entryWizardQuery.selectLoading();
    this.gitRegistries$ = this.entryWizardQuery.selectGitRegistries$;
    this.gitOrganizations$ = this.entryWizardQuery.selectGitOrganizations$;
    this.gitRepositories$ = this.entryWizardQuery.selectGitRepositories$;
  }

  /**
   * Given a registry will retrieve all associated organizations for the logged in user
   * @param selectedRegistry the selected registry
   */
  getOrganizations(selectedRegistry: string) {
    this.entryWizardService.updateGitOrganizations(selectedRegistry);
  }

  /**
   * Given an organization will retrieve all associated repositories for the logged in user
   * @param selectedOrganization the seleceted organization
   */
  getRepositories(selectedOrganization: string) {
    this.entryWizardService.updateGitRepositories(this.selectedGitRegistry, selectedOrganization);
  }

  /**
   * Called on slide toggle to add or remove workflow
   * @param event toggle event
   */
  toggleRepo(event: MatSlideToggleChange) {
    if (event.checked) {
      this.entryWizardService.addWorkflow(this.selectedGitRegistry, event.source.name);
    } else if (!event.checked) {
      this.entryWizardService.removeWorkflow(this.selectedGitRegistry, event.source.name);
    }
  }
}