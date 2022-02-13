const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.envPORT || process.env.NODE_PORT || 3000;
const parseBody = (request, response, handler) => {
  // request will come in pieces, so they must be stored in array
  const body = [];

  // few event handlers, one is to check for errors

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    return response.end();
  });

  // second event is data event
  // fires when piece of body is received.
  // always receives in correct order
  request.on('data', (chunk) => {
    body.push(chunk);
  });

  // final event is when request finished the sending of data
  // all data received and then turned into a string from body array

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);

    handler(request, response, bodyParams);
  });
};

// handle POST requests
const handlePost = (request, response, parsedURL) => {
  if (parsedURL.pathname === '/addUser') {
    // parses bodywith jsonHandler function as handler callback function
    parseBody(request, response, jsonHandler.addUser);
  }
};

// handle the GET requests for the users
// const handleGet = (request, response, parsedURL) => {
//   if (parsedURL.pathname === '/style.css') {
//     htmlHandler.getCSS(request, response);
//   } else if (parsedURL.pathname === '/getUsers') {
//     jsonHandler.getUsers(request, response);
//   } else {
//     htmlHandler.getIndex(request, response);
//   }
// };

// object to route requests to proper handlers
// index by request method such as GET and HEAD
const urlStruct = {
  GET: {
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
    '/getUsers': jsonHandler.getUsers,
    '/addUser': jsonHandler.addUser,
    '/updateUser': jsonHandler.updateUser,
    notFound: jsonHandler.notFound,
  },
  HEAD: {
    '/getUsers': jsonHandler.getUsersMeta,
    notFound: jsonHandler.notFoundMeta,
  },
};

const onRequest = (request, response) => {
  const parsedURL = url.parse(request.url);

  //   console.dir(request.method);
  //   console.dir(parsedURL);

  // check if method was POST, otherwise assume GET
  //   if (request.method === 'POST') {
  //     handlePost(request, response, parsedURL);
  //   } else {
  //     handleGet(request, response, parsedURL);
  //   }
  if (urlStruct[request.method] && urlStruct[request.method][parsedURL.pathname]) {
    urlStruct[request.method][parsedURL.pathname](request, response);
  } else if (request.method === 'POST') {
    handlePost(request, response, parsedURL);
  } else {
    urlStruct.GET.notFound(request, response);
  }
  // index into urlStruct by the method which returns another object
  // then index into that object by pathname to get handler
  // call actual function witihn if statement, otherwise return notFound response
};

// start server
http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
