export const Message = ({ msg }) => {
    const isUser = msg.sender === "user";

    return(
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
            <div
                className={`px-3 py-2 rounded-lg max-w-[75%] text-sm
                ${
                    isUser
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-900"
                }`}
            >
                {msg.text}

            </div>
        </div>
    )
}