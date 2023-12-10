import { exec } from 'child_process';

class ImageGenerator {

    async generateImage(
        name: string,
        theme: string,
        theme_modifier: string
    ): Promise<void> {
        let command: string = `python3 ImageGenerator.py`;
        command += ` --name ${name}`;
        command += ` --theme ${name}`;
        command += ` --theme_modifier ${name}`;
        command += ` --file_save_location temp `;
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
}