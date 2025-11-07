import React from "react";
import "./CommentBox.css";

export default function CommentBox({ onSubmit }) {
  const submit = (e) => {
    e.preventDefault();
    const text = e.target.text.value.trim();
    if (!text) return;
    onSubmit(text);
    e.target.reset();
  };
  return (
    <form className="comment-box" onSubmit={submit}>
      <input className="input" name="text" placeholder="Write a comment..." />
      <button className="btn">Send</button>
    </form>
  );
}
