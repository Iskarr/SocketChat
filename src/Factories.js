const uuidv4 = require("uuid/v4");
//createUser
//Creates a user
//@prop id {string}
//@prop name {string}
//@param {object}
// name {string}

const createUser = ({ name = "", socketId = null } = {}) => ({
  id: uuidv4(),
  name,
  socketId
});

// createMessage
// Creates a message object
//@props id {string}
//@props time (Date) the time in 24hr format i.e 14:22
//@props message {string} actual string message
//@props sender {string} sender of the message
//@param {object}
// message {string}
// sender {string}
const createMessage = ({ message = "", sender = "" } = {}) => ({
  id: uuidv4(),
  time: getTime(new Date(Date.now())),
  message,
  sender
});

// createChat
//Creates a chat object
//@prop id {string}
//@prop name {string}
//@prop users {Array.string}
//@param {object}
//message {Array.string}
//name {string}
//users {Array.string}
const createChat = ({
  messages = [],
  name = "Community",
  users = []
} = {}) => ({
  id: uuidv4(),
  name,
  messages,
  users,
  typingUsers: []
});

//@param date {Date}
//@returns a string represented in 24hr i.e. "11:30 or 19:30"

const getTime = date => {
  return `${date.getHours()}:${("0" + date.getMinutes()).slice(-2)}`;
};

module.exports = {
  createMessage,
  createChat,
  createUser
};
