const flattenToIdAndTitle = (users) => {
    const flattened = [];
  
    users.forEach((user) => {
      flattened.push({ 
            id: user.user_id, 
            title: `${user.firstname} ${user.lastname}` 
        });
    });
  
    return flattened;
};
  
module.exports = {
    flattenToIdAndTitle,
};