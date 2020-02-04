/* tslint:disable:no-unused-variable */
import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { FundingComponent } from './funding.component';

describe('FundingComponent', () => {
  let component: FundingComponent;
  let fixture: ComponentFixture<FundingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FundingComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FundingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
