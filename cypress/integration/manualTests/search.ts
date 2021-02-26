describe('Admin UI', () => {
  before(() => {
    cy.visit('');
    cy.get('a').contains('Search').click();
  });

  describe('Basic search functions', () => {
    it('should arrive on the correct page', () => {
      cy.url().should('include', '/search');
    });
    it('should be able to select facet', () => {
      cy.get('mat-checkbox').parent().contains('workflow').click();
      cy.contains('the Entry Type is workflow');
      cy.url().should('include', '/search?_index=workflow');
    });
    it('should be able to handle the back button', () => {
      cy.go('back');
      cy.url().should('not.include', '/search?_index=workflow');
      cy.contains('the Entry Type is workflow').should('not.exist');
    });
    it('should be able to use basic search box and have suggestions', () => {
      cy.get('[data-cy=basic-search]').type('dockstore_d');
      cy.contains(' Sorry, no matches found for dockstore_d');
      cy.contains('Do you mean: dockstore?');
      cy.url().should('include', '/search?search=dockstore_');
    });

    it('should reset filters', () => {
      cy.contains('Reset Filters').click();
      cy.url().should('include', '/search');
    });

    it('should remember paginator setting', () => {
      cy.contains('Items per page');
      cy.get('[data-cy=search-tool-table-paginator]').within(() => {
        cy.get('.mat-paginator-range-label').contains('10 of');
      });
      cy.get('[data-cy=search-tool-table-paginator]').contains(10).should('be.visible').click();
      cy.get('mat-option').contains(20).click();
      cy.get('[data-cy=search-tool-table-paginator]').within(() => {
        cy.get('.mat-paginator-navigation-next').click();
      });
      cy.get('[data-cy=search-tool-table-paginator]').within(() => {
        cy.get('.mat-paginator-range-label').contains('40 of');
      });
      cy.get('[data-cy=search-tool-table-paginator]').contains(20);
      cy.get('a').contains('Organizations').click();
      cy.go('back');
      cy.get('[data-cy=search-tool-table-paginator]').within(() => {
        cy.get('.mat-paginator-range-label').contains('40 of');
      });
      cy.get('[data-cy=search-tool-table-paginator]').contains(20);
      cy.contains('pancancer/pcawg-dkfz-workflow').should('not.exist');
    });
    it('should have basic search and advanced search mutually exclusive', () => {
      cy.get('[data-cy=basic-search]').type('dockstore_');
      cy.contains('Open Advanced Search').click();
      cy.contains('button', /^Advanced Search$/)
        .should('be.visible')
        .click();
      cy.url().should('not.include', '/search?search=dockstore_');
    });
  });
});
