import ImageGenerator from './ImageGenerator';
import dotenv from 'dotenv';
import { Semaphore } from 'async-mutex'; // Assuming you have installed a package for semaphore
dotenv.config();
import { readFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function generateImages(gameFile: any[]): Promise<void> {
  const semaphore = new Semaphore(5);
  const gen = new ImageGenerator();
  const tasks: Promise<void>[] = [];

  const openai = new OpenAI();

  for (const card of gameFile) {
    const name = card['name'];
    const p1 = `Magestic, fantasy, zoomed in picture of a ${name}.  Make it easy to understand and in portrait mode suitable for a vertical mobile wallpaper.`;
    // @ts-ignore
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: p1,
      n: 1,
      size: "1024x1792",
      response_format: 'b64_json'
    });
    console.log(response.data[0].revised_prompt);
    base64ToPng(response.data[0].b64_json!, path.join('../web/public/assets', `${name}.png`));
    await sleep(9000);
  }
}

function base64ToPng(b64Json: string, outputPath: string) {
  const imageBuffer = Buffer.from(b64Json, 'base64');
  fs.writeFileSync(outputPath, imageBuffer);
}

async function main() {

  const readJsonFile = async (filePath: string) => JSON.parse(await readFile(filePath, 'utf8'));
  const gamefile = await readJsonFile('../web/public/assets/game_file.json');

  await generateImages(gamefile);
}


main().catch(err => {
  console.error(err);
});
