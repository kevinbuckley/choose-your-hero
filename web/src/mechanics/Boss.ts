import { Events } from 'phaser';

export const EVENT_HEALTH_CHANGED: string = 'healthChanged';

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
