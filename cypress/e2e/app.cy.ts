describe('EarthForUs App Smoke', () => {
  it('loads landing page', () => {
    cy.visit('/');
    cy.contains('EarthForUs');
  });

  it('navigates to events list', () => {
    cy.visit('/events');
    cy.contains('Discover Events');
  });

  it('opens an event detail', () => {
    cy.visit('/events/974ca4da-6299-4b32-a2c5-793ef18ca40f');
    cy.url().should('match', /\/events\//);
  });
});