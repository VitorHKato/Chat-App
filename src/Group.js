import './App.css';
import { useState, useEffect } from 'react';
import Input from "./components/Input";
import {JSEncrypt} from "jsencrypt";
import { AES } from 'crypto-js';
import CryptoJS from 'crypto-js';

export default function Group({ data }) {
    const [messages, setMessages] = useState([]);
    const [userMessages, setUserMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const groupName = data.group;
    const username = data.username;
    //const baseUrl = 'http://140.238.182.69:55667/'
    const baseUrl = 'http://localhost:55667/'

    const [privateKey, setPrivateKey] = useState('');
    const [serverPublicKey, setServerPublicKey] = useState('');

    const generateKeys = () => {
        const jsEncrypt = new JSEncrypt({default_key_size: 2048})
        setPrivateKey(jsEncrypt.getPrivateKey());
    }

    const decryption = (body) => {
        // var privateKey = '-----BEGIN RSA PUBLIC KEY-----\n' +
        //     'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoPd+Df9O7J0gXF5aWDxg\n' +
        //     'Hvv9baSg7wivjbzstyrjDgYUgvjq8FkZv9NYBVKE7ysYTFvuj6/zY7JlgbJawqsF\n' +
        //     'Q8yoArubvVswFzkjVe/QAUh/dthw5VWOqLuBX8DevE0izylIBsgDaLm9HvLcNjyE\n' +
        //     'WqT9qGQfdLDxye2kKDd/x65BwybrCIo7AqW09UAWsrS6B3cjdW17GGUhkLKWfAWV\n' +
        //     'i5WeSi5nX3dJ1UA/jgYCfymABeMF3wSCWl3JLeDRIoMm6XlUpKQgcT7HPD4BG8Qx\n' +
        //     'YW8uZc/HXTE0Yc41VUrjhB6UYy9EJeUgCEB8LgW0sxbup0gvycciXO4JKXvqBeBi\n' +
        //     'QwIDAQAB\n' +
        //     '-----END RSA PUBLIC KEY-----';
        const bytes = AES.decrypt(body, serverPublicKey);
        return bytes.toString();
    }

    const signBody = (body) => {
        const encrypt = new JSEncrypt();
        encrypt.setPrivateKey(privateKey);
        encrypt.sign(body, CryptoJS['sha256'], (signature) => {
            // Handle the signature here
            console.log("Signature:", signature);
        });
    }

    const fetchServerPublicKey = async () => {
        try {
            const res = await fetch(`${baseUrl}key/`);
            const serverKey = await res.text();
            setServerPublicKey(serverKey);
        } catch (error) {
            console.error('Error fetching server public key: ', error);
        }
    };

    useEffect(() => {
        generateKeys();
        fetchServerPublicKey();
        setInterval(fetchMessages, 5000);
    }, [groupName]);

    const isUserMessage = (id) => {
        return userMessages.some(userMsg => userMsg.Id === id);
    }

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${baseUrl}messages/${groupName}`);
            const response = await res.json();

            response.map(msg => decryption(msg.Content))
            response.map(msg => signBody(msg.Content))

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