const users = [];

const addUser = ({ id, name, team }) => {
  name = name.trim().toLowerCase();
  team = team.trim().toLowerCase();

  const existingUser = users.find((user) => user.name === name);

  if(!name) return { error: 'Username is required.' };
  if(existingUser) return { error: 'Username is taken.' };

  const user = { id, name, team };

  users.push(user);

  return { user };
}

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if(index !== -1) return users.splice(index, 1)[0];
}

const getUser = (id) => users.find((user) => user.id === id);
console.log(users)
// const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, removeUser, getUser, users };
