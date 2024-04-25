import MechanicsGenerator from './MechanicsGenerator';
import dotenv from 'dotenv';
import { Card, ICard, State } from '../web/src/mechanics/Card';
import { Boss } from '../web/src/mechanics/Boss';
import { GameState } from '../web/src/mechanics/GameState';
import { EVENT_GAME_OVER } from '../web/src/mechanics/GameEvents';
import fs from 'fs';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { Theme } from '../web/src/mechanics/Theme';
import ThemeGenerator from './ThemeGenerator';
import ImageGenerator from './ImageGenerator';

dotenv.config();
const jsonVaultLocation = '../web/public/assets/vault.json';

async function generateImages(theme: string, gameFile: any[]): Promise<void> {
  const imageGenerator = new ImageGenerator();
  const style = imageGenerator.randomStyle();
  for (const card of gameFile) {
    const name = card['name'];
    const imageSavePath = path.join('./temp', `${name}.png`);
    await imageGenerator.generateLocalImage(name, theme, style, imageSavePath);    
    await cropAndCopy(imageSavePath, name, theme);
  }
}
async function cropAndCopy(inputPath: string, name: string, theme: string) {
  
  const outputPath = path.join('../web/public/assets',  theme, `${name}.png`);
  const dimensions: sharp.Region = { width: 354, height: 512, left: 79, top: 0 };

  await sharp(inputPath)
    //.extract(dimensions) // Crop dimensions
    .resize(180, 260) // Resize
    .toFile(outputPath)
    .then(() => console.log(`${name} cropped`));
}

async function main() {

  const theme = "Superhero Baristas Brewing Cosmic Coffee";
  let cards: any[] = [];
  const data = await readFile(jsonVaultLocation, 'utf8');
  let jsonVaultObj = JSON.parse(data) as [];
    
  // get the theme from the file

  for(var i = 0; i < jsonVaultObj.length; i++) {
    let day = jsonVaultObj[i];
    if(day["prompt"] == theme) {
      cards = day["cards"] as any[];
      console.log(`found theme ${theme}`)
    }
  }
  await generateImages(theme, cards as any[]);
  
    
  
}

main().catch(err => {
  console.error(err);
});
