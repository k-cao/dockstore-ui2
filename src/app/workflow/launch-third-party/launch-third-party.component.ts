import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { combineLatest, Observable } from 'rxjs';
import { map, share, takeUntil } from 'rxjs/operators';
import { Base } from '../../shared/base';
import { DescriptorTypeCompatService } from '../../shared/descriptor-type-compat.service';
import { Dockstore } from '../../shared/dockstore.model';
import { GA4GHFilesQuery } from '../../shared/ga4gh-files/ga4gh-files.query';
import { ToolFile, Workflow, WorkflowVersion } from '../../shared/swagger';
import { WorkflowsService } from '../../shared/swagger/api/workflows.service';
import { SourceFile } from '../../shared/swagger/model/sourceFile';
import { DescriptorsQuery } from './state/descriptors-query';
import { DescriptorsStore } from './state/descriptors-store';
import { DescriptorsService } from './state/descriptors.service';
import FileTypeEnum = ToolFile.FileTypeEnum;

// tslint:disable:max-line-length
/**
 *  # Overview
 *
 *  A component that has buttons linking to external platforms that can launch workflows hosted on Dockstore.
 *
 *  # Instructions for adding a button for an external platform
 *
 *  ## Configuration -- optional, but highly recommended
 *
 *  The endpoint of the external platform should ideally be configurable instead of hard-coded in the UI. This will allow the
 *  staging and production instances of Dockstore to redirect to the external platform's equivalent instances.
 *
 *  Even if the external platform only has one deployment environment, making the endpoint configurable is preferred,
 *  as locations change, and a configurable endpoint allows Dockstore to redirect to a new endpoint without
 *  building and deploying a new version of the software.
 *
 *  ### How the UI gets its configuration data
 *
 *  Configuration data is supplied to the UI via the `/metadata/config.json` endpoint in the
 *  [Dockstore web service](https://github.com/dockstore/dockstore).
 *
 *  ### Update the web service
 *
 *  1. Add a new property in [DockstoreWebserviceConfiguration#UIConfig](https://github.com/dockstore/dockstore/blob/0a734abe9dbe34eed12404d4697ebc43b71da8d8/dockstore-webservice/src/main/java/io/dockstore/webservice/DockstoreWebserviceConfiguration.java#L616)
 *  that has the endpoint.
 *  2. Add a getter and setter for it.
 *  3. Submit a PR for approval
 *  3. After this PR has been merged, you will need the Dockstore team to do a Maven release that contains this change.
 *
 *  ### Update compose_setup
 *
 *  [Compose setup](https://github.com/dockstore/compose_setup) is a wrapper used around docker-compose that is used to
 *  deploy Dockstore to staging and production environments. It prompts for configurable data and
 *  writes out a configuration file that the dockstore web service reads upon startup.
 *
 *  1. Update [install_bootstrap](https://github.com/dockstore/compose_setup/blob/develop/install_bootstrap) to prompt for the endpoint
 *  2. Update the [yml template](https://github.com/dockstore/compose_setup/blob/develop/templates/web.yml.template) for the new setting.
 *  3. Submit a PR against the develop branch
 *
 *  ### Consume the configuration from the web service
 *
 *  1. Ensure that the `webservice_version` in the package.json references a version that contains the merged PR from the previous section.
 *  2. Update src/app/shared/dockstore.model.ts with a new property for the external endpoint
 *  3. In src/app/configuration.service.ts, update the `updateDockstoreModel` method so that it reads the new data from
 *  `config` parameter and
 *  puts it into dockstore.model.ts. The `config` parameter has the response from the web service to fetch configuration data.
 *
 *  ### Add the button
 *
 *  1. Optionally, but preferably, add an icon for the new platform, putting it in `src/assets/images/thirdparty`.
 *  2. If the icon is an SVG, you will need to add it to the icon registry in the constructor of this class, below.
 *  Follow the existing pattern.
 *  3. Add your HTML to launch-third-party.component.html, following the pattern of the existing code. There are
 *  several properties you can access from your HTML that should provide all the info needed for the new button. If
 *  additional properties are necessary, add them to this file.
 *  4. Add the new div and anchor to the end of the file. Currently the buttons are ordered by when they were added
 *  to the codebase.
 *  5. Submit a PR against the develop branch.
 *
 *  ## Non WDL platforms
 *
 *  So far Dockstore only has buttons linking to external platforms that run WDL. When buttons are added for
 *  external platforms that support other languages, keep the following in mind:
 *
 *  * The first external non WDL external platform needs to change the `*ngIf` first line of launch-third-party.component.html.
 *  * The `hasHttpImports$` property is specific to WDL, although it can be extended to other languages if necessary.
 *
 */

// tslint:enable:max-line-length

@Component({
  selector: 'app-launch-third-party',
  templateUrl: './launch-third-party.component.html',
  styleUrls: ['./launch-third-party.component.scss'],
  providers: [DescriptorsService, DescriptorsQuery, DescriptorsStore]
})
export class LaunchThirdPartyComponent extends Base implements OnChanges, OnInit {
  /**
   * The workflow
   */
  @Input()
  workflow: Workflow;

  /**
   * The selected workflow version
   */
  @Input()
  selectedVersion: WorkflowVersion;

  /**
   * Indicates whether the selected version has any content
   */
  hasContent$ = this.descriptorsQuery.hasContent$.pipe(share());

  /**
   * Indicates whether the selected version's workflow has any file-based imports.
   */
  hasFileImports$ = this.descriptorsQuery.hasFileImports$;

  /**
   * Indicates whether the selected version's workflow has any http(s) imports.
   * Note: this currently only works for WDL; not clear if needed for CWL yet.
   */
  hasHttpImports$ = this.descriptorsQuery.hasHttpImports$;

  /**
   * A reference to dockstore.model.ts
   */
  config = Dockstore;

  /**
   * The TRS url for the current workflow and selected version.
   * Note: We are using this value as a query param for DNAnexus,
   * even though we should be using the encoded value. But their server
   * works with the value as is, so expose this as well.
   */
  trsUrl: string;

  /**
   * The TRS url for the current workflow and selected version, encoded for use as a query parameter value.
   */
  trsUrlAsQueryValue: string;

  /**
   * The workflow path encoded for use as a query parameter value.
   */
  workflowPathAsQueryValue: string;

  // Note: intentionally not using this.hasContent$ in the next line, as that does not work
  cgcTooltip$: Observable<string> = combineLatest([this.hasContent$, this.hasHttpImports$]).pipe(
    map(([hasContent, hasHttpImports]) => this.sevenBridgesTooltip(hasContent, hasHttpImports, 'the CGC'))
  );

  disableSevenBridgesPlatform$: Observable<boolean> = combineLatest([this.hasContent$, this.hasHttpImports$]).pipe(
    map(([hasContent, hasHttpImports]) => !hasContent || hasHttpImports)
  );

  bdCatalystSevenBridgesTooltip$: Observable<string> = combineLatest([this.hasContent$, this.hasHttpImports$]).pipe(
    map(([hasContent, hasHttpImports]) =>
      this.sevenBridgesTooltip(hasContent, hasHttpImports, 'NHLBI BioData Catalyst powered by Seven Bridges')
    )
  );

  terraTooltip$: Observable<string> = combineLatest([this.hasContent$, this.hasFileImports$]).pipe(
    map(([hasContent, hasFileImports]) => this.terraBasedPlatformTooltip(hasContent, hasFileImports, 'Terra'))
  );

  anvilTooltip$: Observable<string> = combineLatest([this.hasContent$, this.hasFileImports$]).pipe(
    map(([hasContent, hasFileImports]) => this.terraBasedPlatformTooltip(hasContent, hasFileImports, 'AnVIL'))
  );

  bdCatalystTerraTooltip$: Observable<string> = combineLatest([this.hasContent$, this.hasFileImports$]).pipe(
    map(([hasContent, hasFileImports]) =>
      this.terraBasedPlatformTooltip(hasContent, hasFileImports, 'NHLBI BioData Catalyst powered by Terra')
    )
  );

  disableTerraPlatform$: Observable<boolean> = combineLatest([this.hasContent$, this.hasFileImports$]).pipe(
    map(([hasContent, hasFileImports]) => !hasContent || (hasFileImports && !this.isGitHubWorkflow()))
  );

  constructor(
    private workflowsService: WorkflowsService,
    private descriptorTypeCompatService: DescriptorTypeCompatService,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    private gA4GHFilesQuery: GA4GHFilesQuery,
    private descriptorsQuery: DescriptorsQuery,
    private descriptorsService: DescriptorsService
  ) {
    super();
    iconRegistry.addSvgIcon('dnanexus', sanitizer.bypassSecurityTrustResourceUrl('../assets/images/thirdparty/DX_Logo_white_alpha.svg'));
    iconRegistry.addSvgIcon('terra', sanitizer.bypassSecurityTrustResourceUrl('../assets/images/thirdparty/terra.svg'));
    iconRegistry.addSvgIcon('anvil', sanitizer.bypassSecurityTrustResourceUrl('../assets/images/thirdparty/anvil.svg'));
  }

  ngOnInit(): void {
    this.gA4GHFilesQuery
      .getToolFiles(this.descriptorTypeCompatService.stringToDescriptorType(this.workflow.descriptorType), [
        FileTypeEnum.PRIMARYDESCRIPTOR,
        FileTypeEnum.SECONDARYDESCRIPTOR
      ])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(fileDescriptors => {
        if (fileDescriptors && fileDescriptors.length) {
          // No idea if this.workflow.descriptorType is the one that's required or if it's some other enum
          const descriptorType: string = this.workflow.descriptorType;
          this.workflowsService.primaryDescriptor(this.workflow.id, this.selectedVersion.name, descriptorType).subscribe(sourceFile => {
            this.descriptorsService.updatePrimaryDescriptor(sourceFile);
            if (fileDescriptors.some(file => file.file_type === FileTypeEnum.SECONDARYDESCRIPTOR)) {
              this.workflowsService
                .secondaryDescriptors(this.workflow.id, this.selectedVersion.name, descriptorType)
                .subscribe((sourceFiles: Array<SourceFile>) => {
                  this.descriptorsService.updateSecondaryDescriptors(sourceFiles);
                });
            }
          });
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.descriptorsQuery.clear();
    this.trsUrl = this.trsUrlAsQueryValue = this.workflowPathAsQueryValue = null;
    if (this.workflow && this.selectedVersion) {
      this.trsUrl = this.descriptorsService.trsUrl(this.workflow.full_workflow_path, this.selectedVersion.name);
      this.trsUrlAsQueryValue = new HttpUrlEncodingCodec().encodeValue(this.trsUrl);
      this.workflowPathAsQueryValue = new HttpUrlEncodingCodec().encodeValue(this.workflow.full_workflow_path);
    }
  }

  private sevenBridgesTooltip(hasContent: boolean, hasHttpImports: boolean | any, platform: string): string {
    if (!hasContent) {
      return 'The CWL has no content.';
    }
    if (hasHttpImports) {
      return `This version of the CWL has http(s) imports, which are not supported by ${platform}. Select a version without http(s) imports.`;
    }
    return `Export this workflow version to ${platform}.`;
  }

  private isGitHubWorkflow(): boolean {
    return this.workflow && this.workflow.gitUrl && this.workflow.gitUrl.startsWith('git@github.com');
  }

  private terraBasedPlatformTooltip(hasContent: boolean, hasFileImports: boolean, platform: string): string {
    if (!hasContent) {
      return 'The WDL has no content.';
    }
    if (!this.isGitHubWorkflow() && hasFileImports) {
      return `This version of the WDL has file-path imports, which are only supported by ${platform} for GitHub-based workflows.`;
    }
    return `Export this workflow version to ${platform}.`;
  }
}
