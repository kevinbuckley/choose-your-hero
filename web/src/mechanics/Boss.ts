import { EventEmitter } from 'events';
import { EVENT_HEALTH_CHANGED, EVENT_CARD_DIED, EVENT_CARD_RESET } from './GameEvents';

export class Boss extends EventEmitter {
  name: string;
  health: number;
  healthOriginal: number;
  attack: number;
  constructor(name: string, attack: number, health: number) {
    super();
    this.name = name;
    this.health = health;
    this.healthOriginal = health;
    this.attack = attack;
  }

  reset() {
    this.health = this.healthOriginal;
    this.emit(EVENT_HEALTH_CHANGED, this.health);  
    this.emit(EVENT_CARD_RESET);
  }

  attacked(attackPower: number) {
    this.health = Math.max(0, this.health - attackPower);
    console.log(`Boss attacked with ${attackPower} damage. Health left: ${this.health}`);
    
    this.emit(EVENT_HEALTH_CHANGED, this.health);  
    if(this.isDead()) {
      this.died();
    }
  }

  died() {
    this.emit(EVENT_CARD_DIED, this.health);    
  }

  isDead(): boolean {
    return this.health <= 0;
  }
  

}
