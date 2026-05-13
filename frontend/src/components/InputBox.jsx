import { useState } from "react";
import { SendHorizonal } from "lucide-react";

function InputBox({ onSend}) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    onSend(input);
    setInput("");
  };

  return (
    <div className="border-t bg-white px-4 py-4">
      
      {/* Input Area */}
      <div className="flex items-center gap-3 bg-[#F4F4F5] border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
        
        <input
          type="text"
          placeholder="Message ChatBot..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
        />

        <button
          onClick={handleSend}
          className="bg-black hover:bg-gray-800 transition-all duration-200 text-white p-2.5 rounded-xl shadow-md"
        >
          <SendHorizonal size={18} />
        </button>
      </div>

      
    </div>
  );
}

export default InputBox;