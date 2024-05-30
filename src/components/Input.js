import '../App.css';
import {useState} from "react";

export default function Input({ text, value, onChange }) {
    return (
        <div className="input">
            <p>{text}</p>
            <input type="text" id="name" name="name" value={value} onChange={onChange} required minLength="3" maxLength="20" size="30" />
        </div>
    );
};