import argparse
from diffusers import AutoPipelineForText2Image, DiffusionPipeline
import torch
import datetime
import os
import time

class ImageGenerator:
    def __init__(self, name, theme, theme_modifier, file_save_location):
        self.name = name
        self.theme = theme
        self.theme_modifier = theme_modifier
        self.file_save_location = file_save_location
        self.device = torch.device("mps")  # Metal device
        self.pipe = AutoPipelineForText2Image.from_pretrained("stabilityai/sdxl-turbo", torch_dtype=torch.float32 , variant="fp16")
        self.pipe.to(self.device)

    def generate_image(self):
        prompt = f'''
        Singe portrait of ({self.name}) as a {self.theme_modifier} with a {self.theme} theme. 
        Easy to understand.  {self.name} should be at the center of the image.
        Should not contain any text, should focus solely on the visual representation of the {self.name} character.
        '''

        image = self.pipe(prompt=prompt, num_inference_steps=2, strength=0.5, guidance_scale=0.0).images[0]

        refiner = DiffusionPipeline.from_pretrained(
            "stabilityai/stable-diffusion-xl-refiner-1.0",
            text_encoder_2=self.pipe.text_encoder_2,
            vae=self.pipe.vae,
            torch_dtype=torch.float32,
            use_safetensors=True,
            variant="fp16",
            local_files_only=True
        )
        image.save(os.path.join(self.file_save_location, f'{self.name}.png'))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generate an image.')
    parser.add_argument('--name', type=str, required=True)
    parser.add_argument('--theme', type=str, required=True)
    parser.add_argument('--theme_modifier', type=str, required=True)
    parser.add_argument('--file_save_location', type=str, required=True)

    args = parser.parse_args()

    start_time = time.time()

    generator = ImageGenerator(args.name, args.theme, args.theme_modifier, args.file_save_location)
    generator.generate_image()
    end_time = time.time()
    print(f"Time taken: {end_time - start_time} seconds")