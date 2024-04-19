import axios from 'axios';


export default async function callModel(prompt: string): Promise<string> {
  
  const data = {
    model: 'llama3',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    "options": {
      "temperature": .3,
    },
    "stream": false
  };

  const response = await axios.post('http://localhost:11434/api/chat', data);
  return response.data.message.content;
}
