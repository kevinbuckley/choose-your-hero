import dotenv from 'dotenv';
import { Semaphore } from 'async-mutex'; // Assuming you have installed a package for semaphore
dotenv.config();
import { readFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import sharp from 'sharp';

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


function justShrinkAndCopy() {

  const directoryPath = path.join(__dirname, './temp');
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
        console.error('Error reading directory', err);
        return;
    }

    files.forEach(file => {
      // Check if the file is a PNG
      if (path.extname(file).toLowerCase() === '.png') {
          cropAndCopy(path.join(directoryPath, file), path.basename(file, '.png'));
      }
    });
  });
}

function base64ToPng(b64Json: string, outputPath: string) {
  const imageBuffer = Buffer.from(b64Json, 'base64');
  fs.writeFileSync(outputPath, imageBuffer);
}

async function main() {

  //const readJsonFile = async (filePath: string) => JSON.parse(await readFile(filePath, 'utf8'));
  //const gamefile = await readJsonFile('../web/public/assets/game_file.json');

//  await generateImages(gamefile);
justShrinkAndCopy();
}


main().catch(err => {
  console.error(err);
});
