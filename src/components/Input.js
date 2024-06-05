import '../App.css';
import {useState} from "react";

export default function Input({ text, value, onChange, maxLenght }) {
    return (
        <div className="input">
            <p>{text}</p>
            <input type="text" id="name" name="name" value={value} onChange={onChange} required minLength="3" maxLength={maxLenght} size="30" />
        </div>
    );
};
