import { useState } from "react";

function Chatbot() {
    const [chatOpen, setChatOpen] = useState(false);

    return (
        <>
            <button onClick={() => setChatOpen(!chatOpen)}>
                {chatOpen ? "close" : "HELP!"}

            </button>

            {chatOpen && (
                <div className="chatbox">
                    <h3> IT Bot </h3>

                    <div className="message">
                    </div>

                    <input
                        type="text"
                        placeholder="Describe your problem..."
                    />

                    <button> SEND </button>
                    <button> I want human conection</button>
                </div>
            )}
        </>
    );
}

export default Chatbot;
