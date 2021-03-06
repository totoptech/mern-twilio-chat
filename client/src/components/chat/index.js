import React, { useState, useEffect } from 'react';
import Chat from 'twilio-chat';
import axios from 'axios';
import ChatRoom from './ChatRoom';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';
import { loadUser } from '../../actions/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.scss';
import { getUserList, getChannels, newChannel, checkedMessage } from './socket';

const ChatHome = (props) => {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [channelName, setChannelName] = useState(undefined);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState([]);
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    const getClient = async () => {
      await axios
        .post('/chat/token', {
          identity: props.user.email
        })
        .then((res) => res.data)
        .then((data) => Chat.create(data.token))
        .then((client) => {
          getUserList(handleGetUserList, props.user.email);
          getChannels(handleGetChannels);
          setClient(client);
          setLoading(false);
        })
        .catch(handleError);
    };
    getClient();
  }, []);

  useEffect(() => {
    if (props.user) setChannels(props.user.channels);
  }, [props.user]);

  const handleError = (error) => {
    console.error(error);
  };
  const handleGetChannels = (data) => {
    console.log(' I am handle Channels!!!!!!!!!!!!', data.channels);
    setChannels(data.channels);
  };
  console.log('I am channels!!!!!!!!!!!!!!!!!!!!!', channels);
  //Handle GetUserList event
  const handleGetUserList = (data) => {
    console.log('I am get user list', data);
    if (props.user) {
      const ind = data.findIndex((user) => {
        return user.username === props.user.name;
      });
      data.splice(ind, 1);
      if (data.length === 0) setChannelName(undefined);
      setUserList(data);
    }
  };
  const handleStartMessaging = async () => {
    const senderEmail = props.user.email;
    const senderName = props.user.name;
    const index = userList.findIndex((user) => user.email === selectedEmail);
    const receiverEmail = userList[index].email;
    const receiverName = userList[index].username;

    const res = await axios.post('api/chat/create-channel', {
      senderEmail,
      senderName,
      receiverEmail,
      receiverName
    });
    if (res.data.status === 'success') {
      console.log('SUCESS', channelName, senderEmail + receiverEmail);
      setChannelName(senderEmail + receiverEmail);
      newChannel(receiverEmail);
    }
  };

  const handleChangeUser = (email) => {
    const channel = channels.find((channel) => channel.friendEmail === email);
    if (channel) {
      setChannelName(channel.name);
      checkedMessage(props.user.email, email);
    } else {
      setChannelName(null);
    }
    setSelectedEmail(email);
  };
  const getTime = (time) => {
    const date = new Date(time);
    const now = Date.now();
    console.log(date.getMinutes());
    if (now - time < 86400000)
      return (
        date.getHours() +
        ':' +
        (date.getMinutes() < 10 ? '0' : '') +
        date.getMinutes()
      );
    return (
      date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()
    );
  };
  const getSelectedName = () => {
    const index = userList.findIndex((user) => user.email === selectedEmail);
    return index > -1 ? userList[index].username : '';
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        client && (
          <div className="chat-container">
            <div className="row">
              <div className="col-md-2"></div>
              <div className="col-md-3 user-container">
                {userList.map((user, index) => (
                  <div
                    className={
                      (user.email === selectedEmail ? 'user-selected ' : '') +
                      'user-list'
                    }
                    onClick={() => handleChangeUser(user.email)}
                    key={user.email}
                  >
                    <div
                      className={(user.status ? 'online ' : '') + 'user-status'}
                    ></div>
                    <img
                      className="user-avatar"
                      src="https://www.pphfoundation.ca/wp-content/uploads/2018/05/default-avatar.png"
                      alt="user"
                    ></img>
                    <div className="user-title">
                      <p className="username">{user.username}</p>
                      <p className="message">{user.lastmsg}</p>
                    </div>
                    <div className="user-alarm">
                      {user.time && (
                        <div className="user-time">{getTime(user.time)}</div>
                      )}
                      {user.unchecked !== 0 && user.email !== selectedEmail && (
                        <div className="user-unchecked">{user.unchecked}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="col-md-7">
                {props.user &&
                  (channelName ? (
                    <ChatRoom
                      user={props.user}
                      channelName={channelName}
                      client={client}
                      friend={{
                        email: selectedEmail,
                        username: getSelectedName()
                      }}
                    />
                  ) : (
                    <div className="nochannel-container">
                      {channelName !== undefined && (
                        <button
                          className="btn btn-danger start-button"
                          onClick={handleStartMessaging}
                        >
                          Start Messaging
                        </button>
                      )}
                    </div>
                  ))}
              </div>
              <div className="col-md-2"></div>
            </div>
          </div>
        )
      )}
    </>
  );
};
const mapStateToProps = (state) => ({
  user: state.auth.user
});

export default connect(mapStateToProps, { loadUser })(ChatHome);
