const XLSX = require('xlsx');
const path = require('path');

// Function to analyze Excel file structure
function analyzeExcelFile(filePath) {
  console.log(`\n📊 Analyzing: ${path.basename(filePath)}`);
  console.log('='.repeat(50));
  
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    
    console.log(`📋 Sheet Names: ${workbook.SheetNames.join(', ')}`);
    
    // Analyze each sheet
    workbook.SheetNames.forEach((sheetName, index) => {
      console.log(`\n📄 Sheet ${index + 1}: "${sheetName}"`);
      console.log('-'.repeat(30));
      
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      console.log(`📏 Total rows: ${data.length}`);
      
      if (data.length > 0) {
        // Show first few rows
        console.log('\n🔍 First 5 rows:');
        data.slice(0, 5).forEach((row, rowIndex) => {
          console.log(`Row ${rowIndex + 1}:`, row.map(cell => 
            typeof cell === 'string' ? `"${cell}"` : cell
          ).join(' | '));
        });
        
        // Show structure analysis
        console.log('\n📊 Structure Analysis:');
        console.log(`- Row 1 (Group Name): "${data[0] ? data[0][0] : 'N/A'}"`);
        
        if (data.length > 1) {
          console.log('- Student rows (from row 2):');
          data.slice(1, Math.min(6, data.length)).forEach((row, index) => {
            if (row[0] || row[1]) {
              console.log(`  Student ${index + 1}: Name="${row[0] || 'N/A'}" | Phone="${row[1] || 'N/A'}"`);
            }
          });
        }
        
        // Count non-empty student rows
        const studentRows = data.slice(1).filter(row => row[0] && row[0].trim());
        console.log(`👥 Total students in this sheet: ${studentRows.length}`);
      }
    });
    
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
  }
}

// Analyze both Excel files
const excelFiles = [
  './تمهيدي.xlsx',  // Preparatory
  './روضة.xlsx'     // Kindergarten
];

console.log('🌸 Zinat Al-Haya Excel Files Analysis');
console.log('=====================================');

excelFiles.forEach(file => {
  if (require('fs').existsSync(file)) {
    analyzeExcelFile(file);
  } else {
    console.log(`❌ File not found: ${file}`);
  }
});

console.log('\n✅ Analysis Complete!');
