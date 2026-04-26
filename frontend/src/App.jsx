
import { useState } from 'react'
import { Chatbox } from './components/chatbox'
import InputBox from './components/InputBox'
import { getResponse } from './services/api'


function App() {
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState("simple");

  const handleSend = async(text) => {
    const userMsg = {text, sender: "user"};
    setMessages((prev) => [...prev, userMsg]);

    try{
      const data = await getResponse(text, mode);
      const botMsg = { text: data.reply, sender: "bot"};
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {text: "Error getting response", sender: "bot"},
      ]);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white shadow-lg rounder-xl p-4">
          <h2 className='txt-xl font-semibold mb-3 text-center'>
            ChatBot
          </h2>
          
          <Chatbox messages={messages}></Chatbox>
          <InputBox onSend={handleSend}
            mode={mode}
            setMode={setMode}
          ></InputBox>
        </div>
    </div>
  )
}

export default App
