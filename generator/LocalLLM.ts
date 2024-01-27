import axios from 'axios';


export default async function callModel(prompt: string): Promise<string> {
  
  const data = {
    model: 'llama2',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    "options": {
      "temperature": .5,
    },
    "stream": false
  };

  const response = await axios.post('http://localhost:11434/api/chat', data);
  return response.data.message.content;
}
