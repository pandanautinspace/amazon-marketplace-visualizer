// ChatComponent.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useMessages, useUserID, useMarketplaceLocation } from '../Inject/hooks';
import { getCurrentCategory } from '../../modules/breadcrumbs';
import { COLORS } from '../Inject/constants';

// Predefined emoji messages
export const EMOJI_MESSAGES = [
  { emoji: '💰', message: 'Great deal!', label: 'Deal' },
  { emoji: '👍', message: 'Recommend this', label: 'Recommend' },
  { emoji: '❓', message: 'Need help', label: 'Help' },
  { emoji: '🔥', message: 'This is hot!', label: 'Hot' },
  { emoji: '⭐', message: 'Favorite!', label: 'Favorite' },
  { emoji: '👀', message: 'Check this out', label: 'Look' }
];

function ChatComponent() {
  const [isProximityMode, setIsProximityMode] = useState(true);
  const userID = useUserID();
  const location = useMarketplaceLocation();
  const { messagesArray, loading, error, sendMessage } = useMessages();

  const messagesEndRef = useRef(null);

  // Get current category for proximity mode
  const currentCategory = getCurrentCategory(location);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesArray]);

  const handleSendEmoji = async (emojiData) => {
    if (!userID) return;

    try {
      const messageData = {
        message: emojiData.message,
        emoji: emojiData.emoji
      };

      // Add category if in proximity mode
      if (isProximityMode && currentCategory) {
        messageData.category = currentCategory;
      }

      await sendMessage(userID, messageData.message, 'emoji', messageData.category);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Filter messages based on mode
  const filteredMessages = messagesArray.filter(message => {
    if (!isProximityMode) return true; // Global mode shows all
    if (!currentCategory) return true; // If no category, show all
    return !message.category || message.category === currentCategory;
  });

  if (loading) return <div className="text-center p-5">Loading messages...</div>;
  if (error) return <div className="text-center p-5">Error: {error.message}</div>;

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: COLORS.offWhite }}>
      {/* Header with mode toggle */}
      <div className="p-3" style={{
        backgroundColor: COLORS.lightBrown,
        borderBottom: `2px solid ${COLORS.darkBrown}`
      }}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: COLORS.darkBrown }}>
            {isProximityMode ? '📍 Proximity' : '🌍 Global'}
          </span>
          <button
            onClick={() => setIsProximityMode(!isProximityMode)}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            style={{ backgroundColor: isProximityMode ? COLORS.green : COLORS.darkBrown }}
          >
            <span
              className="inline-block h-4 w-4 transform rounded-full transition-transform"
              style={{
                backgroundColor: COLORS.white,
                transform: isProximityMode ? 'translateX(1.5rem)' : 'translateX(0.25rem)'
              }}
            />
          </button>
        </div>
        {isProximityMode && currentCategory && (
          <div className="text-xs mt-1" style={{ color: COLORS.darkBrown }}>
            In: {currentCategory}
          </div>
        )}
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredMessages.map(message => (
          <div
            key={message.id}
            className="mb-2 p-2 rounded"
            style={{
              maxWidth: '80%',
              marginLeft: message.userId === userID ? 'auto' : '0',
              backgroundColor: message.userId === userID ? COLORS.lightBrown : COLORS.green,
              border: `1px solid ${COLORS.darkBrown}`,
              color: COLORS.white
            }}
          >
            <div className="flex items-center gap-2">
              {message.type === 'emoji' && <span className="text-2xl">{getEmojiFromMessage(message.message)}</span>}
              <span style={{ color: COLORS.white }}>{message.message}</span>
            </div>
            {message.category && (
              <div className="text-xs mt-1" style={{ color: COLORS.white, opacity: 0.8 }}>
                📍 {message.category}
              </div>
            )}
            <div className="text-xs" style={{ color: COLORS.white, opacity: 0.7 }}>
              {message.timestamp
                ? new Date(message.timestamp.toDate()).toLocaleTimeString()
                : 'Sending...'}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji buttons */}
      <div className="p-3" style={{
        backgroundColor: COLORS.green,
        borderTop: `2px solid ${COLORS.darkBrown}`
      }}>
        <div className="grid grid-cols-3 gap-2">
          {EMOJI_MESSAGES.map((emojiData, index) => (
            <button
              key={index}
              onClick={() => handleSendEmoji(emojiData)}
              className="flex flex-col items-center justify-center p-3 rounded-lg transition-colors"
              style={{
                backgroundColor: COLORS.offWhite,
                border: `2px solid ${COLORS.darkBrown}`,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.lightBrown}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.offWhite}
              title={emojiData.message}
            >
              <span className="text-2xl mb-1">{emojiData.emoji}</span>
              <span className="text-xs" style={{ color: COLORS.darkBrown }}>{emojiData.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper function to get emoji from message
function getEmojiFromMessage(message) {
  const emojiData = EMOJI_MESSAGES.find(e => e.message === message);
  return emojiData ? emojiData.emoji : '💬';
}

export default ChatComponent;