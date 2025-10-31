// src/ChatPage.jsx
import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

const ChatPage = () => {
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [showUsernameModal, setShowUsernameModal] = useState(true);
  const [inputUsername, setInputUsername] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [newSuggestion, setNewSuggestion] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([]); // ✅ now dynamic

  // ✅ Realtime messages listener
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Fetch suggestions from Firestore
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "suggestions"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSuggestions(data);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };

    fetchSuggestions();
  }, []);

  // ✅ Handle Username Submit
  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    if (!inputUsername.trim()) return alert("Please enter a username");

    try {
      await addDoc(collection(db, "users"), {
        username: inputUsername.trim(),
        createdAt: serverTimestamp(),
      });
      setUsername(inputUsername.trim());
      setShowUsernameModal(false);
    } catch (err) {
      console.error("Error saving username:", err);
    }
  };

  // ✅ Send Message
  const handleSend = async () => {
    if (!message.trim()) return;
    try {
      await addDoc(collection(db, "messages"), {
        text: message.trim(),
        sender: username,
        createdAt: serverTimestamp(),
      });
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ✅ Add new suggestion to Firestore
  const handleAddSuggestion = async () => {
    if (!newSuggestion.trim()) return;
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "suggestions"), {
        text: newSuggestion.trim(),
        createdAt: serverTimestamp(),
      });
      setSuggestions([
        ...suggestions,
        { id: docRef.id, text: newSuggestion.trim() },
      ]);
      setNewSuggestion("");
    } catch (err) {
      console.error("Error adding suggestion:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddSuggestion();
    }
  };

  // ✅ Delete suggestion in Firestore
  const handleDeleteSuggestion = async (id) => {
    try {
      await deleteDoc(doc(db, "suggestions", id));
      setSuggestions(suggestions.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Error deleting suggestion:", err);
    }
  };

  return (
    <div className="chat-page-container">
      {/* ✅ Username Modal */}
      {showUsernameModal && (
        <div className="username-modal">
          <div className="username-modal-content">
            <h2>Enter your username</h2>
            <form onSubmit={handleUsernameSubmit}>
              <input
                type="text"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                placeholder="Type your name..."
                className="username-input"
              />
              <button type="submit" className="username-submit-btn">
                Continue
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Main Chat Layout (only show if username entered) */}
      {!showUsernameModal && (
        <div className="chat-page-grid">
          <div className="logo-section">
            <div className="logo-wrapper">
              <h3>Archi</h3>
              <p className="username-label">Logged in as: {username}</p>
            </div>
          </div>

          {/* ✅ Chat Display */}
          <div className="display-section">
            <div className="display-chatfield-container">
              <div className="messages-wrapper">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${
                      msg.sender === username ? "user-message" : "bot-message"
                    }`}
                  >
                    <div className="message-content">
                      <strong>{msg.sender}: </strong> {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ✅ Suggestions Section (Desktop) */}
          <div className="suggestions-section-desktop">
            <div className="suggestion-container">
              <div className="suggestion-header">
                <h2 className="suggestion-title">Suggestions</h2>
              </div>

              <div className="suggestion-input-area">
                <input
                  type="text"
                  value={newSuggestion}
                  onChange={(e) => setNewSuggestion(e.target.value)}
                  onKeyPress={handleSuggestionKeyPress}
                  placeholder="Add a suggestion..."
                  className="suggestion-input"
                />
                <button
                  onClick={handleAddSuggestion}
                  className="suggestion-add-btn"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add"}
                </button>
              </div>

              <div className="suggestion-list">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="suggestion-card">
                    <div className="suggestion-text">{suggestion.text}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSuggestion(suggestion.id);
                      }}
                      className="suggestion-delete-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ✅ Input Section */}
          <div className="input-section">
            <textarea
              className="message-input"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
            />
            <button className="send-btn" onClick={handleSend}>
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
