var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');
var cors = require('cors');


var schema = buildSchema(`
  type Query {
    me: User
    users: [User]
    messages: [Message]
  }

  type User {
    id: ID
    name: String
    messages: [Message]
  }

  type Message {
    id: ID
    body: String
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

user_store.set(0, new User({
  id: 0,
  name: "John",
}))
user_store.set(1, new User({
  id: 1,
  name: "John",
}))

const message_store = new Map();

message_store.set(0, new Message({
  id: 0,
  body: "Hello world!",
  senderId: 0,
}))

message_store.set(1, new Message({
  id: 1,
  body: "Toot",
  senderId: 1,
}))

var root = {
  me: () => user_store.get(0),
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
