
import Boss from './Boss';
import Card from '../mechanics/Card';
import { Events } from 'phaser';

export const EVENT_HEALTH_CHANGED: string = 'healthChanged';
export const EVENT_CARD_DIED: string = 'cardDied';

class GameState extends Events.EventEmitter {
    deck: Card[] = [];
    private boss: Boss;
    private played: Card[] = [];
    private turn: number = 0;
    cardNames: string[] = [
        'Boba Fett',
        'Captain Phasma',
        'Clone Trooper',
        'DarthMaul',
        'General Grievous',
        'Jango Fett',
        'Stormtrooper',
        'Tusken Raider',
        'Vader'
      ];

    constructor() {
      super();
      this.create();
      // Initialize boss and cards if needed
    }

   
    create() {
      this.boss = new Boss(400, 10);
      // Initialize Deck
      for (let i = 0; i < this.cardNames.length; i++) {
        // Pick a random card from the deck 
        const attack  = Math.floor(Math.random() * (10 - 2 + 1) + 2);  // Random integer between 2 and 10
        const health = Math.floor(Math.random() * (20 - 10 + 1) + 10); 
        const card = new Card(this.cardNames[i], attack, health);
        this.deck.push(card);
      }
    }

    // Method to add a card to the game state
    addCard(card: Card): void {
      this.deck.push(card);
      this.emit('cardAdded', card);
    }
  
    // Method to perform an attack
    attackBoss(card: Card): void {
      if (this.boss.health <= 0) {
        this.emit('bossDefeated', this.boss);
        return;
      }
  
      this.boss.attacked(card.attack);
      this.emit('bossAttacked', this.boss);
  
      if (this.boss.health <= 0) {
        this.emit('bossDefeated', this.boss);
      }
    }


    attackRound() {
        const playedoriginal: Card[] = this.played;

        while (this.played.length > 0) {
            // Cards attack the boss
            this.played.forEach((card) => {
                card.attack(this.boss!);
                this.boss.attacked(card.attackPower);
            });

            // BossCard attacks one of the cards at random
            const target = this.played[Math.floor(Math.random() * this.played.length)];
            target.attacked(this.boss.attack);
            
            // Remove dead cards from played array
            this.played = this.played.filter((card) => card.card.health > 0);
        }
        this.played = playedoriginal;
    }

  
    // Method to go to the next turn
    nextTurn(): void {
      this.turn++;
      this.emit('nextTurn', this.turn);
      // Implement other logic for progressing to the next turn
    }
  
    // Add other methods to manipulate the game state
  }
  
  export default GameState;