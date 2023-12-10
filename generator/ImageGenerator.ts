import { exec } from 'child_process';
import fs from 'fs';
import OpenAI from 'openai';

class ImageGenerator {

    async generateLocalImage(
        name: string,
        theme: string,
        imageSavePath: string
    ): Promise<void> {
        let command: string = `python3 ImageGenerator.py`;
        command += ` --name ${name}`;
        command += ` --theme ${name}`;
        command += ` --theme_modifier ${name}`;
        command += ` --file_save_location ${imageSavePath} `;
        await this.runCommand(command);
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

    async generateOpenAiImage(name: string, theme: string, imageSavePath: string ) {
        const openai = new OpenAI();
        const p1 = `Fun, majestic, Zoomed in picture of a (${name}) in the theme of ${theme}.  Make it easy to understand and only show the picture of ${name} without any words.`;
        // @ts-ignore
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: p1,
          n: 1,
          size: "1024x1024",
          response_format: 'b64_json'
        });
        console.log(response.data[0].revised_prompt);
        this.base64ToPng(response.data[0].b64_json!, imageSavePath);
        await this.sleep(9000);
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
