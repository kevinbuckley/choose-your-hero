import MechanicsGenerator from './MechanicsGenerator';
import dotenv from 'dotenv';
import Card, { ICard } from '../web/src/mechanics/Card';
import Boss from '../web/src/mechanics/Boss';
import GameState from '../web/src/mechanics/GameState';

dotenv.config();

async function main() {
  const mechanics = new MechanicsGenerator();
  console.time('getJsonAsDictionary');
  // generate game file
  const gameFile = await mechanics.getJsonAsDictionary('Loki'); //as Card[];
  console.log(gameFile);
  
  const cards = gameFile.filter((c:ICard) => !c.isBoss).map((c: ICard) => new Card(c.name, c.health, c.attack));
  const boss = gameFile.filter((c:ICard) => c.isBoss).map((c: ICard) => new Boss(c.name, c.health, c.attack)).pop();
  

  const gameState = new GameState();
  
  
  gameState.create(cards, boss!);

  // simiulate a 100 games
  // print out success rate

  
  console.timeEnd('getJsonAsDictionary');

}

main().catch(err => {
  console.error(err);
});
