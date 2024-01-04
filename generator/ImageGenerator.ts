import { exec } from 'child_process';
import fs from 'fs';

class ImageGenerator {
    image_type: string[] = [
        "Minimalism", "Rococo", "Gothic", "Baroque", "Cubism", "Fauvism", 
         "Doodle", "Cinema Portrait","Surrealism", "Pop Art", 
         "Anime", "Pixel Art", "Watercolor", 
        "Ink Wash", "Art Nouveau", "Art Deco", "Futurism", "Abstract" ];

    randomStyle(): string {
       // return random value from image_type
         return this.image_type[Math.floor(Math.random() * this.image_type.length)];
    }

    async generateLocalImage(
        name: string,
        theme: string,
        style: string,
        imageSavePath: string
    ): Promise<void> {
        let command: string = `python3 ImageGenerator.py`;
        command += ` --name "${name}"`;
        command += ` --theme "${theme}"`;
        command += ` --style "${style}"`;
        command += ` --file_save_name "${imageSavePath}"`;
        console.log(`running command ${command}`);
        await this.runCommand(command);
        console.log(`command complete`);
    }

    async runCommand(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.warn(error);
                    reject(error);
                }
                resolve(stdout? stdout : stderr);
            });
        });
    }

    async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    base64ToPng(b64Json: string, outputPath: string) {
        const imageBuffer = Buffer.from(b64Json, 'base64');
        fs.writeFileSync(outputPath, imageBuffer);
    }
      
}
export default ImageGenerator;
