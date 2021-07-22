import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Base } from '../shared/base';
import { ImageProviderService } from '../shared/image-provider.service';
import { ProviderService } from '../shared/provider.service';
import { DockstoreTool, Organization, Workflow } from '../shared/swagger';
import { UserQuery } from '../shared/user/user.query';
import { UsersService } from './../shared/swagger/api/users.service';

@Component({
  selector: 'app-starredentries',
  templateUrl: './starredentries.component.html',
  styleUrls: ['./starredentries.component.scss'],
})
export class StarredEntriesComponent extends Base implements OnInit {
  starredTools: any;
  starredWorkflows: any;
  starredServices: any;
  starredOrganizations: Array<Organization>;
  // collectionsLength$: Observable<number>;
  user: any;
  starGazersClicked = false;
  organizationStarGazersClicked = false;
  public selectedIndex$: Observable<number>;

  constructor(
    private userQuery: UserQuery,
    private imageProviderService: ImageProviderService,
    private providerService: ProviderService,
    private usersService: UsersService
  ) {
    super();
  }

  ngOnInit() {
    this.userQuery.user$.subscribe((user) => (this.user = user));
    this.usersService.getStarredTools().subscribe((starredTool) => {
      this.starredTools = starredTool.filter((entry: DockstoreTool) => entry.is_published);
      this.starredTools.forEach((tool) => {
        if (!tool.providerUrl) {
          this.providerService.setUpProvider(tool);
        }
        if (!tool.imgProviderUrl) {
          tool = this.imageProviderService.setUpImageProvider(tool);
        }
      });
    });
    this.usersService.getStarredWorkflows().subscribe((starredWorkflow) => {
      this.starredWorkflows = starredWorkflow.filter((entry: Workflow) => entry.is_published);
      this.starredWorkflows.forEach((workflow) => {
        if (!workflow.providerUrl) {
          this.providerService.setUpProvider(workflow);
        }
      });
    });
    this.usersService.getStarredOrganizations().subscribe((starredOrganizations) => {
      this.starredOrganizations = starredOrganizations;
    });
  }
  isOwner(entryUsers: any): boolean {
    let isOwner = false;
    if (this.user) {
      for (const user of entryUsers) {
        if (user.id === this.user.id) {
          isOwner = true;
          break;
        }
      }
    }
    return isOwner;
  }

  starGazersChange() {
    this.starGazersClicked = !this.starGazersClicked;
  }

  organizationStarGazersChange() {
    this.organizationStarGazersClicked = !this.organizationStarGazersClicked;
  }
}
