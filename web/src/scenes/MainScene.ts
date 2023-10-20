import Phaser from 'phaser';
import Boss from '../classes/Boss';
import Card from '../classes/Card';
import { 
    shuffleDeck, 
    drawCards,
    canvasWidth,
    canvasHeight,
    cardHeight,
    cardWidth,
    padding,
    startingX
} from '../utils/DeckManagement';

export default class MainScene extends Phaser.Scene {
  private boss?: Boss;
  private deck: Card[] = [];
  private hand: Card[] = [];
  private played: Card[] = [];
  private discarded: Card[] = [];
  private turns: number = 5;
 
  constructor() {
    super({ key: 'MainScene' });
    console.log('here')

  }

  preload() {
    this.load.image('bossSprite', '../assets/bossSprite.png');
    this.load.image('cardSprite', '../assets/cardSprite.png');
  }

  create() {
    // Initialize Boss
    this.boss = new Boss(this, (canvasWidth - cardWidth) / 2, 100);
    this.add.existing(this.boss);

    // Initialize Deck
    for (let i = 0; i < 10; i++) {
      const card = new Card(this);
      this.add.existing(card);
      this.deck.push(card);
    }

    // Start the game
    this.startGame();
  }

  startGame() {
    let currentTurn = 0;

    const gameLoop = () => {
      if (currentTurn >= this.turns) {
        this.endGame();
        return;
      }

        if(this.deck.length > 0) {
            // Draw 3 cards into hand
            this.hand = drawCards(this.deck, this.discarded);


            // Choose one card to play (for demonstration, choosing the first card)
            const chosenCard = this.hand[0];

            this.playCard(chosenCard);

            // Discard the other cards
            this.discarded.push(...this.hand.slice(1));
            this.discarded.forEach(card => card.setVisible(false)); // set discarded cards to invisible


            // Execute attacks until all played cards are dead
            while (this.played.length > 0) {
                // Cards attack the boss
                this.played.forEach((card) => {
                card.attack(this.boss!);
                });

                // Boss attacks one of the played cards (for demonstration, attacking the first card)
                this.boss!.attack(this.played[0]);

                // Remove dead cards from played array
                this.played = this.played.filter((card) => card.health > 0);
            }
        }
      currentTurn++;
      setTimeout(gameLoop, 2000);
    };

    gameLoop();
  }

  endGame() {
    // Check win/loss conditions
    if (this.boss && this.boss.health <= 0) {
      console.log('You win!');
    } else {
      console.log('You lose!');
    }
  }
  playCard(card: Card) {
    card.x = startingX + this.played.length * (cardWidth + padding);
    card.y = 300;
    this.played.push(card);
  }
}
