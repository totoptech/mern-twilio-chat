import React, { useState, useEffect } from 'react';
import ChatRoom from './ChatRoom';
import { connect } from 'react-redux';
import { loadUser } from '../../actions/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.scss';

const userList = [
  { name: 'A & A', email: 'futureman.tech@gmail.com' },
  { name: 'B & B', email: 'admin@demo.com' },
  { name: 'C & C', email: 'admin@123.com' }
];
const ChatHome = (props) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [channelName, setChannelName] = useState(null);
  console.log(props);
  const handleChangeUser = (index) => {
    const user = props.user;
    const channel = user.channels.find(
      (channel) => channel.user === userList[index].email
    );
    
    channel ? setChannelName(channel.name) : setChannelName(null);
    setSelectedIndex(index);
  };

  return (
    <div className="chat-container">
      <div className="row">
        <div className="col-md-2"></div>
        <div className="col-md-3 user-container">
          {userList.map((user, index) => (
            <div
              className={
                (index === selectedIndex ? 'user-selected ' : '') + 'user-list'
              }
              onClick={() => handleChangeUser(index)}
              key={user.name}
            >
              <img
                className="user-avatar"
                src="https://www.pphfoundation.ca/wp-content/uploads/2018/05/default-avatar.png"
              ></img>
              <p className="user-title">{user.name}</p>
            </div>
          ))}
        </div>
        <div className="col-md-5">
          {props.user && (
            <ChatRoom user={props.user} channelName={channelName} />
          )}
        </div>
        <div className="col-md-2"></div>
      </div>
    </div>
  );
};
const mapStateToProps = (state) => ({
  user: state.auth.user
});

export default connect(mapStateToProps, { loadUser })(ChatHome);
