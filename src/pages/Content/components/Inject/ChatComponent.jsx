// ChatComponent.jsx
import React, { useState, useRef, useEffect} from 'react';
import { useMessages, useUserID } from './hooks';

function ChatComponent() {
  const [newMessage, setNewMessage] = useState('');
  const userID = useUserID();
  const { messagesArray, loading, error, sendMessage } = useMessages();


  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesArray]);
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userID) return;
    
    try {
      await sendMessage(userID, newMessage, 'text');
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  const handleSendDeal = async (e) => {
    let newMess = "I found a DEAL!";
    e.preventDefault();
    try {
      await sendMessage(userID, newMess, 'notif');
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (loading) return <div className="text-center p-5">Loading messages...</div>;
  if (error) return <div className="text-center p-5">Error: {error.message}</div>;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4">
        {[...messagesArray].reverse().map(message => (
          <div 
            key={message.id} 
            className={`mb-2 p-2 rounded ${
              message.userId === userID 
                ? 'ml-auto bg-blue-100' 
                : 'bg-white border'
            }`}
            style={{ maxWidth: '80%' }}
          >
            <div>{message.message}</div>
            <div className="text-xs text-gray-500">
              {message.timestamp 
                ? new Date(message.timestamp.toDate()).toLocaleTimeString() 
                : 'Sending...'}
            </div>
          </div>
        ))}
      </div>

      {/* Input container */}
      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSendMessage} className="mb-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded"
            />
            <button 
              type="submit" 
              className="px-4 bg-blue-500 text-white rounded"
            >
              Send
            </button>
          </div>
        </form>
        <button 
          onClick={handleSendDeal}
          className="w-full p-2 bg-green-500 text-white rounded"
        >
          I found a DEAL!
        </button>
      </div>
    </div>
  );
}

export default ChatComponent;