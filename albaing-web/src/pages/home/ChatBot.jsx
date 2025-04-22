import React, { useState } from "react";
import axios from "axios";
// CSS 제거 (테일윈드로 대체)

const ChatBot = () => {
    const [messages, setMessages] = useState([{ sender: "bot", text: "안녕하세요! 무엇을 도와드릴까요?" }]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        const currentInput = input;

        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInput("");
        setIsLoading(true);

        // axios & promise 방식 유지
        axios.post("http://localhost:8080/chatbot/dialogflow", null, {
            params: { sessionId: "user-" + Date.now(), message: currentInput }
        })
            .then(response => {
                const botReply = response.data.response;
                setMessages(prevMessages => [...prevMessages, {
                    sender: "bot",
                    text: botReply
                }]);
            })
            .catch(error => {
                console.error("Error:", error);
                setMessages(prevMessages => [...prevMessages, {
                    sender: "bot",
                    text: "오류가 발생했어요. 다시 시도해주세요."
                }]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div className="w-full max-w-lg mx-auto h-screen max-h-[600px] flex flex-col border border-gray-200 rounded-lg overflow-hidden shadow-lg">
            <div className="bg-blue-600 text-white px-4 py-3">
                <h2 className="font-medium">알바잉 챗봇</h2>
            </div>

            <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-3">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`max-w-3/4 p-3 rounded-lg ${
                            msg.sender === "user"
                                ? "self-end bg-blue-600 text-white"
                                : "self-start bg-gray-100 text-gray-800"
                        }`}
                    >
                        {msg.text}
                    </div>
                ))}
                {isLoading && (
                    <div className="self-start bg-gray-100 text-gray-800 p-3 rounded-lg flex items-center space-x-2">
                        <span>처리 중</span>
                        <span className="flex">
                            <span className="animate-bounce">.</span>
                            <span className="animate-bounce delay-100">.</span>
                            <span className="animate-bounce delay-200">.</span>
                        </span>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-200 p-3 flex">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    disabled={isLoading}
                />
                <button
                    onClick={sendMessage}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                    {isLoading ? (
                        <span className="inline-block">처리 중...</span>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ChatBot;