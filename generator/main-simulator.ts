import MechanicsGenerator from './MechanicsGenerator';
import ImageGenerator from './ImageGenerator';

import dotenv from 'dotenv';
import Card, { ICard, State } from '../web/src/mechanics/Card';
import Boss from '../web/src/mechanics/Boss';
import GameState, { EVENT_GAME_OVER } from '../web/src/mechanics/GameState';
import fs from 'fs';
import { Semaphore } from 'async-mutex'; // Assuming you have installed a package for semaphore
import path from 'path';

dotenv.config();

class SimResult {
  totalGames: number = 0;
  gamesWon: number = 0;
}

async function isFunGameFile(gameFile: any) {
  let gameOver: boolean = false;
  let result = new SimResult()

  while(result.totalGames < 100) {
    gameOver = false;
    const cards = gameFile.filter((c:ICard) => !c.isBoss).map((c: ICard) => new Card(c.name, c.health, c.attack));
    const boss = gameFile.filter((c:ICard) => c.isBoss).map((c: ICard) => new Boss(c.name, c.health, c.attack)).pop();
    const gameState = new GameState();
    gameState.on(EVENT_GAME_OVER, () => { gameOver = true; });
  
    gameState.create(cards, boss!);
    gameState.nextTurn();   // gotta start it once and then playCard auto goes to next turn
    while(gameOver == false) {  
    
      const hand = gameState.getCards(State.Hand);
      gameState.playCard(hand[0]);
    }

    result.totalGames++;
    if(gameState.boss.health <= 0) {
      result.gamesWon++;
    }
  }

  return result.gamesWon / result.totalGames > 0.3 && result.gamesWon / result.totalGames < 0.8;
}


async function generateImages(gameFile: any[]): Promise<void> {
  const semaphore = new Semaphore(5);
  const gen = new ImageGenerator();
  const tasks: Promise<void>[] = [];

  for (const card of gameFile) {
    const name = card['name'];
    const p1 = `Magestic and fantasy looking ${name}.  To be used in a card game following the style of Hearthstone.`;
    tasks.push(gen.getImage(p1, name, semaphore));
  }

  const results: any[] = await Promise.all(tasks);

  for( const img of results) {
    const name = img[0];
    const binary = img[1];
    fs.writeFileSync(
      path.join('../web/public/assets', `${name}.png`),
      binary
    );
  }
}

async function main() {
  const mechanics = new MechanicsGenerator();
  let isFun: boolean = false;
  let gameFile: any = null;
  while(isFun == false) {
    // generate game file
    gameFile = await mechanics.getJsonAsDictionary('dragon scale armor'); //as Card[];
    // simulate game file
    isFun = await isFunGameFile(gameFile);
  }

  fs.writeFileSync('../web/public/assets/game_file.json', JSON.stringify(gameFile));

  // generate image files
  generateImages(gameFile);

}

main().catch(err => {
  console.error(err);
});
