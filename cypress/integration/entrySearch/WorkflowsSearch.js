/*
 *    Copyright 2018 OICR
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
describe('Dockstore workflow list page', function () {
  require('../helper.js')
  describe('Select a workflow', function () {
    it('Should be able to go to the workflows search page', function () {
      cy.visit(String(global.baseUrl) + "/search-workflows")
    });
    it('Should display the correct url', function () {
      cy.get('mat-cell')
        .find('a')
        .contains(/\bl\b/)
        .should('have.attr', 'href', '/workflows/github.com/A/l')
        .should('not.have.attr', 'href', '/workflows/github.com%20A%20l')
    });
    // 1 workflow A/l, no checkers from other tests added
    it('Should have 1 workflow', function () {
      cy
        .get('mat-row')
        .should('have.length', 1)
    });
    it('Should be able to go to the github.com/A/l workflow', function () {
      cy
        .get('mat-cell')
        .find('a')
        .contains(/\bl\b/)
        .click()
        .get('#workflow-path')
        .should('contain', 'github.com/A/l')
    });
  });
})
