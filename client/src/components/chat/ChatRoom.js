import React, { Component } from 'react';
import { Chat as ChatUI } from '@progress/kendo-react-conversational-ui';
import '@progress/kendo-theme-material/dist/all.css';
import { sendNewMessage, checkedMessage } from './socket';

class ChatApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      messages: []
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
  componentWillReceiveProps(nextProps) {
    if (nextProps.channelName !== this.props.channelName) {
      if (this.channel) this.channel.leave();
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
      this.client
        .getChannelByUniqueName(channelName)
        .then((channel) => channel)
        .catch((error) => {
          if (error.body.code === 50300) {
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
    this.setState((prevState) => ({
      messages: [
        ...prevState.messages,
        this.twilioMessageToKendoMessage(message)
      ]
    }));
    checkedMessage(this.props.user.email, this.props.friend.email);
  }

  sendMessage(event) {
    this.channel.sendMessage(event.message.text);
    this.props.setSelectedIndex(0);
    sendNewMessage(
      this.props.user.email,
      this.props.friend.email,
      event.message.text
    );
  }

  componentWillUnmount() {
    this.client.shutdown();
  }

  render() {
    if (this.state.error) {
      return <p>{this.state.error}</p>;
    }
    return (
      <ChatUI
        user={this.user}
        messages={this.state.messages}
        onMessageSend={this.sendMessage}
        width={500}
      />
    );
  }
}

export default ChatApp;
