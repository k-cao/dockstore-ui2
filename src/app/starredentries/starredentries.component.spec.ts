import { UsersService } from './../shared/swagger/api/users.service';
import { StarentryService } from './../shared/starentry.service';
import { ProviderService } from './../shared/provider.service';
import { ImageProviderService } from '../shared/image-provider.service';
import { UserService } from '../loginComponents/user.service';
import { StarringStubService, UserStubService, ImageProviderStubService,
  StarEntryStubService, UsersStubService } from './../test/service-stubs';
import { StarringService } from './../starring/starring.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StarredEntriesComponent } from './starredentries.component';

describe('StarredEntriesComponent', () => {
  let component: StarredEntriesComponent;
  let fixture: ComponentFixture<StarredEntriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StarredEntriesComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{provide: StarringService, useClass: StarringStubService},
      {provide: UserService, useClass: UserStubService}, {
        provide: ImageProviderService, useClass: ImageProviderStubService }, ProviderService, {
          provide: StarentryService, useClass: StarEntryStubService}, {
            provide: UsersService, useClass: UsersStubService}
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StarredEntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
