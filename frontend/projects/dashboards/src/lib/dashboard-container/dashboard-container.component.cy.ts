import { DashboardContainerComponent } from "./dashboard-container.component";

describe('DashboardContainerComponent', () => {
    beforeEach(() => {
      cy.mount(DashboardContainerComponent);
    });
  
    it('should render the gridster with the correct options', () => {
      cy.get('gridster')
        .should('exist')
        .and('have.css', 'background-color', 'rgb(220, 220, 220)'); // Gainsboro color
    });
  
    it('should render each gridster-item with correct widget', () => {
      cy.get('gridster-item').each(($item, index) => {
        cy.wrap($item).within(() => {
          cy.get('vis-widget').should('exist');
        });
      });
    });
  
    it('should trigger update and resize events on gridster-item', () => {
      cy.get('gridster-item').first().trigger('itemResize');
      cy.get('@updateString').should('have.been.called');
  
      cy.get('gridster-item').first().trigger('itemChange');
      cy.get('@updateString').should('have.been.called');
    });
  
    it('should handle widget header interactions correctly', () => {
      cy.get('vis-widget-header').first().within(() => {
        cy.get('button.update-widget').click();
        cy.get('@onUpdateWidget').should('have.been.called');
        cy.get('button.delete-widget').click();
        cy.get('@onDeleteWidget').should('have.been.called');
      });
    });
  
    it('should handle widget data load and filter update events', () => {
      cy.get('vis-widget').first().within(() => {
        cy.get('@onDataLoad').should('have.been.called');
        cy.get('@onUpdateFilter').should('have.been.called');
      });
    });
  });
  