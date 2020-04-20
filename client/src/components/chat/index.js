import React, { useState, useEffect } from 'react';
import Chat from 'twilio-chat';
import axios from 'axios';
import ChatRoom from './ChatRoom';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';
import { loadUser } from '../../actions/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.scss';
import { getUserList, getChannels, newChannel } from './socket';

const ChatHome = (props) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [channelName, setChannelName] = useState(null);
  const [isLocked, setIsLocked] = useState(null);
  const [client, setClient] = useState(null);
  const [error, setError] = useState(null);
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
          setClient(client);
          setLoading(false);
        })
        .catch(handleError);
    };
    getClient();
    //create a socket for handling get userlist from backend
    getUserList(handleGetUserList);
    getChannels(handleGetChannels);
    // handleChangeUser(0);
  }, []);
  useEffect(() => {
    if (props.user) setChannels(props.user.channels);
  }, [props.user]);

  const handleError = (error) => {
    console.error(error);
    setError('Could not load chat.');
  };
  const handleGetChannels = (data) => {
    setChannels(data.channels);
  };
  //Handle GetUserList event
  const handleGetUserList = (data) => {
    if (props.user) {
      const ind = data.findIndex((user) => {
        return user.username === props.user.name;
      });
      data.splice(ind, 1);
      setUserList(data);
    }
  };
  const handleStartMessaging = async () => {
    const user1 = props.user.email;
    const user2 = userList[selectedIndex].email;

    const res = await axios.post('api/chat/create-channel', {
      user1,
      user2
    });
    if (res.data.status === 'success') {
      setChannelName(user1 + user2);
      setIsLocked(false);
      newChannel(user2);
    }
  };

  const handleChangeUser = (index) => {
    const channel = channels.find(
      (channel) => channel.user === userList[index].email
    );
    if (channel) {
      setChannelName(channel.name);
      setIsLocked(false);
    } else {
      setChannelName(null);
      setIsLocked(true);
    }
    setSelectedIndex(index);
  };
  const handleChangeChannel = (channel) => {
    setChannelName(channel);
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
                      (index === selectedIndex ? 'user-selected ' : '') +
                      'user-list'
                    }
                    onClick={() => handleChangeUser(index)}
                    key={user.email}
                  >
                    <img
                      className="user-avatar"
                      src="https://www.pphfoundation.ca/wp-content/uploads/2018/05/default-avatar.png"
                    ></img>
                    <p className="user-title">{user.username}</p>
                  </div>
                ))}
              </div>
              <div className="col-md-5">
                {props.user &&
                  (!isLocked ? (
                    <ChatRoom
                      user={props.user}
                      channelName={channelName}
                      client={client}
                      friend={userList[selectedIndex]}
                      handleChangeChannel={handleChangeChannel}
                    />
                  ) : (
                    <div className="nochannel-container">
                      <button
                        className="btn btn-danger start-button"
                        onClick={handleStartMessaging}
                      >
                        Start Messaging
                      </button>
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
