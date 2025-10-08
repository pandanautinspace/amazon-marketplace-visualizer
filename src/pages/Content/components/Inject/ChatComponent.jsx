// ChatComponent.jsx
import React, { useState } from 'react';
import { useMessages, useUserID } from './hooks'; // Adjust path as needed

function ChatComponent() {
  const [newMessage, setNewMessage] = useState('');
  const userID = useUserID();
  const { messagesArray, loading, error, sendMessage } = useMessages();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userID) return;
    
    try {
      await sendMessage(userID, newMessage, 'text');
      setNewMessage(''); // Clear input after sending
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const chatStyles = {
    chatContainer: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      backgroundColor: '#f5f5f5',
      borderRadius: '4px',
      boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)',
    },
    messagesList: {
      flex: 1,
      overflowY: 'auto',
      padding: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    message: {
      padding: '8px 12px',
      borderRadius: '12px',
      maxWidth: '80%',
      wordBreak: 'break-word',
    },
    sent: {
      alignSelf: 'flex-end',
      backgroundColor: '#DCF8C6',
    },
    received: {
      alignSelf: 'flex-start',
      backgroundColor: '#FFFFFF',
      borderColor: '#E2E2E2',
    },
    form: {
      display: 'flex',
      padding: '8px',
      borderTop: '1px solid #ddd',
    },
    input: {
      flex: 1,
      padding: '8px',
      borderRadius: '16px',
      border: '1px solid #ddd',
      outline: 'none',
    },
    button: {
      marginLeft: '8px',
      padding: '8px 12px',
      border: 'none',
      borderRadius: '16px',
      backgroundColor: '#0B93F6',
      color: 'white',
      cursor: 'pointer',
    },
    loadingText: {
      textAlign: 'center',
      padding: '20px',
    }
  };

  if (loading) return <div style={chatStyles.loadingText}>Loading messages...</div>;
  if (error) return <div style={chatStyles.loadingText}>Error: {error.message}</div>;

  return (
    <div style={chatStyles.chatContainer}>
      <div style={chatStyles.messagesList}>
        {messagesArray.map(message => (
          <div 
            key={message.id} 
            style={{
              ...chatStyles.message,
              ...(message.userId === userID ? chatStyles.sent : chatStyles.received)
            }}
          >
            <div>{message.message}</div>
            <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7 }}>
              {message.timestamp 
                ? new Date(message.timestamp.toDate()).toLocaleTimeString() 
                : 'Sending...'}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} style={chatStyles.form}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={chatStyles.input}
        />
        <button type="submit" style={chatStyles.button}>Send</button>
      </form>
    </div>
  );
}

export default ChatComponent;