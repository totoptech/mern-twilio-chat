import React, { useState, useEffect } from 'react';
import Chat from 'twilio-chat';
import { Chat as ChatUI } from '@progress/kendo-react-conversational-ui';
import '@progress/kendo-theme-material/dist/all.css';
import axios from 'axios';
const ChatRoom = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState({
    id: props.user.email,
    avatarUrl: 'https://via.placeholder.com/24/008000/008000.png'
  });
  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    const getClient = async () => {
      console.log(' USEEFFECT1');
      await axios
        .post('/chat/token', {
          identity: user.id
        })
        .then((res) => res.data)
        .then((data) => Chat.create(data.token))
        .then((client) => {
          console.log(' SET1');
          setClient(client);
        })
        .catch(handleError);
    };
    getClient();
  }, []);

  useEffect(() => {
    setMessages([]);
    setupChatClient(props.channelName);
    console.log(' I am props Channel Name', props.channelName);
  }, [props.channelName]);

  const setupChatClient = (channelName) => {
    console.log('I am client1', client);
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
          console.log('I am client2', client);
          return _channel.join().catch(() => {});
        })
        .then(async () => {
          setIsLoading(false);
          setChannel(_channel);
          console.log('Initialize Channel', _channel);
          const messages = await _channel.getMessages().then(messagesLoaded);
          _channel.on('messageAdded', (message) => {
            messageAdded(message, messages);
          });
        })
        .catch(handleError);
    } else setIsLoading(false);
  };
  const messagesLoaded = (messagePage) => {
    console.log('HERE MESSSAGES LOADED', messagePage);
    setMessages(messagePage.items.map(twilioMessageToKendoMessage));
    return messagePage.items.map(twilioMessageToKendoMessage);
  };
  const messageAdded = (message, messages) => {
    console.log(' ADDED MESSAGES', message, messages, channel);
    setMessages([...messages, twilioMessageToKendoMessage(message)]);
  };

  const sendMessage = (event) => {
    console.log(' SEND MESSAGES', channel, messages);
    if (props.channelName) channel.sendMessage(event.message.text);
    else{
      setupChatClient()
    }
  };
  const handleError = (error) => {
    console.error(error);
    setError('Could not load chat.');
  };
  const twilioMessageToKendoMessage = (message) => {
    return {
      text: message.body,
      author: { id: message.author, name: message.author },
      timestamp: message.timestamp
    };
  };
  console.log(' I am messages', messages);
  return (
    <>
      {error ? (
        <p>{error}</p>
      ) : isLoading ? (
        <p> Loading Chat... </p>
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
// class ChatApp extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       error: null,
//       isLoading: true,
//       messages: []
//     };
//     this.user = {
//       id: props.user.email,
//       avatarUrl: 'https://via.placeholder.com/24/008000/008000.png'
//     };

//     this.setupChatClient = this.setupChatClient.bind(this);
//     this.messagesLoaded = this.messagesLoaded.bind(this);
//     this.messageAdded = this.messageAdded.bind(this);
//     this.sendMessage = this.sendMessage.bind(this);
//     this.handleError = this.handleError.bind(this);
//   }
//   componentDidMount() {
//     console.log(this.props.user);
//     axios
//       .post('/chat/token', {
//         identity: this.props.user.email
//       })
//       .then((res) => res.data)
//       .then((data) => Chat.create(data.token))
//       .then(this.setupChatClient)
//       .catch(this.handleError);
//   }

//   handleError(error) {
//     console.error(error);
//     this.setState({
//       error: 'Could not load chat.'
//     });
//   }

//   setupChatClient(client) {
//     this.client = client;
//     console.log('I am client', this.props.channelName);
//     if (this.props.channelName) {
//       this.client
//         .getChannelByUniqueName(this.props.channelName)
//         .then((channel) => channel)
//         .catch((error) => {
//           if (error.body.code === 50300) {
//             return this.client.createChannel({
//               uniqueName: this.props.channelName
//             });
//           } else {
//             this.handleError(error);
//           }
//         })
//         .then((channel) => {
//           this.channel = channel;
//           return this.channel.join().catch(() => {});
//         })
//         .then(() => {
//           this.setState({ isLoading: false });
//           this.channel.getMessages().then(this.messagesLoaded);
//           this.channel.on('messageAdded', this.messageAdded);
//         })
//         .catch(this.handleError);
//     } else this.setState({ isLoading: false });
//   }

//   twilioMessageToKendoMessage(message) {
//     return {
//       text: message.body,
//       author: { id: message.author, name: message.author },
//       timestamp: message.timestamp
//     };
//   }

//   messagesLoaded(messagePage) {
//     this.setState({
//       messages: messagePage.items.map(this.twilioMessageToKendoMessage)
//     });
//   }

//   messageAdded(message) {
//     console.log('I ma messages', this.state.messages);

//     this.setState((prevState) => ({
//       messages: [
//         ...prevState.messages,
//         this.twilioMessageToKendoMessage(message)
//       ]
//     }));
//   }

//   sendMessage(event) {
//     console.log('messages', event.message.text);
//     this.channel.sendMessage(event.message.text);
//   }

//   componentWillUnmount() {
//     this.client.shutdown();
//   }

//   render() {
//     console.log(this.props.user);
//     if (this.state.error) {
//       return <p>{this.state.error}</p>;
//     } else if (this.state.isLoading) {
//       return <p>Loading chat...</p>;
//     }
//     return (
//       <ChatUI
//         user={this.user}
//         messages={this.state.messages}
//         onMessageSend={this.sendMessage}
//         width={500}
//       />
//     );
//   }
// }

// export default ChatApp;
