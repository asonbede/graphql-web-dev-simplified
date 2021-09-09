const express = require("express");

const app = express();
const expressGraphQl = require("express-graphql").graphqlHTTP;
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");
const authors = [
  { id: 1, name: "J.K. Rawing" },
  { id: 2, name: "J.R.R. Tolken" },
  { id: 3, name: "Brent Weeks" },
];
const books = [
  { id: 1, name: "Harry Potter and the Chamber of secretes", authorId: 1 },
  { id: 2, name: "Harry Potter and the Chamber of secretes", authorId: 1 },
  { id: 3, name: "Harry Potter and the Chamber of secretes", authorId: 1 },
  { id: 4, name: "The followership of the ring", authorId: 2 },
  { id: 5, name: "The two towers", authorId: 2 },
  { id: 6, name: "The return of the king", authorId: 2 },
  { id: 7, name: "The way of shadows", authorId: 3 },
  { id: 8, name: "Beyond the shadows", authorId: 3 },
];

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "This represents author of a book",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: (author) => {
        return books.filter((book) => book.authorId === author.id);
      },
    },
  }),
});

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This represents a book written by an author",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLString) },
    author: {
      type: AuthorType,
      resolve: (book) => {
        return authors.find((author) => author.id === book.authorId);
      },
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    book: {
      type: BookType,
      description: "a single book",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => books.find((book) => book.id === args.id),
    },

    books: {
      type: new GraphQLList(BookType),
      description: "list of books",
      resolve: () => books,
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: "list of all Authors",
      resolve: () => authors,
    },
    author: {
      type: AuthorType,
      description: "A single Author",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        authors.find((author) => author.id === args.id),
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "mutation",
  description: "Root Mutation",
  fields: () => ({
    addBook: {
      type: BookType,
      description: "Add a book",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const book = {
          id: books.length + 1,
          name: args.name,
          authorId: args.authorId,
        };
        books.push(book);
        return book;
      },
    },
    addAuthor: {
      type: AuthorType,
      description: "Add an author",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const author = { id: authors.length + 1, name: args.name };
        authors.push(author);
        return author;
      },
    },
  }),
});
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});
app.use("/graphql", expressGraphQl({ schema: schema, graphiql: true }));
app.listen(5000, () => console.log("server running at 5000"));
