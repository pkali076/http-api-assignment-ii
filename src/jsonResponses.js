const users = {};

// function which responds with a JSON object
const respondJSON = (request, response, status, object) => {
  // object for the headers with the conte-type being JSON
  const headers = {
    'Content-Type': 'application/json',
  };

  // send response with JSON object
  response.writeHead(status, headers);

  response.write(JSON.stringify(object));
  response.end();
};

// function to respond without JSON body (HEAD requests)
const respondJSONMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  response.writeHead(status, headers);
  response.end();
};

// get user Object with response code of 200
const getUsers = (request, response) => {
  // send JSON object as higher encapsulated object
  /* if empty object is sent, does not necessarily mean there is no
    users object.. just means there is an empty "thing" */
  const responseJSON = {
    users,
  };
    // user object is stringified and written in respondJSON
  return respondJSON(request, response, 200, responseJSON);
};

// add User object from POST body
const addUser = (request, response, body) => {
  const responseJSON = {
    message: 'Name and age are both required',
  };
    // make sure both fields are filled out in textboxes
  if (!body.name || !body.age) {
    responseJSON.id = 'addUserMissingParams';
    return respondJSON(request, response, 400, responseJSON);
  }
  // default status code
  let responseCode = 204;

  // if user doesn't exist yet
  if (!users[body.name]) {
    // create new, empty user and set status code of 201
    responseCode = 201;
    users[body.name] = {};
  }
  // add or update fields for this user name
  users[body.name].name = body.name;
  users[body.name].age = body.age;

  // if response is created, set created message and semd response w/message
  if (responseCode === 201) {
    responseJSON.message = 'User Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSON(request, response, responseCode, responseJSON);
};

// get info about user object
const getUsersMeta = (request, response) => {
  respondJSONMeta(request, response, 200);
};

const updateUser = (request, response) => {
  const newUser = {
    createdAt: Date.now(),
  };

  users[newUser.createdAt] = newUser;
  return respondJSON(request, response, 201, newUser);
  // index into object and store based on timestamp
  // normally would be added through the username, not at time user was created
};

// function for 404 GET request
const notFound = (request, response) => {
  // create error message for response
  const responseJSON = {
    message: 'The page you were looking for was not found.',
    id: 'notFound',
  };
  // return a 404 with an error message
  respondJSON(request, response, 404, responseJSON);
};
// function for 404 HEAD request
const notFoundMeta = (request, response) => {
  // returns 404 without error message
  respondJSONMeta(request, response, JSON);
};

module.exports = {
  getUsers,
  addUser,
  getUsersMeta,
  updateUser,
  notFound,
  notFoundMeta,
};
