import React, { useState } from "react";
import { useSelector } from "react-redux";
import Layout from "../components/shared/Layout/Layout";
import API from "../services/API";

const getRoleLabel = (role) =>
  role === "organisation" ? "organization" : role || "user";

const getSuggestedQuestions = (role) => {
  const normalizedRole = getRoleLabel(role);

  if (normalizedRole === "hospital") {
    return [
      "What are my recent transactions?",
      "Which organizations currently have blood available for my needs?",
      "Summarize my recent blood requests.",
    ];
  }

  if (normalizedRole === "organization") {
    return [
      "Which blood groups are low in my inventory?",
      "Summarize my pending hospital requests.",
      "Show my recent transaction history.",
    ];
  }

  if (normalizedRole === "admin") {
    return [
      "Give me a summary of recent platform transactions.",
      "How many hospitals and organizations are registered?",
      "Summarize current admin analytics.",
    ];
  }

  return [
    "What is my recent donation history?",
    "Summarize my scheduled donations.",
    "Which donation camps are available?",
  ];
};

const AIAssistant = () => {
  const { user } = useSelector((state) => state.auth);
  const storedUser = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null;
  const currentUser = user || storedUser;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const suggestedQuestions = getSuggestedQuestions(currentUser?.role);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || loading) {
      return;
    }

    const nextMessages = [...messages, { role: "user", content: trimmedMessage }];
    setMessages(nextMessages);
    setMessage("");
    setLoading(true);
    setError("");

    try {
      const { data } = await API.post("/ai/assistant", {
        message: trimmedMessage,
        history: nextMessages.slice(-6),
      });

      if (data?.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Unable to get AI response");
      setMessages((prev) => prev.slice(0, -1));
      setMessage(trimmedMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <h2 className="mb-1">AI Assistant</h2>
            <p className="text-muted mb-0">
              Read-only help for your {getRoleLabel(currentUser?.role)} dashboard,
              transactions, inventory, requests, schedules, and analytics.
            </p>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <div
                  className="border rounded-4 p-3 mb-3 bg-light"
                  style={{ minHeight: "420px", maxHeight: "520px", overflowY: "auto" }}
                >
                  {!messages.length && (
                    <div className="text-muted">
                      Ask questions like:
                      {suggestedQuestions.map((question, index) => (
                        <div key={question} className={index === 0 ? "mt-2" : ""}>
                          {question}
                        </div>
                      ))}
                    </div>
                  )}

                  {messages.map((item, index) => (
                    <div key={`${item.role}-${index}`} className="mb-3">
                      <div className="small text-uppercase text-muted mb-1">
                        {item.role === "assistant" ? "Assistant" : "You"}
                      </div>
                      <div className="p-3 rounded-3 bg-white border">{item.content}</div>
                    </div>
                  ))}

                  {loading && (
                    <div className="mb-3">
                      <div className="small text-uppercase text-muted mb-1">
                        Assistant
                      </div>
                      <div className="p-3 rounded-3 bg-white border">
                        Thinking...
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Your question</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Ask about your inventory, requests, transactions, camps, schedules, or analytics"
                    />
                  </div>
                  {error && <div className="text-danger mb-3">{error}</div>}
                  <button type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? "Generating..." : "Send"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="mb-3">Assistant Scope</h5>
                <div className="text-muted small">
                  This assistant is read-only.
                </div>
                <div className="text-muted small mt-2">
                  It can summarize role-specific data already in your system.
                </div>
                <div className="text-muted small mt-2">
                  It cannot approve requests, verify payments, or change inventory.
                </div>
                <div className="text-muted small mt-2">
                  It should say when the required data is not available.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AIAssistant;
