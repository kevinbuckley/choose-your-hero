import JsonGenerator from './MechanicsGenerator';
import ImageGenerator from './ImageGenerator';
import dotenv from 'dotenv';
import { Semaphore } from 'async-mutex'; // Assuming you have installed a package for semaphore
dotenv.config();

async function main() {

   
    await generateImages(gameFile, semaphore);
}


main().catch(err => {
  console.error(err);
});
