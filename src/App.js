import './App.css';
import Input from "./components/Input";
import Sender from "./components/Sender";
import {useState} from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate} from 'react-router-dom';
import Group from "./Group";

export default function App() {
    const [username, setUsername] = useState('');
    const [group, setGroup] = useState('');
    const navigate = useNavigate();

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handleGroupChange = (e) => {
        setGroup(e.target.value);
    };

    const data = {"username": username, "group": group};

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            navigate(`/${group}`);
        } catch (error) {
            console.error('Error: ', error);
        }
    }

    return (
    <>
        <Routes>
            <Route path="/" element={
                <form onSubmit={handleSubmit}>
                    <div className="container">
                        <Input text={"Username"} value={username} onChange={handleUsernameChange} maxLenght="20"/>
                        <Input text={"Group"} value={group} onChange={handleGroupChange}/>
                        <Sender style={{paddingTop: 50}}/>
                    </div>
                </form>
            } />
            <Route path="/:group" element={<Group data={data} />} />
        </Routes>
    </>
    );
}

