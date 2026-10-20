import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./CSS/ITSupport.css";

type ChatMessage = {
    sender: "bot" | "user";
    text: string;
};

type ChatRequest = {
    message: string;
    history: Array<{
        role: "assistant" | "user";
        message: string;
    }>;
};

function Chatbot() {
    const [chatOpen, setChatOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            sender: "bot",
            text: "Hi! I’m the Innovia IT assistant. How can I help you today?",
        },
    ]);

    useEffect(() => {
        if (chatOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatOpen, messages, isSending]);

    async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedMessage = message.trim();
        if (!trimmedMessage || isSending) return;

        const token = localStorage.getItem("token");
        const request: ChatRequest = {
            message: trimmedMessage,
            history: messages.slice(-20).map((chatMessage) => ({
                role: chatMessage.sender === "bot" ? "assistant" : "user",
                message: chatMessage.text,
            })),
        };

        setIsSending(true);
        setMessages((currentMessages) => [
            ...currentMessages,
            { sender: "user", text: trimmedMessage },
        ]);
        setMessage("");

        try {
            const response = await axios.post<string>("/api/chat/ChatBot", request, {
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            setMessages((currentMessages) => [
                ...currentMessages,
                { sender: "bot", text: response.data },
            ]);
        } catch (error) {
            console.error("Unable to send chat message:", error);
            setMessages((currentMessages) => [
                ...currentMessages,
                { sender: "bot", text: "Sorry, I could not get a response. Please try again." },
            ]);
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div className="chatbot">
            {chatOpen && (
                <section id="it-support-chat" className="chatbox" aria-label="IT support chat">
                    <header className="chatboxHeader">
                        <span className="botAvatar" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="5" width="18" height="14" rx="4" />
                                <path d="M12 2v3M8 12h.01M16 12h.01M8.5 16h7" />
                            </svg>
                        </span>
                        <div>
                            <h3>Innovia IT support</h3>
                            <p><span className="onlineIndicator" />Usually replies quickly</p>
                        </div>
                        <button
                            className="chatboxClose"
                            type="button"
                            onClick={() => setChatOpen(false)}
                            aria-label="Close IT support chat"
                        >
                            <span aria-hidden="true">×</span>
                        </button>
                    </header>

                    <div className="chatMessages">
                        {messages.map((chatMessage, index) => (
                            <div
                                className={chatMessage.sender === "bot" ? "botMessage" : "userMessage"}
                                key={`${chatMessage.sender}-${index}`}
                            >
                                {chatMessage.text}
                            </div>
                        ))}
                        {isSending && <div className="botMessage">Thinking…</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chatComposer" onSubmit={sendMessage}>
                        <label className="srOnly" htmlFor="it-support-message">Describe your problem</label>
                        <input
                            id="it-support-message"
                            type="text"
                            placeholder="Describe your problem..."
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            disabled={isSending}
                        />
                        <button type="submit" aria-label="Send message" disabled={isSending || !message.trim()}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="m22 2-7 20-4-9-9-4Z" />
                                <path d="M22 2 11 13" />
                            </svg>
                        </button>
                    </form>
                    <a className="humanSupport" href="tel:+46720531819">
                        Talk to a person: 072-053-18-19
                    </a>
                </section>
            )}

            <button
                className="chatLauncher"
                type="button"
                onClick={() => setChatOpen((isOpen) => !isOpen)}
                aria-expanded={chatOpen}
                aria-controls="it-support-chat"
                aria-label={chatOpen ? "Close IT support chat" : "Open IT support chat"}
            >
                {chatOpen ? (
                    <span className="chatLauncherClose" aria-hidden="true">×</span>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.7 9.7 0 0 1-4.2-1L3 20l1.4-4.2A8.5 8.5 0 1 1 21 11.5Z" />
                        <path d="M8 12h.01M12 12h.01M16 12h.01" />
                    </svg>
                )}
            </button>
        </div>
    );
}

export default Chatbot;
