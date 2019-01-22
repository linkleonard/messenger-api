var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');
var cors = require('cors');


var schema = buildSchema(`
  type Query {
    me: User
    user(id: ID): User
    users: [User]
    conversation(id: ID): Conversation
    conversations: [Conversation]
    messages(conversationId: ID): [Message]
  }

  type Mutation {
    createMessage(conversationId: ID!, body: String!): Message
  }

  type User {
    id: ID
    name: String
    conversations: [Conversation]
    messages: [Message]
  }

  type Conversation {
    id: ID
    name: String
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

  get conversation () {
    return conversation_store.get(this.conversationId);
  }
}


class Conversation {
  constructor (data) {
    Object.assign(this, data);
  }
  get participants() {
    const messageSenders = this.messages.map(message => message.senderId);
    const uniqueSenders = new Set(messageSenders);
    return [...uniqueSenders].map(senderId => user_store.get(senderId));
  }
  get messages() {
    return [
      ...message_store.values()
    ].filter(message => message.conversationId === this.id);
  }
}


const conversation_store = new Map();

conversation_store.set("C0", new Conversation({
  id: "C0",
  name: null,
}))

conversation_store.set("C1", new Conversation({
  id: "C1",
  name: "Other conversation",
}))

conversation_store.set("C2", new Conversation({
  id: "C2",
  name: "Some fancy conversation",
}))



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
  conversationId: "C0",
}))

message_store.set("M1", new Message({
  id: "M1",
  body: "Toot",
  senderId: "U0",
  conversationId: "C0",
}))

message_store.set("M2", new Message({
  id: "M2",
  body: "Fee Fi Fo Dee Di Do",
  senderId: "U0",
  conversationId: "C0",
}))

message_store.set("M3", new Message({
  id: "M3",
  body: "Toot",
  senderId: "U1",
  conversationId: "C0",
}))

message_store.set("M4", new Message({
  id: "M4",
  body: "Fee Fi Fo Dee Di Do",
  senderId: "U1",
  conversationId: "C0",
}))

message_store.set("M5", new Message({
  id: "M5",
  body: "Toot",
  senderId: "U1",
  conversationId: "C0",
}))

message_store.set("M6", new Message({
  id: "M6",
  body: "Toot",
  senderId: "U0",
  conversationId: "C0",
}))

var root = {
  me: () => user_store.get("U0"),
  user: ({id}) => user_store.get(id),
  users: () => user_store.values(),
  messages: () => message_store.values(),
  conversation: ({id}) => conversation_store.get(id),
  conversations: () => conversation_store.values(),
  createMessage: ({ conversationId, body }) => {
    const id = `M${[...message_store.values()].length}`;
    const message = new Message({
      id,
      conversationId,
      body,
      senderId: "U0",
    });
    message_store.set(id, message);
    return message;
  }
};

var app = express();
app.use(cors());

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));
