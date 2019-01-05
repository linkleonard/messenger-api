var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');
var cors = require('cors');


var schema = buildSchema(`
  type Query {
    me: User
    user(id: ID): User
    users: [User]
    conversations: [Conversation]
    messages: [Message]
  }

  type User {
    id: ID
    name: String
    conversations: [Conversation]
    messages: [Message]
  }

  type Conversation {
    id: ID
    participants: [User]
    messages: [Message]
  }

  type Message {
    id: ID
    body: String!
    conversation: Conversation!
    sender: User!
  }
`);

class User {
  constructor (data) { Object.assign(this, data) }
  get messages () {
    return [
      ...message_store.values()
    ].filter(message => message.senderId === this.id)
  }
}

class Message {
  constructor (data) { Object.assign(this, data) }
  get sender () {
    return user_store.get(this.senderId)
  }
}

const user_store = new Map();

user_store.set("U0", new User({
  id: "U0",
  name: "John",
}))
user_store.set("U1", new User({
  id: "U1",
  name: "Bob",
}))

const message_store = new Map();

message_store.set("M0", new Message({
  id: "M0",
  body: "Hello world!",
  senderId: "U0",
}))

message_store.set("M1", new Message({
  id: "M1",
  body: "Toot",
  senderId: "U0",
}))

message_store.set("M2", new Message({
  id: "M2",
  body: "Fee Fi Fo Dee Di Do",
  senderId: "U0",
}))

message_store.set("M3", new Message({
  id: "M3",
  body: "Toot",
  senderId: "U1",
}))

message_store.set("M4", new Message({
  id: "M4",
  body: "Fee Fi Fo Dee Di Do",
  senderId: "U1",
}))

message_store.set("M5", new Message({
  id: "M5",
  body: "Toot",
  senderId: "U1",
}))

message_store.set("M6", new Message({
  id: "M6",
  body: "Toot",
  senderId: "U0",
}))

var root = {
  me: () => user_store.get("U0"),
  user: ({id}) => user_store.get(id),
  users: () => user_store.values(),
  messages: () => message_store.values(),
};

var app = express();
app.use(cors());

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));
