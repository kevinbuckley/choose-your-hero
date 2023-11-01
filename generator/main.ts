import JsonGenerator from './MechanicsGenerator';
import ImageGenerator from './ImageGenerator';
import dotenv from 'dotenv';
import { Semaphore } from 'async-mutex'; // Assuming you have installed a package for semaphore
dotenv.config();

async function main() {

    const semaphore = new Semaphore(5);
    await generateImages(gameFile, semaphore);
}

async function generateImages(gameFile: any[], semaphore: Semaphore): Promise<void> {
  const gen = new ImageGenerator();
  const tasks: Promise<void>[] = [];

  for (const card of gameFile) {
    const name = card['name'];
    const p1 = `Magestic and fantasy looking ${name}.  To be used in a card game following the style of Hearthstone.`;
    tasks.push(gen.getImage(p1, 'game', name, semaphore));
  }

  await Promise.all(tasks);
}

main().catch(err => {
  console.error(err);
});
