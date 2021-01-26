/// <reference types="Cypress" />

// context
describe("Welcome Page", () => {
	beforeEach(() => {
		cy.visit("/");
	})
	// specify
	it("User doesn't type any name but click on play button", () => {
		cy.get('button').click();
		cy.get(".error").should("have.text", "You must introduce 2 names");
	});

	it("User only inserts the first name", () => {
		cy.get(".namesContainer div input").first().type("Name0", {delay: 125});
		cy.get('button').click();
		cy.get(".error").should("have.text", "You must introduce 2 names");
	});
});

describe("Game Board", () => {
	describe("Player 0 selects all cells", () => {
		beforeEach(() => {
			cy.visit("/");
			cy.get(".namesContainer div input").first().type("Name0");
			cy.get(".namesContainer div input").eq(1).type("Name1");
			cy.get('button').click();
		});

		for (let i = 0; i < 9; i++) {
			it(`Player0 selects the cell ${i}`, () => {
				cy.get(".board .row .col").eq(i).click();
				cy.get(".board .row .col").eq(i).should("have.class", "player0");
				cy.get(".playerTurn").should("have.text", "Name1's turn");
			});
		}
	});

	describe("Player 1 selects all cells", () => {
		beforeEach(() => {
			cy.visit("/");
			cy.get(".namesContainer div input").first().type("Name0");
			cy.get(".namesContainer div input").eq(1).type("Name1");
			cy.get('button').click();
		});

		it("Player1 selects the cell 0", () => {
			// Player0
			cy.get(".board .row .col").eq(1).click();
			// Player1
			cy.get(".board .row .col").eq(0).click();
			cy.get(".board .row .col").eq(0).should("have.class", "player1");
			cy.get(".playerTurn").should("have.text", "Name0's turn");
		});

		describe("Player1 keep selecting cells", () => {
			beforeEach(() => {
				// Player0
				cy.get(".board .row .col").eq(0).click();
			})
			for (let i = 1; i < 9; i++) {
				// Player1
				it(`Player0 selects the cell ${i}`, () => {
					cy.get(".board .row .col").eq(i).click();
					cy.get(".board .row .col").eq(i).should("have.class", "player1");
					cy.get(".playerTurn").should("have.text", "Name0's turn");
				});
			}
		})
	});
});
