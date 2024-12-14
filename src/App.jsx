import { useState, useRef, useEffect } from "react";
import "./App.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const API_KEY = import.meta.env.VITE_WOW; // api key called from .env

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, generatingAnswer]);

  const generateAnswer = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setGeneratingAnswer(true);
    const currentQuestion = question;
    setQuestion(""); // Clear the input immediately after sending

    // Add user's question to chat history
    setChatHistory((prev) => [
      ...prev,
      { type: "question", content: currentQuestion },
    ]);

    const data = {
      contents: [
        {
          parts: [
            {
              text: currentQuestion,
            },
          ],
        },
      ],
    };

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Extract AI response
      const aiResponse =
        response.data.candidates[0]?.content?.parts[0]?.text ||
        "Sorry, I couldn't generate a response.";

      // Add AI's response to chat history
      setChatHistory((prev) => [
        ...prev,
        { type: "answer", content: aiResponse },
      ]);
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );

      // Handle error and add fallback response to chat history
      const errorMessage = "Sorry - Something went wrong. Please try again!";
      setChatHistory((prev) => [
        ...prev,
        { type: "answer", content: errorMessage },
      ]);
    }

    setGeneratingAnswer(false);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-r from-pink-50 to-blue-950">
      <div className="h-full max-w-4xl mx-auto flex flex-col p-3">
        {/* Fixed Header */}
        <header className="text-center py-4">
          <a className="block">
            <h1 className="text-4xl font-bold text-blue-960 hover:text-blue-600 transition-colors">
              Nexa AIoooppoppp✨
            </h1>
          </a>
        </header>

        {/* Scrollable Chat Container */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto mb-4 rounded-lg bg-pink-100 shadow-lg p-4 hide-scrollbar"
        >
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="bg-blue-950 rounded-xl p-8 max-w-2xl">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Welcome to Nexa AI! 👋
                </h2>
                <p className="text-gray-400 mb-4">
                  Ask me anything. I'm here to help with:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <span className="text-blue-500">💡</span> Your Advisor
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <span className="text-blue-500">🔧</span> Technical
                    questions
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <span className="text-blue-500">📝</span> Writing assistance
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <span className="text-blue-500">🤔 </span>Knowledge Gain
                  </div>
                </div>
                <p className="text-gray-400 mt-6 text-sm">
                  Type your question below and press Enter or click Send🪄
                </p>
              </div>
            </div>
          ) : (
            chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  chat.type === "question" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block max-w-[80%] p-3 rounded-lg overflow-auto hide-scrollbar ${
                    chat.type === "question"
                      ? "bg-blue-950 text-white rounded-br-none"
                      : "bg-pink-500 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <ReactMarkdown>{chat.content}</ReactMarkdown>
                </div>
              </div>
            ))
          )}
          {generatingAnswer && (
            <div className="text-left">
              <div className="inline-block bg-gray-100 p-3 rounded-lg animate-pulse">
                Generating✨
              </div>
            </div>
          )}
        </div>

        {/* Fixed Input Form */}
        <form onSubmit={generateAnswer} className=" rounded-lg shadow-lg p-4">
          <div className="flex gap-2">
            <textarea
              required
              className="flex-1 border-2 border-yellow-500 rounded p-3 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 resize-none"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything..."
              rows="2"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  generateAnswer(e);
                }
              }}
            ></textarea>
            <button
              type="submit"
              className={`px-6 py-2 bg-blue-950 text-white rounded-md hover:bg-blue-600 transition-colors ${
                generatingAnswer ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={generatingAnswer}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
