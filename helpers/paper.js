const flattenToIdAndTitle = (papers) => {
    const flattened = [];
  
    papers.forEach((paper) => {
      flattened.push({ 
            id: paper.paper_id, 
            title: paper.papername,
        });
    });
  
    return flattened;
};
  
module.exports = {
    flattenToIdAndTitle,
};