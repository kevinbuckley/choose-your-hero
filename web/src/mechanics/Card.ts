import { Events } from 'phaser';
import { EVENT_HEALTH_CHANGED, EVENT_CARD_DIED } from './GameState';

export default 
class Card extends Events.EventEmitter {
  name: string;
  attack: number;
  health: number;
  healthOriginal: number;
  constructor(name: string, attack: number, health: number) {
    super();
    this.name = name;
    this.attack = attack;
    this.health = health;
    this.healthOriginal = health;
  }

  attacked(attackPower: number) {
      this.health -= attackPower;
      this.emit(EVENT_HEALTH_CHANGED, this.health);  

      if (this.isDead()) {
        this.die();
      }
  }
  isDead(): boolean {
    return this.health <= 0;
  }

  die() {
    this.emit(EVENT_CARD_DIED, this);
  }

  revive() {
    this.health = this.healthOriginal;
    this.emit(EVENT_HEALTH_CHANGED, this.health);
  }

}
  