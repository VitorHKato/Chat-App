import './App.css';
import { useState, useEffect } from 'react';
import Input from "./components/Input";

export default function Group({ data }) {
    const [messages, setMessages] = useState([]);
    const [userMessages, setUserMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const groupName = data.group;
    const username = data.username;
    const baseUrl = 'http://140.238.182.69:55667/'
    //const baseUrl = 'http://localhost:55667/'

    useEffect(() => {
        fetchMessages();
    }, [groupName]);

    const isUserMessage = (id) => {
        return userMessages.some(userMsg => userMsg.Id === id);
    }

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${baseUrl}messages/${groupName}`);
            const response = await res.json();
            setMessages(response);
            setUserMessages(response.filter(msg => msg.SenderId === username));
        } catch (error) {
            console.error('Error fetching messages: ', error);
        }
    };

    const handleSendMessage = async () => {
        try {
            await fetch(`${baseUrl}newMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({senderid: username, roomid: groupName, content: newMessage}),
            });
            await fetchMessages();
        } catch (error) {
            console.error('Error sending message: ', error);
        }
    };

    const handleEditMessage = async (messageId) => {
        try {
            await fetch(`${baseUrl}updateMessage/${messageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({Content: newMessage}),
            });
            await fetchMessages();
        } catch (error) {
            console.error('Error deleting message: ', error);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await fetch(`${baseUrl}delete/${messageId}`, {
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
                    {messages && messages.map((msg) => (
                        <div className={`message-box ${isUserMessage(msg.Id) ? 'userMessage' : ''}`}
                             key={msg.id}
                         >
                            <div className="message-content">
                                <p><strong>{msg.SenderId}</strong>: {msg.Content}</p>
                            </div>
                        {isUserMessage(msg.Id) && (
                        <div className="message-buttons">
                            <button onClick={() => handleEditMessage(msg.Id)}>Edit</button>
                            <button onClick={() => handleDeleteMessage(msg.Id)}>Delete</button>
                        </div>
                        )}
                        </div>
                    ))}
                </div>
                <div className="new-message-container">
                    <Input
                        type="text"
                        value={newMessage}
                        maxLenght="200"
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