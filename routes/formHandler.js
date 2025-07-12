const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

// ✅ Path to Excel file
const excelFilePath = path.join(__dirname, '../data/clientForm.xlsx');
const sheetName = 'FormData';

// ✅ Ensure the Excel file and sheet exist
function ensureExcelFileExists() {
  if (!fs.existsSync(excelFilePath)) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, excelFilePath);
  }
}

// ✅ POST route to handle new client form structure
router.post('/submit-form', (req, res) => {
  const {
    requestedBy,
    workNum,
    natureOfWork,
    siteName,
    type,
    data
  } = req.body;

  if (!requestedBy || !workNum || !natureOfWork || !siteName || !type || !Array.isArray(data)) {
    return res.status(400).json({ error: 'Missing required fields or invalid format' });
  }

  try {
    ensureExcelFileExists();

    const wb = XLSX.readFile(excelFilePath);
    const ws = wb.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_json(ws, { header: 1 });

    // Header for each submission
    sheetData.push([
      `TYPE: ${type.toUpperCase()}`,
      '',
      `Requested By: ${requestedBy}`,
      `Work Number: ${workNum}`,
      '',
      `Nature of Work: ${natureOfWork}`,
      `Site: ${siteName}`
    ]);

    if (type === 'vehicle') {
      // Column headings
      sheetData.push(['Required Date', 'From Time', 'To Time', 'Required Item']);
      data.forEach((row) => {
        sheetData.push([
          row.requiredDate || '',
          row.fromTime || '',
          row.toTime || '',
          row.requiredItem || ''
        ]);
      });
    } else {
      // Material/Consumable type
      sheetData.push(['Work Sl.No', 'Particulars', 'Size', 'Qty', 'Unit']);
      data.forEach((row) => {
        sheetData.push([
          row.workSlNo || '',
          row.particulars || '',
          row.size || '',
          row.quantity || '',
          row.unit || ''
        ]);
      });
    }

    // Write back to Excel
    const newWs = XLSX.utils.aoa_to_sheet(sheetData);
    wb.Sheets[sheetName] = newWs;
    XLSX.writeFile(wb, excelFilePath);

    res.json({ success: true, message: '✅ Data written to Excel successfully' });
  } catch (err) {
    console.error('❌ Error writing to Excel:', err);
    res.status(500).json({ error: 'Failed to write to Excel file' });
  }
});

module.exports = router;
