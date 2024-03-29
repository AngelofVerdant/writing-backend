const flattenToIdAndTitle = (papertypes) => {
    const flattened = [];
  
    papertypes.forEach((paper) => {
      flattened.push({ 
            id: paper.paper_type_id, 
            title: paper.papertypename,
        });
    });
  
    return flattened;
};
  
module.exports = {
    flattenToIdAndTitle,
};