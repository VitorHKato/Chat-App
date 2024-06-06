import './App.css';
import { useState, useEffect } from 'react';
import Input from "./components/Input";
const forge = require('node-forge');

export default function Group({ data }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const groupName = data.group;
    const username = data.username;
    const baseUrl = 'http://140.238.182.69:55667/'
    //const baseUrl = 'http://localhost:55667/'

    const [privateKey, setPrivateKey] = useState('');
    const [serverPublicKey, setServerPublicKey] = useState('');

    const [selectedFile, setSelectedFile] = useState(null);
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const verifySignature = (content, serverSignature) => {
        const publicKey = `-----BEGIN RSA PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA13eJJSMdQlTleidy7Nip
4dZZaXyAYkfShwX/SZb4thLjVCk1WQ9bk7IG+EC9wwiJ/3yCvnkTB98odC2HSsj6
xwFTNvNxv6ZxtvH4DXd6xTXeq3NQWuJ9huckm7n6Pai9hFQ7WH17XNApHG07xsiO
iUyxgv/l5JnwL6Qaik9vQQ3ycxGBvn29UWYtDucwukLu+6P1KIu4Dmy0RyTbFRSy
7NRLbAttT0Naj6SD1ah4hCpR1U9aAAUFe54aCtWv1CxzBu8hkN95yzj90IsS7y8A
hsAtKvVEZ7MrE1Lr26Wzhsj5Xdr/MpFhthIwSoTdfczAayfHlGL4mLSzaADk9wUW
NQIDAQAB
-----END RSA PUBLIC KEY-----`;
        const publicKeyPem = forge.pki.publicKeyFromPem(publicKey);

        // Decode the Base64 encoded signature
        const signature = forge.util.decode64(serverSignature);

        // Hash the server response
        const md = forge.md.sha256.create();
        md.update(content, 'utf8');
        const hashedMessage = md.digest().getBytes();

        // Verify the signature
        //const verified = publicKeyPem.verify(hashedMessage, signature);
        //return verified;
        return true
    }

    //
    //const fetchServerPublicKey = async () => {
    //    try {
    //        const res = await fetch(`${baseUrl}key`);
    //        const serverKey = await res.text();
    //        setServerPublicKey(serverKey);
    //    } catch (error) {
    //        console.error('Error fetching server public key: ', error);
    //    }
    //};

    useEffect(() => {
        fetchMessages();
        //generateKeys();
        //fetchServerPublicKey();
        setInterval(fetchMessages, 2000);
    }, [groupName]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${baseUrl}messages/${groupName}`);
            const response = await res.json();

            let lengthBefore = response.length
            response.filter(msg => verifySignature(msg.content, msg.signature))
            if (response.length != lengthBefore) {
                console.warning("Signature doesn't match")
            } else {
                //console.log("Signature ok")
            }

            setMessages(response);
            //setUserMessages(response.filter(msg => msg.senderid === username));
            //console.log(username)
            //console.log(response)

        } catch (error) {
            console.error('Error fetching messages: ', error);
        }
    };

    const handleSendMessage = async () => {
        if ( selectedFile ) {
            await sendAttachmentMessage()
        } else {
            await sendNormalMessage()
        }
    }

    const sendAttachmentMessage= async () => {
        const formData = new FormData();
        formData.append('senderid', username);
        formData.append('roomid', groupName);
        formData.append('content', newMessage);

        if (selectedFile) {
            formData.append('attachment', selectedFile);
            console.log("has attachment")
            console.log(selectedFile)
        }

        try {
            await fetch(`${baseUrl}newMessage`, {
                method: 'POST',
                body: formData,
            });
            setNewMessage('');
            setSelectedFile(null);
            await fetchMessages();
        } catch (error) {
            console.error('Error sending message: ', error);
        }
    }

    const sendNormalMessage = async () => {
        try {
            await fetch(`${baseUrl}newMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({senderid: username, roomid: groupName, content: newMessage}),
            });
            setNewMessage('')
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
            setNewMessage('')
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
                        //<p>Sender ID: {msg.senderid}</p>

                        <div className={`message-box ${msg.senderid === username ? 'userMessage' : ''}`}
                             key={msg.id}
                         >
                            <div className="message-content">
                                <div className={`${msg.imgid === "" ? 'invisible' : ''}`}>
                                    <img src={`${baseUrl}image/${msg.imgid}`} width="200" height="200"/> 
                                </div>
                                <p><strong>{msg.senderid}</strong>: {msg.content}</p>
                            </div>
                        {msg.senderid === username && (
                        <div className="message-buttons">
                            <button onClick={() => handleEditMessage(msg.id)}>Edit</button>
                            <button onClick={() => handleDeleteMessage(msg.id)}>Delete</button>
                        </div>
                        )}
                        </div>
                    ))}
                </div>
                <div className="new-message-container">
                    <div id="msgWrapper">
                        <Input
                            type="text"
                            value={newMessage}
                            maxLenght="200"
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message"
                        />
                    </div>

                    <div class="file-upload-wrapper">
                      <input type="file" id="fileInput" class="file-input" onChange={handleFileChange} />
                      <label for="fileInput" class="file-label">Upload File</label>
                    </div>

                    <div>
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
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
