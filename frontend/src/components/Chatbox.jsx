import { Message } from "./Message";

export const Chatbox = ({ messages }) => {
    return (
        <div className="h-80 overflow-y-auto border rounded-lg p-3 bg-gray-50 mb-3">
            {messages.map((msg,index) => (
                <Message key = {index} msg = {msg}></Message>
            ))}
        </div>
    )
}