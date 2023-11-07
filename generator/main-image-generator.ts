import ImageGenerator from './ImageGenerator';
import dotenv from 'dotenv';
import { Semaphore } from 'async-mutex'; // Assuming you have installed a package for semaphore
dotenv.config();
import { readFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';


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

  const readJsonFile = async (filePath: string) => JSON.parse(await readFile(filePath, 'utf8'));
  const gamefile = await readJsonFile('../web/public/assets/game_file.json');

  await generateImages(gamefile);
}


main().catch(err => {
  console.error(err);
});
