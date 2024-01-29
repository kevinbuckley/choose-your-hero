import argparse
from diffusers import AutoPipelineForText2Image
import torch
from typing import List
import random
import time

class ImageGenerator:

    def __init__(self, name, theme, style, file_save_name):
        self.name = name
        self.theme = theme
        self.file_save_name = file_save_name
        self.style = style
        self.device = torch.device("mps")  # Metal device
        self.pipe = AutoPipelineForText2Image.from_pretrained("stabilityai/sdxl-turbo", torch_dtype=torch.float16 , variant="fp16")
        #self.pipe = AutoPipelineForText2Image.from_pretrained("runwayml/stable-diffusion-v1-5", torch_dtype=torch.float16 , variant="fp16")
        self.pipe.to(self.device)
    def generate_image(self):
        
        prompt = f'''
        A centered single {self.style} picture of the character ({self.name}) in the theme of [{self.theme}].
        Extremely detailed eyes and face but whole body is visible and very realistic.
        Only {self.name}, nothing else in the picture.
        '''
        
        image = self.pipe(prompt=prompt, 
                         # negative_prompt="ugly, deformed, disfigured, poor details, bad anatomy, blurry eyes",
                          num_inference_steps=2, 
                          strength=0.5, 
                          guidance_scale=0.0).images[0]

        #refiner = DiffusionPipeline.from_pretrained(
        #    "stabilityai/stable-diffusion-xl-refiner-1.0",
        #    text_encoder_2=self.pipe.text_encoder_2,
        #    vae=self.pipe.vae,
        #    torch_dtype=torch.float32,
        #    use_safetensors=True,
        #    variant="fp16",
        #    local_files_only=True
        #)
        print(f'Image Name: {self.file_save_name}')
        image.save(self.file_save_name)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generate an image.')
    parser.add_argument('--name', type=str, required=True)
    parser.add_argument('--theme', type=str, required=True)
    parser.add_argument('--style', type=str, required=True)
    parser.add_argument('--file_save_name', type=str, required=True)
    
    args = parser.parse_args()

    start_time = time.time()

    generator = ImageGenerator(args.name, args.theme, args.style, args.file_save_name)
    generator.generate_image()
    end_time = time.time()
    print(f"Time taken: {end_time - start_time} seconds")