import './App.css';
import { useState, useEffect } from 'react';
import Input from "./components/Input";

export default function Group({ data }) {
    const [messages, setMessages] = useState([]);
    const [userMessages, setUserMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [username, setUsername] = useState('');
    const groupName = data.group;

    useEffect(() => {
        fetchMessages();
    }, [groupName]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`https://httpbin.org/get?group=${groupName}`);
            const data = await res.json();
            setMessages(data.messages);
            setUserMessages(data.messages.filter(msg => msg.username === username));
        } catch (error) {
            console.error('Error fetching messages: ', error);
        }
    };

    const handleSendMessage = async () => {
        try {
            const rest = await fetch('https://httpbin.org/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({group: groupName, username, message: newMessage}),
            });
        } catch (error) {
            console.error('Error sending message: ', error);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await fetch(`https://httpbin.org/delete/${messageId}`, {
                method: 'DELETE',
            });
            await fetchMessages();
        } catch (error) {
            console.error('Error deleting message: ', error);
        }
    };

    return (
        <>
            <div className="group-container">
                <h1>{groupName}</h1>
                <div className="messages-container">
                    <div className="messages-left">
                        {messages && messages.map((msg) => (
                            <div className="message-box" key={msg.id}>
                                <p><strong>{msg.username}</strong>: {msg.message}</p>
                            </div>
                        ))}
                    </div>
                    <div className="messages-right">
                        {userMessages && userMessages.map((msg => (
                            <div className="message-box" key={msg.id}>
                                <p>{msg.message}</p>
                                <button onClick={() => handleDeleteMessage(msg.id)}>Delete</button>
                            </div>
                        )))}
                    </div>
                </div>
                <div className="new-message-container">
                    <Input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message"
                    />
                    <button onClick={handleSendMessage}>Send</button>
                </div>
            </div>

            {/*{response && (*/}
            {/*    <div>*/}
            {/*        <h2>Response:</h2>*/}
            {/*        <pre>{JSON.stringify(response, null, 2)}</pre>*/}
            {/*    </div>*/}
            {/*)}*/}
        </>
    )
}