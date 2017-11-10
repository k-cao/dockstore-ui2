/*
 *    Copyright 2017 OICR
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

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-docs',
  templateUrl: './docs.component.html'
})
export class DocsComponent implements OnInit {

  // Array of doc objects, where existingPath is the path on Dockstore, and newPath is the new path on the docs page
  private docMapping = [
    { existingPath: '/docs/faq', newPath: '/faq' },
    { existingPath: '/docs/getting-started-with-docker', newPath: '/docs/prereqs/getting-started-with-docker/' },
    { existingPath: '/docs/getting-started-with-cwl', newPath: '/docs/prereqs/getting-started-with-cwl/' },
    { existingPath: '/docs/getting-started-with-dockstore', newPath: '/docs/publisher-tutorials/getting-started-with-dockstore/' },
    { existingPath: '/docs/search', newPath: '/docs/user-tutorials/faceted-search/' },
    { existingPath: '/docs/launch', newPath: '/docs/user-tutorials/launch/' },
    { existingPath: '/docs/developers', newPath: '/docs/publisher-tutorials/for-developers/' },
    { existingPath: '/docs/docker_registries', newPath: '/docs/publisher-tutorials/docker-registries/' },
    { existingPath: '/docs/public_private_tools', newPath: '/docs/publisher-tutorials/public-and-private-tools/' },
    { existingPath: '/docs/workflows', newPath: '/docs/publisher-tutorials/workflows/' },
    { existingPath: '/docs/best-practices', newPath: '/docs/publisher-tutorials/best-practices/' },
    { existingPath: '/docs/advanced-features', newPath: '/docs/publisher-tutorials/advanced-features/' },
    { existingPath: '/docs/aws-batch-tutorial', newPath: '/docs/publisher-tutorials/aws-batch/' },
    { existingPath: '/docs/azure-batch-tutorial', newPath: '/docs/publisher-tutorials/azure-batch/' },
  ]
  public redirectLink = this.getLink();
  constructor() { }

  ngOnInit() {
  }


  getPath() {
    return window.location.pathname;
  }
  // Generate redirect link based on path
  getLink() {
    var currentPath = window.location.pathname;
    var redirectBase = 'http://docs.dockstore.org'
    var redirectPath = '/docs'

    // Iterate over each docMapping
    for (let doc of this.docMapping) {
      // Remove trailing /
      var filteredPath = currentPath.replace(/\/$/, "");
      if (filteredPath == doc.existingPath) {
        redirectPath = doc.newPath;
        break;
      }
    }
    return redirectBase + redirectPath;
  }

  // Return a link with no HTTP(S)://
  getPrettyLink() {
    return this.redirectLink.replace(/(^\w+:|^)\/\//, '');
  }

}
