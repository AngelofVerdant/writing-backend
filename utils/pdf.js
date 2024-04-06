const PDFDocument = require('pdfkit');
const fs = require('fs');
const striptags = require('striptags');

const createOrderPdf = (order) => {
  const doc = new PDFDocument();
  addOrderDetails(doc, order);
  return doc;
};

const addOrderDetails = (doc, order) => {
  doc.fontSize(20).text('ORDER DETAILS', { align: 'center', underline: true });
  doc.moveDown();

  doc.fontSize(16).text('Title', { align: 'left'});
  doc.moveDown(0.2);
  doc.fontSize(10).text(`${order.orderTitle}`);
  doc.moveDown();

  const cleanDescription = striptags(order.orderDescription);
  doc.fontSize(16).text('Description', { align: 'left'});
  doc.moveDown(0.2);
  doc.fontSize(10).text(`${cleanDescription}`);
  doc.moveDown();

  doc.fontSize(16).text('Education Level', { align: 'left'});
  doc.moveDown(0.2);
  doc.fontSize(10).text(`${order.orderLevel}`);
  doc.moveDown();

  doc.fontSize(16).text('Paper Category', { align: 'left'});
  doc.moveDown(0.2);
  doc.fontSize(10).text(`${order.orderPaper}`);
  doc.moveDown();

  doc.fontSize(16).text('Paper Type', { align: 'left'});
  doc.moveDown(0.2);
  doc.fontSize(10).text(`${order.orderPaperType}`);
  doc.moveDown();

  doc.fontSize(16).text('Spacing', { align: 'left'});
  doc.moveDown(0.2);
  doc.fontSize(10).text(`${order.orderSpace}`);
  doc.moveDown();

  doc.fontSize(16).text('Deadline', { align: 'left'});
  doc.moveDown(0.2);
  doc.fontSize(10).text(`${order.orderDeadline}`);
  doc.moveDown();

  doc.fontSize(16).text('Language', { align: 'left'});
  doc.moveDown(0.2);
  doc.fontSize(10).text(`${order.orderLanguage}`);
  doc.moveDown();

  doc.fontSize(16).text('Format', { align: 'left'});
  doc.moveDown(0.2);
  doc.fontSize(10).text(`${order.orderFormat}`);
  doc.moveDown();

  doc.fontSize(16).text('Number of Pages', { align: 'left'});
  doc.moveDown(0.2);
  doc.fontSize(10).text(`${order.orderPages}`);
  doc.moveDown();

  doc.fontSize(16).text('Number of Sources', { align: 'left'});
  doc.moveDown(0.2);
  doc.fontSize(10).text(`${order.orderSources}`);
  doc.moveDown();
};

const savePdfToFile = (doc, fileName) => {
  const writeStream = fs.createWriteStream(fileName);
  doc.pipe(writeStream);
  doc.end();
  return fileName;
};

const generateOrderPdf = async (order) => {
  const pdfFileName = `order_${order.orderId}_details.pdf`;
  const doc = createOrderPdf(order);
  return savePdfToFile(doc, pdfFileName);
};

module.exports = {
    generateOrderPdf,
};