
import Boss from './Boss';
import Card, {State} from '../classes/Card';
import { Events } from 'phaser';

export const EVENT_HEALTH_CHANGED: string = 'healthChanged';

class GameState extends Events.EventEmitter {
    private deck: Card[] = [];
    private boss: Boss;
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
  
    // Method to go to the next turn
    nextTurn(): void {
      this.turn++;
      this.emit('nextTurn', this.turn);
      // Implement other logic for progressing to the next turn
    }
  
    // Add other methods to manipulate the game state
  }
  
  export default GameState;