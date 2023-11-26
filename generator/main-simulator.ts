import MechanicsGenerator from './MechanicsGenerator';
import dotenv from 'dotenv';
import { Card, ICard, State } from '../web/src/mechanics/Card';
import { Boss } from '../web/src/mechanics/Boss';
import { GameState } from '../web/src/mechanics/GameState';
import { EVENT_GAME_OVER } from '../web/src/mechanics/GameEvents';
import fs from 'fs';
import { Semaphore } from 'async-mutex'; // Assuming you have installed a package for semaphore
import path from 'path';
import sharp from 'sharp';

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
    const cards = gameFile.filter((c:ICard) => !c.isBoss).map((c: ICard) => new Card(c.name, c.attack, c.health));
    const boss = gameFile.filter((c:ICard) => c.isBoss).map((c: ICard) => new Boss(c.name, c.attack, c.health)).pop();
    const gameState = new GameState(
      () => { return Promise.resolve(); }, 
      () => { return Promise.resolve(); }, 
      () => { return Promise.resolve(); }
    );
    gameState.on(EVENT_GAME_OVER, () => { gameOver = true; });
  
    gameState.create(cards, boss!);
    gameState.nextTurn();   
    while(gameOver == false) {  
    
      const hand = gameState.getCards(State.Hand);
      const bestCard = hand.length > 1 ? hand.reduce((prev: Card, curr: Card) => curr?.attack > prev?.attack ? curr : prev ) : hand[0];
      console.log(`Playing ${bestCard.name} with health ${bestCard.health} and attack ${bestCard.attack}`);
      await gameState.playCard(bestCard);
    }

    result.totalGames++;
    if(gameState.boss.health <= 0) {
      result.gamesWon++;
    }
    console.log(`${result.gamesWon}/${result.totalGames}`);
  }

  return result.gamesWon / result.totalGames > 0.1 && result.gamesWon / result.totalGames < 0.98;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function generateImages(gameFile: any[]): Promise<void> {
  const semaphore = new Semaphore(5);
  const tasks: Promise<void>[] = [];

  for (const card of gameFile) {
    const name = card['name'];
    const p1 = `Magestic, fantasy, zoomed in picture of a ${name}.  Make it easy to understand.`;
    // @ts-ignore
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: p1,
      n: 1,
      size: "1024x1024",
      response_format: 'b64_json'
    });
    console.log(response.data[0].revised_prompt);
    const imageSavePath = path.join('./temp', `${name}.png`);
    base64ToPng(response.data[0].b64_json!, imageSavePath);
    await sleep(9000);
    cropAndCopy(imageSavePath, name);
  }
}
function cropAndCopy(inputPath: string, name: string) {
  
  const outputPath = path.join('../web/public/assets', `${name}.png`);
  sharp(inputPath)
    .extract({ width: 708, height: 1024, left: 157, top: 0 }) // Crop dimensions
    .resize(180, 260) // Resize
    .toFile(outputPath)
    .then(() => console.log(`${name} cropped`));
}

function base64ToPng(b64Json: string, outputPath: string) {
  const imageBuffer = Buffer.from(b64Json, 'base64');
  fs.writeFileSync(outputPath, imageBuffer);
}



async function main() {
  const mechanics = new MechanicsGenerator();
  let isFun: boolean = false;
  let gameFile: any = null;
  while(isFun == false) {
    console.log('starting while loop');
    gameFile = await mechanics.getJsonAsDictionary('Medieval War'); //as Card[];
    console.log('got game file: ' + JSON.stringify(gameFile));
    // simulate game file
    isFun = await isFunGameFile(gameFile);
    isFun = true;
    console.log(isFun);
    console.log(gameFile);
  }

  fs.writeFileSync('../web/public/assets/game_file.json', JSON.stringify(gameFile));

  // generate image files
  generateImages(gameFile);

}

main().catch(err => {
  console.error(err);
});
