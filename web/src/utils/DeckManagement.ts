import Card from '../classes/Card';

export function shuffleDeck(deck: Card[]): Card[] {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function drawCards(deck: Card[], discardedCards: Card[], numCards: number = 3): Card[] {
    const drawnCards: Card[] = [];
  
    for (let i = 0; i < numCards; i++) {
      if (deck.length === 0) {
        // Reshuffle the deck if it's empty
        shuffleDeck(discardedCards);
        deck.push(...discardedCards);
        discardedCards.length = 0;
      }
  
      const card = deck.pop();
      if (card) {
        drawnCards.push(card);
        console.log(card.name);
        card.setVisible(true);

        card.setPosition(startingX + (i * (cardWidth + padding)), 500);
        card.x = startingX + (i * (cardWidth + padding));
        card.y = 500;
      }
    }
  
    return drawnCards;
  }
  
  export const canvasWidth: number = 800;
  export const canvasHeight: number = 600;
  export const cardWidth: number = 100;
  export const cardHeight: number = 150;
  export const padding: number = 10;
  export const startingX: number = (canvasWidth - (cardWidth * 3 + padding * 2)) / 2;