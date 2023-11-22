import axios, { AxiosResponse } from 'axios';
import fs from 'fs';
import path, { resolve } from 'path';
import { Semaphore } from 'async-mutex'; // Assuming you have installed a package for semaphore

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
    imageName: string
  ): Promise<any> {
    while (true) {
      const response: any = await this.get(`generations/${generationId}`);
      const image = response.generations_by_pk.generated_images;
      console.log(`polling for image ${imageName}`);
      if (image.length > 0) {
        const imageResponse: AxiosResponse = await axios.get(image[0].url, {
          responseType: 'arraybuffer', 
        });
        if (imageResponse.status === 200) {
          return [imageName, imageResponse.data];
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
    imageName: string,
    semaphore: Semaphore
  ): Promise<void> {
    const payload = {
      prompt,
      negative_prompt: '',
      modelId: 'ac614f96-1082-45bf-be9d-757f2d31c174', // dream shaper
      sd_version: 'v1_5',
      num_images: 1,
      width: 768,
      height: 1024,
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

    const [value, release] = await semaphore.acquire();
    try {
      const response: any = await this.post(payload, 'generations');
      if ('sdGenerationJob' in response) {
        const generationId = response.sdGenerationJob.generationId;
        return await this.pollDownload(generationId, imageName);
      } else {
        console.log(`Failed generation for ${imageName} with error: ${response}`);
      }
    }
    finally {
      release();
    }
  }
}

export default ImageGenerator;
