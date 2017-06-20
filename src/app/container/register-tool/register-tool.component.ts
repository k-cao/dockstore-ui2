import { NgForm } from '@angular/forms';
import { RegisterToolService } from './register-tool.service';
import { Component, OnInit, AfterViewChecked, ViewChild } from '@angular/core';
import { validationMessages, formErrors, validationPatterns } from '../../shared/validationMessages.model';
import { Repository } from './../../shared/enum/Repository.enum';
import { Registry, FriendlyRegistry } from './../../shared/enum/Registry.enum';

@Component({
  selector: 'app-register-tool',
  templateUrl: './register-tool.component.html',
  styleUrls: ['./register-tool.component.css'],
  providers: [RegisterToolService]
})
export class RegisterToolComponent implements OnInit, AfterViewChecked {
  private toolRegisterError: boolean;
  private tool: any;
  private formErrors = formErrors;
  private validationPatterns = validationPatterns;

  registerToolForm: NgForm;
  @ViewChild('registerToolForm') currentForm: NgForm;

  constructor(private registerToolService: RegisterToolService) { }

  isInvalidCustomRegistry() {
    this.registerToolService.isInvalidCustomRegistry();
  }

  repositoryKeys(): Array<string> {
    return this.registerToolService.repositoryKeys();
  }

  registryKeys(): Array<string> {
    return this.registerToolService.registryKeys();
  }

  friendlyRegistryKeys(): Array<string> {
    return this.registerToolService.friendlyRegistryKeys();
  }

  friendlyRepositoryKeys(): Array<string> {
    return this.registerToolService.friendlyRepositoryKeys();
  }

  isInvalidPrivateTool() {
    this.registerToolService.isInvalidPrivateTool();
  }

  registerTool() {
    this.registerToolService.registerTool();
  }

  getUnfriendlyRegistryName(registry: string): Registry {
    return this.registerToolService.getUnfriendlyRegistryName(registry);
  }

  getUnfriendlyRepositoryName(repository: Repository): string {
    return this.registerToolService.getFriendlyRepositoryName(repository);
  }

  ngOnInit() {
    this.registerToolService.toolRegisterError.subscribe(toolRegisterError => this.toolRegisterError = toolRegisterError);
    this.registerToolService.tool.subscribe(tool => this.tool = tool);
  }

  ngAfterViewChecked() {
    this.formChanged();
  }

  formChanged() {
    if (this.currentForm === this.registerToolForm) { return; }
    this.registerToolForm = this.currentForm;
    if (this.registerToolForm) {
      this.registerToolForm.valueChanges
        .subscribe(data => this.onValueChanged(data));
    }
  }
  onValueChanged(data?: any) {
    if (!this.registerToolForm) { return; }
    const form = this.registerToolForm.form;
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
}
