const io = require("./index.js").io;
const {
  VERIFY_USER,
  USER_CONNECTED,
  USER_DISCONNECTED,
  LOGOUT,
  COMMUNITY_CHAT,
  MESSAGE_RECIEVED,
  MESSAGE_SENT,
  TYPING,
  PRIVATE_MESSAGE,
  NEW_CHAT_USER
} = require("../Events");
const { createUser, createMessage, createChat } = require("../Factories");
const colors = require("colors");

let connectedUsers = {};
let communityChat = createChat({ isCommunity: true });
let SendTypingFromUser;

//MongoDB section

//Mongo is required to connect to the DB
var mongoose = require("mongoose");
//Mongo connects to a test database using the 27017 localhost address
mongoose.connect("mongodb://localhost:27017/test", { useNewUrlParser: true });
//this is the actual connection var we use
var db = mongoose.connection;

// this just spits out the connection and tells us if it is connected
db.on("error", console.error.bind(console, "connection Error".red));
db.once("open", function(callback) {
  console.log("Connection Success!!".green);
});

// Schema
var Schema = mongoose.Schema;
var bugSchema = new Schema({
  bugname: String,
  bugColour: String,
  Genus: String
});

var Bug = mongoose.model("Bug", bugSchema);
module.exports = Bug;
// The object to be  saved
var bee = new Bug({
  bugname: "Scruffy",
  bugColour: "Orange",
  Genus: "Bombus"
});

// Saves the bee
function SaveLaBee() {
  bee.save(function(error) {
    console.log("Your WORD had been saved!!".green);
    if (error) {
      console.error(error);
    }
  });
}

// Socket Exports
module.exports = function(socket) {
  console.log("Socket Id: " + socket.id);

  let sendMessageToChatFromUser;

  //This sends and logs chatId, message and socketId
  socket.on(MESSAGE_SENT, ({ chatId, message }) => {
    const UserId = socket.id;
    var MessageBug = new Bug({
      bugname: message,
      bugColour: chatId,
      Genus: UserId
    });
    function SaveLaBee() {
      MessageBug.save(function(error) {
        console.log("Your WORD had been saved!!".green);
        if (error) {
          console.error(error);
        }
      });
    }
    var DataMessage = message;
    sendMessageToChatFromUser(chatId, message);
    console.log("Saving Message: ".green + SaveLaBee());
    //Add SaveLaBee() to console.log to save messages.
  });

  //Verify User
  socket.on(VERIFY_USER, (nickname, callback) => {
    if (isUser(connectedUsers, nickname)) {
      callback({ isUser: true, user: null });
    } else {
      callback({
        isUser: false,
        user: createUser({ name: nickname, socketId: socket.id })
      });
    }
  });

  //User Connects with username
  socket.on(USER_CONNECTED, user => {
    user.socketId = socket.id;
    connectedUsers = addUser(connectedUsers, user);
    socket.user = user;

    sendMessageToChatFromUser = sendMessageToChat(user.name);
    SendTypingFromUser = sendTypingToChat(user.name);

    io.emit(USER_CONNECTED, connectedUsers);
    console.log(connectedUsers);
  });

  //User disconnects
  socket.on("disconnect", () => {
    if ("user" in socket) {
      connectedUsers = removeUser(connectedUsers, socket.user.name);

      io.emit(USER_DISCONNECTED, connectedUsers);
      console.log("Disconnect ", connectedUsers);
    }
  });
  // User logouts
  socket.on(LOGOUT, () => {
    connectedUsers = removeUser(connectedUsers, socket.user.name);
    io.emit(USER_DISCONNECTED, connectedUsers);
    console.log("Disconnect ", connectedUsers);
  });

  // Get Community chat
  socket.on(COMMUNITY_CHAT, callback => {
    callback(communityChat);
  });

  socket.on(TYPING, ({ chatId, isTyping }) => {
    SendTypingFromUser(chatId, isTyping);
  });

  // Private Messages
  socket.on(PRIVATE_MESSAGE, ({ reciever, sender, activeChat }) => {
    if (reciever in connectedUsers) {
      const recieverSocket = connectedUsers[reciever].socketId;
      if (activeChat === null || activeChat.id === communityChat.id) {
        const newChat = createChat({
          name: `${reciever}&${sender}`,
          users: [reciever, sender]
        });
        socket.to(recieverSocket).emit(PRIVATE_MESSAGE, newChat);
        socket.emit(PRIVATE_MESSAGE, newChat);
      } else {
        if (!(reciever in activeChat.users)) {
          activeChat.users
            .filter(user => user in connectedUsers)
            .map(user => connectedUsers[user])
            .map(user => {
              socket.to(user.socketId).emit(NEW_CHAT_USER, {
                chatId: activeChat.id,
                newUser: reciever
              });
            });
          socket.emit(NEW_CHAT_USER, {
            chatId: activeChat.id,
            newUser: reciever
          });
        }
        socket.to(recieverSocket).emit(PRIVATE_MESSAGE, activeChat);
      }
    }
  });
};

// Returns a function that will take a chat id and a boolean isTyping
// and then emit a broadcast to the chat id that the sender is typing
// @param sender {string} username of sender
// @return function(chatId, message)
function sendTypingToChat(user) {
  return (chatId, isTyping) => {
    io.emit(`${TYPING}-${chatId}`, { user, isTyping });
  };
}

// Returns a function that will take a chat id and message
// and then emit a broadcast to the chat id.
// @param sender {string} username of sender
// @return function(chatId, message)

function sendMessageToChat(sender) {
  return (chatId, message) => {
    io.emit(
      `${MESSAGE_RECIEVED}-${chatId}`,
      createMessage({ message, sender })
    );
  };
}

//Adds user to list passed in.
//@param userList {object} Object with key value pairs of users
//@param {User} the user is added to the list
//@return userList {Object} Object with key value pairs of users
function addUser(userList, user) {
  let newList = Object.assign({}, userList);
  newList[user.name] = user;
  return newList;
}

//Removes user from list passed in.
//@param userList {object} Object with key value pairs of users
//@param username {string} name of user to be removed
//@return userList {Object} Object with key value pairs of users
function removeUser(userList, username) {
  let newList = Object.assign({}, userList);
  delete newList[username];
  return newList;
}

//Checks if the user is in the list passed in.
//@param userList {object} Object with key value pairs of users
//@param username {string}
//@return userList {Object} Object with key value pairs of users
function isUser(userList, username) {
  return username in userList;
}
