import { useState } from "react";

function InputBox({ onSend, mode, setMode}) {
    const [input, setInput] = useState("");

    const handleSend = () => {
        if(!input.trim()) return;
        onSend(input);
        setInput("");
    };

    return (
        <div className="flex gap-2 mt-3">
            <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="border px-2 py-1 rounded bg-gray-100"
            >
                <option value="simple">Simple</option>
                <option value="exam">Exam</option>
                <option value="professional">Pro</option>
            </select>
            <input
                type="text" 
                className="flex-1 border rounded-lg px-3 py-2 outline-none foucs:ring-2 focus:ring-blue-400"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <button
                onClick={handleSend}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
                Send 
            </button>
        </div>
    )
}

export default InputBox;