import { Events } from 'phaser';
import { EVENT_HEALTH_CHANGED } from './GameState';

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
  }
}
