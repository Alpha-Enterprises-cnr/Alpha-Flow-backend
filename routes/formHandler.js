const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

// ✅ Path to Excel file
const excelFilePath = path.join(__dirname, '../data/clientForm.xlsx');
const sheetName = 'FormData';

// ✅ Ensure the Excel file and sheet exist with headers
function ensureExcelFileExists() {
  if (!fs.existsSync(excelFilePath)) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([[
      'TYPE C/M/EV',
      'REQUEST NUM',
      'REQUESTED BY',
      'WORK NUMBER',
      'WORK Sl.NO',
      'NATURE OF WORK',
      'SITE NAME',
      'SL.NO',
      'PARTICULARS',
      'SIZE',
      'QUANTITY',
      'UNIT'
    ]]);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, excelFilePath);
  }
}

// ✅ Handle form submission
router.post('/submit-form', (req, res) => {
  const {
    type,           // TYPE C/M/EV
    requestNum,     // REQUEST NUM
    requestedBy,    // REQUESTED BY
    workNum,        // WORK NUMBER
    workSlNo,       // WORK Sl.NO
    natureOfWork,   // NATURE OF WORK
    siteName,       // SITE NAME
    slNo,           // SL.NO
    particulars,    // PARTICULARS
    size,           // SIZE
    quantity,       // QUANTITY
    unit            // UNIT
  } = req.body;

  // ✅ Check if any required field is missing
  if (!type || !requestNum || !requestedBy || !workNum || !workSlNo || !natureOfWork || !siteName || !slNo || !particulars || !size || !quantity || !unit) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    ensureExcelFileExists();

    const wb = XLSX.readFile(excelFilePath);
    const ws = wb.Sheets[sheetName];

    // Read existing data and append new row
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    data.push([
      type,
      requestNum,
      requestedBy,
      workNum,
      workSlNo,
      natureOfWork,
      siteName,
      slNo,
      particulars,
      size,
      quantity,
      unit
    ]);

    const newWs = XLSX.utils.aoa_to_sheet(data);
    wb.Sheets[sheetName] = newWs;

    XLSX.writeFile(wb, excelFilePath);

    res.json({ success: true, message: '✅ Data written to Excel successfully' });
  } catch (err) {
    console.error('❌ Error writing to Excel:', err);
    res.status(500).json({ error: 'Failed to write to Excel file' });
  }
});

module.exports = router;
