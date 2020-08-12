import { goToTab } from '../../support/commands';

// TODO: for clarity and future debugging refactor variable names to use 'namespace', 'entry-name', call those variable names in methods
const username = 'dockstoretestuser4';
// tuples of registry, repo namespace (username), and entry-name (repo name)
const toolTuple = ['github.com', username, 'dockstore-tool-md5sum'];
const workflowTuple = ['github.com', username, 'hello-dockstore-workflow'];
// tuple of organization name, collection name
const collectionTuple = ['test', 'testcollection'];

// get the dockstore token from env variable and put it in local storage
function storeToken() {
  window.localStorage.setItem('ng2-ui-auth_token', Cypress.env('TOKEN'));
}

function unpublishTool() {
  it('unpublish the tool', () => {
    storeToken();
    cy.get('#publishToolButton').contains('Unpublish').click();
  });
}

function deleteTool() {
  it('delete the tool', () => {
    // why wait?
    cy.wait(1000);
    cy.contains('button', 'Delete').should('be.visible');
    cy.get('#deregisterButton').click();
    cy.contains('div', 'Are you sure you wish to delete this tool?').within(() => {
      cy.contains('button', 'Delete').click();
    });
    cy.contains('There are currently no tools registered under this account');
  });
}

function registerQuayTool(repo: string, name: string) {
  it('register and publish - quickly register quay.io tools option', () => {
    storeToken();

    // define routes to watch for
    cy.server();
    // get quay.io organization/namespaces accessible to user
    cy.route('/api/users/dockerRegistries/quay.io/organizations').as('orgs');
    // cy.route('**/tokens').as('tokens');
    cy.route('**/repositories').as('repos');
    cy.route('**/containers').as('containers');
    cy.route('post', '**/publish').as('publish');

    cy.visit('/my-tools');
    // click thru the steps of registering a tool
    // cy.wait('@tokens');
    cy.wait(2000);
    // cy.wait('@containers');
    // cy.get('#register_tool_button').should('be.visible').and('contains', 'Register tool').click();
    cy.get('#register_tool_button').click();
    cy.wait('@orgs');
    // cy.wait(1000);
    cy.get('mat-dialog-content').within(() => {
      cy.contains('mat-radio-button', 'Quickly register Quay.io tools').click();
      cy.contains('button', 'Next').click();
      cy.contains('mat-form-field', 'Select namespace').click();
    });
    cy.contains('mat-option', repo).click();
    cy.wait('@repos');
    cy.get('mat-dialog-content').within(() => {
      cy.contains('div', name).within(() => {
        cy.contains('mat-icon', 'sync').click();
      });
    });
    cy.wait('@containers');
    cy.contains('button', 'Finish').click();
    // cy.wait(1000);
    // cy.get('#publishToolButton').should('be.visible').and('contains', 'Publish');
    cy.get('#publishToolButton').click();
    cy.wait('@publish');
    // cy.wait('@containers');
  });
}

function registerRemoteSitesTool(repo: string, name: string) {
  it('register and publish - create tool remote sites option', () => {
    storeToken();
    // define routes to watch for
    cy.server();
    cy.route('post', '**/publish').as('publish');

    cy.visit('/my-tools');
    cy.wait(2000);
    cy.get('#register_tool_button').click();
    cy.get('mat-dialog-content').within(() => {
      cy.contains('mat-radio-button', 'Create tool with descriptor(s) on remote sites').click();
      cy.contains('button', 'Next').click();
      cy.get('#sourceCodeRepositoryInput').type(`${repo}/${name}`);
      cy.get('#imageRegistryInput').type(`${repo}/${name}`);
      cy.contains('button', 'Add Tool').click();
    });
    cy.get('#publishToolButton').click();
    cy.wait('@publish');
  });
}

function registerToolOnDockstore(repo: string, name: string) {
  it('register - create tool on Dockstore option', () => {
    storeToken();

    // define routes to watch for
    cy.server();

    cy.visit('/my-tools');
    cy.get('#register_tool_button').click();
    cy.get('mat-dialog-content').within(() => {
      cy.contains('mat-radio-button', 'Create tool with descriptor(s) on Dockstore.org').click();
      cy.contains('button', 'Next').click();
      cy.wait(1000);
      cy.get('#hostedImagePath').type(`${repo}/${name}`);
      cy.contains('button', 'Add Tool').click();
    });
    // should not be able to publish because there should be no files or versions
    cy.contains('button', 'Publish').should('be.disabled');
  });
}

function testTool(registry: string, repo: string, name: string) {
  describe('Register, publish, unpublish, and delete a tool', () => {
    registerQuayTool(repo, name);
    unpublishTool();
    deleteTool();

    registerRemoteSitesTool(repo, name);
    unpublishTool();
    deleteTool();

    registerToolOnDockstore(repo, name);
    deleteTool();
  });

  // disable test until hiding versions for Tools are working on dev
  // describe('Hide and un-hide a tool version', () => {
  //   registerQuayTool(repo, name);
  //   it('hide a version', () => {
  //     goToTab('Versions');
  //     cy.contains('button', 'Actions').should('be.visible');
  //     cy.contains('td', 'Actions')
  //       .first()
  //       .click();
  //     cy.contains('button', 'Edit').click();
  //     cy.contains('div', 'Hidden:').within(() => {
  //       cy.get('[name=checkbox]').click();
  //     });
  //     cy.contains('button', 'Save Changes').click();
  //     cy.get('[data-cy=hiddenCheck]').should('have.length', 1);
  //   });
  //   it('refresh namespace', () => {
  //     cy.contains('button', 'Refresh Namespace')
  //       .first()
  //       .click();
  //     // check that the 'refresh succeeded' message appears
  //     cy.contains('succeeded');
  //   });
  //   unpublishTool();
  //   deleteTool();
  // });
}

function testWorkflow(registry: string, repo: string, name: string) {
  describe('Refresh, publish, unpublish, and restub a workflow', () => {
    it('refresh and publish', () => {
      storeToken();

      // define routes to watch for
      cy.server();
      cy.route('**/tokens').as('tokens');
      cy.route('**/workflows/path/workflow/**').as('workflow');

      cy.visit(`/my-workflows`);
      cy.wait('@tokens');
      cy.wait('@workflow');
      cy.get('[data-cy=refreshButton]').click();

      cy.contains('button', 'Publish').should('be.enabled').click();
    });
    it('snapshot', () => {
      // define routes to watch for
      cy.server();

      goToTab('Versions');
      cy.contains('button', 'Actions').should('be.visible');
      cy.contains('td', 'Actions')
        .first()
        .click();
      // WARNING: don't actually snapshot since it can't be undone
      cy.get('.mat-menu-content').within(() => {
        cy.contains('button', 'Snapshot');
        cy.contains('button', 'Edit').click();
      });
      cy.contains('button', 'Cancel').click();
    });
    it('unpublish and stub', () => {
      storeToken();
      cy.get('#publishButton').contains('Unpublish').click({ force: true });

      goToTab('Info');
      cy.contains('button', 'Restub').click();
      cy.contains('button', 'Publish').should('be.disabled');
    });
  });
}

function testCollection(org: string, collection: string, registry: string, repo: string, name: string) {
  describe('add entry to and remove from collection', () => {
    registerQuayTool(repo, name);
    it('be able to add an entry to the collection', () => {
      storeToken();
      // define routes to watch for
      cy.server();
      cy.route('**/collections').as('collections');
      cy.route('post', '**/collections/**').as('postToCollection');
      cy.visit(`/containers/quay.io/${repo}/${name}:develop?tab=info`);
      cy.wait('@collections');
      cy.get('#addToolToCollectionButton')
        .should('be.visible')
        .click();
      cy.get('#addEntryToCollectionButton').should('be.disabled');
      cy.get('#selectOrganization').click();
      cy.get('mat-option')
        .contains(org)
        .click();
      cy.get('#addEntryToCollectionButton').should('be.disabled');
      cy.get('#selectCollection').click();
      cy.get('mat-option')
        .contains(collection)
        .click();
      cy.get('#addEntryToCollectionButton')
        .should('not.be.disabled')
        .click();
      cy.wait('@postToCollection');
      cy.get('#addEntryToCollectionButton').should('not.be.visible');
      cy.get('mat-progress-bar').should('not.be.visible');
    });

    it('be able to remove an entry from a collection', () => {
      storeToken();
      cy.visit(`/organizations/${org}/collections/${collection}`);
      cy.contains(`quay.io/${repo}/${name}`);
      cy.get('#removeEntryButton').click();
      cy.get('#accept-remove-entry-from-org').click();
      cy.contains('This collection has no associated entries');
      cy.visit(`/organizations/${org}`);
      cy.contains('Members').should('be.visible');
      cy.visit('/my-tools');
    });
    unpublishTool();
    deleteTool();
  });
}

testCollection(collectionTuple[0], collectionTuple[1], toolTuple[0], toolTuple[1], toolTuple[2]);
testTool(toolTuple[0], toolTuple[1], toolTuple[2]);
testWorkflow(workflowTuple[0], workflowTuple[1], workflowTuple[2]);
