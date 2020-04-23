import React, { Component } from 'react';
import { Chat as ChatUI } from '@progress/kendo-react-conversational-ui';
import '@progress/kendo-theme-material/dist/all.css';
import { sendNewMessage, checkedMessage } from './socket';

class ChatApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      messages: [],
      isLoading: null
    };

    this.user = {
      id: props.user.email
    };
    this.client = props.client;
    this.setupChatClient = this.setupChatClient.bind(this);
    this.messagesLoaded = this.messagesLoaded.bind(this);
    this.messageAdded = this.messageAdded.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.handleError = this.handleError.bind(this);
    this.twilioMessageToKendoMessage = this.twilioMessageToKendoMessage.bind(
      this
    );
  }
  componentDidMount() {
    this.setupChatClient(this.props.channelName);
  }
  componentWillReceiveProps(nextProps) {
    console.log('Channel Name:', nextProps.channelName);
    if (nextProps.channelName !== this.props.channelName) {
      if (this.channel) this.channel.off('messageAdded', this.messageAdded);
      this.setupChatClient(nextProps.channelName);
    }
  }
  handleError(error) {
    console.error(error);
    this.setState({
      error: 'Could not load chat.'
    });
  }

  setupChatClient(channelName) {
    if (channelName) {
      console.log('I am channel', channelName);
      this.client
        .getChannelByUniqueName(channelName)
        .then((channel) => channel)
        .catch((error) => {
          if (error.body.code === 50300) {
            this.setState({ isLoading: true });
            return this.client.createChannel({ uniqueName: channelName });
          } else {
            this.handleError(error);
          }
        })
        .then((channel) => {
          this.channel = channel;
          return this.channel.join().catch(() => {});
        })
        .then(() => {
          console.log('SETSTATE');
          this.setState({ isLoading: false });
          this.channel.getMessages().then(this.messagesLoaded);
          this.channel.off('messageAdded', this.messageAdded);
          this.channel.on('messageAdded', this.messageAdded);
        })
        .catch(this.handleError);
    }
  }

  twilioMessageToKendoMessage(message) {
    const user = this.props.user;
    const friend = this.props.friend;
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
  }

  messagesLoaded(messagePage) {
    this.setState({
      messages: messagePage.items.map(this.twilioMessageToKendoMessage)
    });
  }

  messageAdded(message) {
    console.log('MESSAGE ADDED:', message, this.channel.sid);
    this.setState((prevState) => ({
      messages: [
        ...prevState.messages,
        this.twilioMessageToKendoMessage(message)
      ]
    }));
    checkedMessage(this.props.user.email, this.props.friend.email);
  }

  sendMessage(event) {
    if (this.channel) {
      this.channel.sendMessage(event.message.text);
      console.log('SEND MESSAGE:', this.props.user, this.props.friend);
      sendNewMessage(
        this.props.user.email,
        this.props.friend.email,
        event.message.text
      );
    }
  }

  render() {
    if (this.state.error) {
      return <p>{this.state.error}</p>;
    }
    console.log('This is ChatRoom Props', this.props.channelName);
    return (
      <>
        {this.state.isLoading && <p className="loading-chat">Loading...</p>}
        <ChatUI
          user={this.user}
          messages={this.state.messages}
          onMessageSend={this.sendMessage}
          width={500}
        />
      </>
    );
  }
}

export default ChatApp;
