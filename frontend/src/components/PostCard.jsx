import React from "react";
import "./PostCard.css";
import { likePost } from "../services/posts";
import { Link } from "react-router-dom";

export default function PostCard({ post, onLike, onComment }) {
  const handleLike = async () => {
    const updated = await likePost(post._id);
    onLike(updated);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const text = form.get("text").trim();
    if (!text) return;
    await onComment(post._id, text);
    e.currentTarget.reset();
  };

  return (
    <article className="card post">
      <header className="post-head">
        <div className="avatar" />
        <div>
          <div className="author">{post.author?.username || "user"}</div>
          <div className="mute">{new Date(post.createdAt).toLocaleString()}</div>
        </div>
        <div className="grow" />
        <Link className="tag" to={`/profile/${post.author?._id || ""}`}>View Profile</Link>
      </header>

      <h3 className="post-title">{post.title}</h3>
      <p className="post-body">{post.content}</p>

      <div className="spaced mt-12">
        <button className="btn secondary" onClick={handleLike}>❤️ {post.likes?.length || 0}</button>
        <div className="mute">{post.comments?.length || 0} comments</div>
      </div>

      <form className="row mt-12" onSubmit={handleComment}>
        <input className="input" name="text" placeholder="Write a comment..." />
        <button className="btn" type="submit">Comment</button>
      </form>

      <div className="comments mt-12">
        {post.comments?.slice().reverse().map((c, i) => (
          <div key={i} className="comment">
            <div className="avatar" />
            <div>
              <div className="author">{c.user?.username || "user"}</div>
              <div>{c.text}</div>
              <div className="mute" style={{fontSize: "12px"}}>
                {new Date(c.date || post.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
