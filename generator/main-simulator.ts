import MechanicsGenerator from './MechanicsGenerator';
import dotenv from 'dotenv';
import { Card, ICard, State } from '../web/src/mechanics/Card';
import { Boss } from '../web/src/mechanics/Boss';
import { GameState } from '../web/src/mechanics/GameState';
import { EVENT_GAME_OVER } from '../web/src/mechanics/GameEvents';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import sharp from 'sharp';
import { ThreadMessagesPage } from 'openai/resources/beta/threads/messages/messages';

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
async function generateImages(theme: string, gameFile: any[]): Promise<void> {
  const openai = new OpenAI();

  for (const card of gameFile) {
    const name = card['name'];
    const p1 = `Magestic, fantasy, zoomed in picture of a ${name} in the theme of ${theme}.  Make it easy to understand.`;
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
    await cropAndCopy(imageSavePath, name);
  }
}
async function cropAndCopy(inputPath: string, name: string) {
  
  const outputPath = path.join('../web/public/assets', `${name}.png`);
  await sharp(inputPath)
    .extract({ width: 708, height: 1024, left: 157, top: 0 }) // Crop dimensions
    .resize(180, 260) // Resize
    .toFile(outputPath)
    .then(() => console.log(`${name} cropped`));
}

function base64ToPng(b64Json: string, outputPath: string) {
  const imageBuffer = Buffer.from(b64Json, 'base64');
  fs.writeFileSync(outputPath, imageBuffer);
}

function deleteExistingCards() {
  // delete all the contents under ../web/public/assets
  const files = fs.readdirSync('../web/public/assets');
  for (const file of files) {
    fs.unlinkSync(path.join('../web/public/assets', file));
  }
}



function copyToVault(theme: string) {
  // create folder ../web/public/vault/${theme}
  if (!fs.existsSync(path.join('../web/public/vault', theme))) {
    fs.mkdirSync(path.join('../web/public/vault', theme));
  }
  // copy all files under ../web/public/assets to ../web/public/vault/${theme}
  const files = fs.readdirSync('../web/public/assets');
  for (const file of files) {
    fs.copyFileSync(path.join('../web/public/assets', file), path.join('../web/public/vault', theme, file));
  }
}

function mergeIntoVaultConfig(newPrompt: string, newGameFile: any) {
  const jsonVaultLocation = '../web/public/vault/vault.json';
  
  fs.readFile(jsonVaultLocation, 'utf8', (err, data) => {
      if (err) {
          console.error("An error occurred reading the file:", err);
          return;
      }
      let jsonVaultObj = JSON.parse(data);
      jsonVaultObj.unshift({
        "prompt": newPrompt,
        "game_file": newGameFile
      });
      fs.writeFile(jsonVaultLocation, JSON.stringify(jsonVaultObj, null, 4), 'utf8', err => {
          if (err) {
              console.error("An error occurred writing the file:", err);
              return;
          }
          console.log("JSON file has been updated");
      });
  });
}

async function regenSomeImages()  {
  const openai = new OpenAI();
  const theme = "Cyberpunk";

  for (const card of ["MegaCorp Overlord"]) {
    const name = card;
    const p1 = `Magestic, fantasy, zoomed in picture of a ${name} in the theme of ${theme}.  Make it easy to understand.`;
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
    await cropAndCopy(imageSavePath, name);
  }
  copyToVault(theme);
}


async function main() {
  await regenSomeImages();
  return;
  const theme = "Cyberpunk";
  const mechanics = new MechanicsGenerator();
  let isFun: boolean = false;
  let gameFile: any = null;
  while(isFun == false) {
    console.log('starting while loop');
    gameFile = await mechanics.getJsonAsDictionary(theme); 
    console.log('got game file: ' + JSON.stringify(gameFile));
    // simulate game file
    isFun = await isFunGameFile(gameFile);
    console.log(isFun);
    console.log(gameFile);
  }

  deleteExistingCards();
  fs.writeFileSync('../web/public/assets/game_file.json', JSON.stringify(gameFile));
  await generateImages(theme, gameFile);
  copyToVault(theme);
  mergeIntoVaultConfig(theme, gameFile);
}

main().catch(err => {
  console.error(err);
});
