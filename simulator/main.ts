import MechanicsGenerator from '../mechanics-generator/MechanicsGenerator';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const mechanics = new MechanicsGenerator();
  console.time('getJsonAsDictionary');
  const gameFile = await mechanics.getJsonAsDictionary('Zelda');

  
  console.timeEnd('getJsonAsDictionary');

}

main().catch(err => {
  console.error(err);
});
