import { Events } from 'phaser';
import { EVENT_HEALTH_CHANGED, EVENT_CARD_DIED } from './GameState';

export default 
class Boss extends Events.EventEmitter {
  health: number;
  attack: number;
  constructor(health: number, attack: number) {
    super();
    this.health = health;
    this.attack = attack;
  }

  attacked(attackPower: number) {
    this.health -= attackPower;
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
