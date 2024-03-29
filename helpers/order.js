const flattenToIdAndTitle = (orders) => {
    const flattened = [];
  
    orders.forEach((order) => {
      flattened.push({ 
            id: order.order_id, 
            title: order.ordertitle 
        });
    });
  
    return flattened;
};
  
module.exports = {
    flattenToIdAndTitle,
};