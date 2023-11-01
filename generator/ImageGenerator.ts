import axios, { AxiosResponse } from 'axios';
import fs from 'fs';
import path from 'path';

const urlBase = 'https://cloud.leonardo.ai/api/rest/v1/';

class ImageGenerator {
  private LEONARDO_API_KEY: string | undefined = process.env.LEONARDO_API_KEY;

  private async post<T>(payload: any, url: string): Promise<T> {
    const headers = {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `bearer ${this.LEONARDO_API_KEY}`,
    };
    const response: AxiosResponse = await axios.post(
      `${urlBase}/${url}`,
      payload,
      { headers }
    );
    return response.data;
  }

  private async get<T>(url: string): Promise<T> {
    const headers = {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `bearer ${this.LEONARDO_API_KEY}`,
    };
    const response: AxiosResponse = await axios.get(`${urlBase}/${url}`, {
      headers,
    });
    return response.data;
  }

  private async pollDownload(
    generationId: string,
    folder: string,
    imageName: string
  ): Promise<void> {
    while (true) {
      const response: any = await this.get(`generations/${generationId}`);
      const image = response.generations_by_pk.generated_images;
      console.log(`polling for image ${imageName}`);
      if (image.length > 0) {
        const imageResponse: AxiosResponse = await axios.get(image[0].url);
        if (imageResponse.status === 200) {
          if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
          }
          fs.writeFileSync(
            path.join(folder, `${imageName}.png`),
            imageResponse.data
          );
        } else {
          console.log(
            `Failed to download image. HTTP Status Code: ${imageResponse.status}`
          );
        }
        return;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  public async getImage(
    prompt: string,
    folder: string,
    imageName: string,
    semaphore: any
  ): Promise<void> {
    const payload = {
      prompt,
      negative_prompt: '',
      modelId: 'ac614f96-1082-45bf-be9d-757f2d31c174', // dream shaper
      sd_version: 'v1_5',
      num_images: 1,
      width: 512,
      height: 512,
      num_inference_steps: null,
      guidance_scale: 7,
      scheduler: 'LEONARDO',
      presetStyle: 'LEONARDO',
      tiling: false,
      public: true,
      promptMagic: true,
      promptMagicVersion: 'v2',
      highContrast: true,
    };

    const response: any = await this.post(payload, 'generations');
    if ('sdGenerationJob' in response) {
      const generationId = response.sdGenerationJob.generationId;
      await this.pollDownload(generationId, folder, imageName);
    } else {
      console.log(`Failed generation for ${imageName} with error: ${response}`);
    }
  }
}

export default ImageGenerator;
