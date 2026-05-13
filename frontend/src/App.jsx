import { useEffect, useRef, useState } from "react";
import { Bot, User, Sparkles } from "lucide-react";
import InputBox from "./components/InputBox";
import { getResponse } from "./services/api";

function Message({ text, sender }) {
  const isBot = sender === "bot";

  return (
    <div
      className={`flex items-start gap-3 mb-5 ${
        isBot ? "justify-start" : "justify-end"
      }`}
    >
      {isBot && (
        <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shadow-md">
          <Bot size={18} />
        </div>
      )}

      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all duration-200 ${
          isBot
            ? "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
            : "bg-black text-white rounded-tr-sm"
        }`}
      >
        {text}
      </div>

      {!isBot && (
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shadow-md">
          <User size={18} className="text-gray-700" />
        </div>
      )}
    </div>
  );
}

function Chatbox({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 bg-[#F7F7F8]">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
          <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center mb-4 shadow-lg">
            <Sparkles size={28} />
          </div>

          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Welcome to ChatBot
          </h1>

          <p className="text-sm max-w-sm leading-relaxed">
            How can I help you today?
          </p>
        </div>
      ) : (
        messages.map((msg, index) => (
          <Message
            key={index}
            text={msg.text}
            sender={msg.sender}
          />
        ))
      )}

      <div ref={bottomRef}></div>
    </div>
  );
}

function App() {
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState("simple");
  const [loading, setLoading] = useState(false);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMsg = {
      text,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await getResponse(text, mode);

      const botMsg = {
        text: data.reply,
        sender: "bot",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          text: "Error getting response",
          sender: "bot",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#ECECF1] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              AI ChatBot
            </h1>
            <p className="text-sm text-gray-500">
              Smart conversational assistant
            </p>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-xl border border-gray-200">
            <span className="text-sm text-gray-600">Mode</span>

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="bg-transparent outline-none text-sm font-medium text-gray-700 cursor-pointer"
            >
              <option value="simple">Simple</option>
              <option value="exam">Exam</option>
              <option value="professional">Professional</option>
            </select>
          </div>
        </div>

        {/* Chat Area */}
        <Chatbox messages={messages} />

        {/* Loading */}
        {loading && (
          <div className="px-6 py-2 text-sm text-gray-500 animate-pulse">
            AI is typing...
          </div>
        )}

        {/* Input */}
        <InputBox onSend={handleSend} />
      </div>
    </div>
  );
}

export default App;
