import React, { useState, useEffect } from 'react';
import { Chat as ChatUI } from '@progress/kendo-react-conversational-ui';
import '@progress/kendo-theme-material/dist/all.css';

const ChatRoom = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState({
    id: props.user.email,
    author: props.user.name,
    avatarUrl: 'https://via.placeholder.com/24/008000/008000.png'
  });
  const [channel, setChannel] = useState(null);

  const client = props.client;
  useEffect(() => {
    setMessages([]);
    setupChatClient(props.channelName);
  }, [props.channelName]);
  useEffect(() => {
    if (channel) {
      channel.on('messageAdded', messageAdded);
    }
  }, [messages]);
  const setupChatClient = (channelName) => {
    let _channel;
    if (channelName) {
      client
        .getChannelByUniqueName(channelName)
        .then((channel) => channel)
        .catch((error) => {
          if (error.body.code === 50300) {
            return client.createChannel({
              uniqueName: channelName
            });
          } else {
            handleError(error);
          }
        })
        .then((res_channel) => {
          _channel = res_channel;
          return _channel.join().catch(() => {});
        })
        .then(() => {
          setIsLoading(false);
          setChannel(_channel);
          _channel.getMessages().then(messagesLoaded);
        })
        .catch(handleError);
    } else setIsLoading(false);
  };
  const messagesLoaded = (messagePage) => {
    setMessages(messagePage.items.map(twilioMessageToKendoMessage));
    return messagePage.items.map(twilioMessageToKendoMessage);
  };
  const messageAdded = (message) => {
    setMessages([...messages, twilioMessageToKendoMessage(message)]);
  };

  const sendMessage = (event) => {
    if (channel) channel.sendMessage(event.message.text);
  };
  const handleError = (error) => {
    console.error(error);
    setError('Could not load chat.');
  };
  const twilioMessageToKendoMessage = (message) => {
    const user = props.user;
    const friend = props.friend;
    const name = message.author === user.email ? user.name : friend.username;
    return {
      text: message.body,
      author: {
        id: message.author,
        name,
        avatarUrl:
          'https://www.pphfoundation.ca/wp-content/uploads/2018/05/default-avatar.png'
      },
      timestamp: message.timestamp
    };
  };
  return (
    <>
      {error ? (
        <p>{error}</p>
      ) : (
        <ChatUI
          user={user}
          messages={messages}
          onMessageSend={sendMessage}
          width={500}
        />
      )}
    </>
  );
};
export default ChatRoom;
