import MechanicsGenerator from './MechanicsGenerator';
import dotenv from 'dotenv';
import { Card, ICard, State } from '../web/src/mechanics/Card';
import { Boss } from '../web/src/mechanics/Boss';
import { GameState } from '../web/src/mechanics/GameState';
import { EVENT_GAME_OVER } from '../web/src/mechanics/GameEvents';
import fs from 'fs';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';
import sharp from 'sharp';
import { Theme } from '../web/src/mechanics/Theme';
import ThemeGenerator from './ThemeGenerator';

dotenv.config();
const jsonVaultLocation = '../web/public/assets/vault.json';

class SimResult {
  totalGames: number = 0;
  gamesWon: number = 0;
  isFun(): boolean {
    return this.tooHard() == false && this.tooEasy() == false;
  }
  tooHard(): boolean {
    return this.gamesWon / this.totalGames < 0.33;
  }
  tooEasy(): boolean {
    return this.gamesWon / this.totalGames > 0.9;
  }
}

async function isFunGameFile(gameFile: any): Promise<SimResult> {
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
  return result;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function generateImages(theme: string, gameFile: any[]): Promise<void> {
  const openai = new OpenAI();

  for (const card of gameFile) {
    const name = card['name'];
    const p1 = `Fun, majestic, Zoomed in picture of a ${name} in the theme of ${theme}. 
     Make it easy to understand and only show the picture of ${name} without any words.
     Ensure that ${name} is centered on the image.`;
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
    await cropAndCopy(imageSavePath, name, theme);
  }
}
async function cropAndCopy(inputPath: string, name: string, theme: string) {
  
  const outputPath = path.join('../web/public/assets',  theme, `${name}.png`);
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

async function getNextActiveDate(): Promise<Date> {
  const data = await readFile(jsonVaultLocation, 'utf8');
  let themes  = JSON.parse(data) as Theme[];
  // Get today's date
  let latestTheme = new Date();

  for(let theme of themes) {
    if(theme.activeDate! > latestTheme)
    {
      latestTheme = theme.activeDate!;
    }
  }
  latestTheme.setDate(latestTheme.getDate() + 1);
  latestTheme.setHours(0, 0, 0, 0);
  return latestTheme;
}

async function mergeIntoVaultConfig(newGameFile: Theme) {
  
  const data = await readFile(jsonVaultLocation, 'utf8');
    
  let jsonVaultObj = JSON.parse(data);
  jsonVaultObj.unshift(newGameFile);

  await writeFile(jsonVaultLocation, JSON.stringify(jsonVaultObj, null, 4), 'utf8');
}

async function regenSomeImages(theme: string, cards: string[])  {
  const openai = new OpenAI();

  for (const card of cards) {
    const name = card;
    const p1 = `Fun, majestic, Zoomed in picture of a ${name} in the theme of ${theme}. 
     Make it easy to understand and only show the picture of ${name} without any words.
     Ensure that ${name} is centered on the image.`;
    // @ts-ignore
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: p1,
      n: 1,
      size: "1024x1024",
      response_format: 'b64_json'
    });
    console.log(response.data[0].revised_prompt);
    const imageSavePath = path.join('temp', `${name}.png`);
    base64ToPng(response.data[0].b64_json!, imageSavePath);
    await sleep(9000);
    await cropAndCopy(imageSavePath, name, theme);
  }
}

function getBossHealth() {
  var min = 200;
  var max = 900;
  var random = Math.floor(Math.random() * ((max - min) / 50 + 1) + min / 50) * 50;
  console.log(`boss health: ${random}`)
  return random;
}


async function main() {
  const themes = JSON.parse(await readFile(jsonVaultLocation, 'utf8')) as Theme[];
  const themeGenerator = new ThemeGenerator();
  const theme = await themeGenerator.getGeneratedTheme(themes);
  console.log(theme);
  //await regenSomeImages(theme, ["The Immortal Emperor"]); return;

  const mechanics = new MechanicsGenerator();
  let isFun: boolean = false;
  let gameFile: any = null;
  const bossHealth: number = getBossHealth();
  let attackLower: number = Math.floor(5 * (bossHealth/500));
  let attackUpper: number = Math.floor(18 * (bossHealth/500));
  let healthLower: number = Math.floor(10 * (bossHealth/500));
  let healthUpper: number = Math.floor(28 * (bossHealth/500));

  gameFile = await mechanics.getJsonAsDictionary(theme.theme, bossHealth, attackLower, attackUpper, healthLower, healthUpper);
  return;
  let i = 0;
  while(isFun == false) {
    i++;
    console.log('starting while loop');
    console.log('got game file: ' + JSON.stringify(gameFile));
    // simulate game file
    let simResult = await isFunGameFile(gameFile);
    isFun = simResult.isFun();
    console.log(isFun);
    console.log(gameFile);
    if (isFun == false) {
      const adjuster = simResult.tooEasy() ? -1 : 1;
      gameFile = await mechanics.getNewCards(gameFile, adjuster);
    }
  }
  console.log(`Took ${i} tries to get a fun game file`);
  
  const fullFile: Theme = {
    prompt: theme.theme,
    cards: gameFile,
    activeDate: await getNextActiveDate()
  };

  if (!fs.existsSync(path.join('../web/public/assets', theme.theme))) {
    fs.mkdirSync(path.join('../web/public/assets', theme.theme));
  }
  fs.writeFileSync(`../web/public/assets/${theme.theme}/game_file.json`, JSON.stringify(fullFile));
  await generateImages(theme.theme, gameFile);
  mergeIntoVaultConfig(fullFile);
  // clean temp
  const files = await fs.promises.readdir('temp');
  await Promise.all(files.map(file => 
      fs.promises.unlink(path.join('temp', file))
  ));
}

main().catch(err => {
  console.error(err);
});
