const flattenToIdAndTitle = (levels) => {
    const flattened = [];
  
    levels.forEach((level) => {
      flattened.push({ 
            id: level.level_id, 
            title: level.levelname,
        });
    });
  
    return flattened;
};
  
module.exports = {
    flattenToIdAndTitle,
};