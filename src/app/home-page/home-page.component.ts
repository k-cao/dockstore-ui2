import { JsonObject } from '@angular/compiler-cli/ngcc/src/packages/entry_point';
import { Component, OnInit } from '@angular/core';
import { User } from 'app/shared/swagger';
import { UserQuery } from 'app/shared/user/user.query';
import { Observable } from 'rxjs';
import { HomePageService } from './home-page.service';

interface PotentialAction {
  '@type': string;
  target: string;
  'query-input': string;
}

interface OrgSchema {
  '@context': string;
  '@type': string;
  description: string;
  logo: string;
  name: string;
  sameAs: string;
  url: string;
}

interface WebsiteSchema {
  '@context': string;
  '@type': string;
  audience: string;
  name: string;
  potentialAction: PotentialAction;
  url: string;
}

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  public user$: Observable<User>;
  public orgSchema: OrgSchema;
  public websiteSchema: WebsiteSchema;
  constructor(private userQuery: UserQuery, private homePageService: HomePageService) {}

  ngOnInit() {
    this.user$ = this.userQuery.user$;
    this.orgSchema = this.homePageService.hpOrgSchema;
    this.websiteSchema = this.homePageService.hpWebsiteSchema;
  }
}
