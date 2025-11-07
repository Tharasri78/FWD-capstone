import React, { useEffect, useState } from "react";
import "./Profile.css";
import { useParams } from "react-router-dom";
import { getProfile, followUser } from "../services/users";
import { fetchPosts } from "../services/posts";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  const load = async () => {
    const u = await getProfile(id);
    setProfile(u);
    const all = await fetchPosts();
    setPosts(all.filter(p => p.author?._id === id));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const follow = async () => {
    await followUser(id, user._id);
    const u = await getProfile(id);
    setProfile(u);
  };

  return (
    <div className="grid grid-2">
      <aside className="card">
        {!profile ? (
          "Loading..."
        ) : (
          <>
            <div className="spaced">
              <div style={{display:"flex", alignItems:"center", gap:12}}>
                <div className="avatar" />
                <div>
                  <h2 style={{margin:0}}>{profile.username}</h2>
                  <div className="mute">{profile.email}</div>
                </div>
              </div>
              {user._id !== id && (
                <button className="btn" onClick={follow}>Follow</button>
              )}
            </div>
            <p className="mt-12">{profile.bio || "No bio yet."}</p>
            <div className="row mt-12">
              <span className="tag">Followers: {profile.followers?.length || 0}</span>
              <span className="tag">Following: {profile.following?.length || 0}</span>
              <span className="tag">Posts: {posts.length}</span>
            </div>
          </>
        )}
      </aside>

      <section className="card">
        <h3>Recent Posts</h3>
        <div className="stack mt-12">
          {posts.map(p => <PostCard key={p._id} post={p} onLike={() => {}} onComment={() => {}} />)}
          {posts.length === 0 && <div className="mute">No posts yet.</div>}
        </div>
      </section>
    </div>
  );
}
