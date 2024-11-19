let csvFullData = [];
let excelFullData = [];
let textFullData = "";

function handleCsvFiles(event) {
  const files = event.target.files;

  if (files.length === 0) {
    console.error("No files selected.");
    return;
  }

  Array.from(files).forEach((file, index) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      const fileContent = event.target.result;

      // Split the file content by lines
      const lines = fileContent.split("\n");

      // Process each line
      lines.forEach((line, ind) => {
        const fields = line
          .split(",")
          .map((field) => field.replace(/^"|"$/g, "").trim());

        const obj = {};
        for (let i = 0; i < fields.length; i++) {
          obj[i] = fields[i].trim();
        }
        csvFullData.push(obj);
      });
    };
    console.log(csvFullData);

    reader.onerror = function (event) {
      console.error("Error reading the file:", event.target.error);
    };

    reader.readAsText(file);
  });
}

function getTextFiles(event) {
  const files = event.target.files; // Get all selected files
  if (!files || files.length === 0) {
    console.error("No files selected.");
    return;
  }

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function (event) {
        resolve(event.target.result); // Resolve with the file content
      };

      reader.onerror = function () {
        reject(reader.error); // Reject with the error
      };

      reader.readAsText(file); // Read the file as text
    });
  };

  const processFiles = async () => {
    for (const file of files) {
      try {
        const fileContent = await readFile(file); // Read each file
        textFullData += fileContent + "\n"; // Append the content and add a newline
      } catch (err) {
        console.error(`Error reading file ${file.name}:`, err);
      }
    }

    console.log("Merged Text Data:", textFullData);
  };

  processFiles();
}

function handleExcelFiles(event) {
  const files = event.target.files; // Get all selected files

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function (e) {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          // Assuming the first sheet is the one to read
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];

          // Convert the sheet to JSON
          const fileData = XLSX.utils.sheet_to_json(sheet, { header: 0 });
          resolve(fileData);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  };

  const processFiles = async () => {
    for (const file of files) {
      try {
        const fileData = await readFile(file);
        excelFullData.push(...fileData); // Append data from each file
      } catch (err) {
        console.error(`Error processing file ${file.name}:`, err);
      }
    }

    console.log("Merged Data:", excelFullData);
  };

  processFiles();
}

function downloadCsvFullData() {
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(csvFullData);

  // Create a workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Convert workbook to binary string
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });

  // Create a Blob from workbook binary string
  const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });

  // Function to convert s to array buffer
  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  }

  // Create a temporary anchor element
  const anchor = document.createElement("a");
  document.body.appendChild(anchor);

  // Create a URL for the Blob
  const url = window.URL.createObjectURL(blob);

  // Set anchor attributes to trigger download
  anchor.href = url;
  anchor.download = "csvFullData.xlsx";

  // Trigger download
  anchor.click();

  // Clean up
  window.URL.revokeObjectURL(url);
}

function downloadExcelFullData() {
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelFullData);

  // Create a workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Convert workbook to binary string
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });

  // Create a Blob from workbook binary string
  const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });

  // Function to convert s to array buffer
  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  }

  // Create a temporary anchor element
  const anchor = document.createElement("a");
  document.body.appendChild(anchor);

  // Create a URL for the Blob
  const url = window.URL.createObjectURL(blob);

  // Set anchor attributes to trigger download
  anchor.href = url;
  anchor.download = "excelFullData.xlsx";

  // Trigger download
  anchor.click();

  // Clean up
  window.URL.revokeObjectURL(url);
}

function downloadTextFullData() {
  const blob = new Blob([textFullData], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "textFullData.txt";
  link.click();
}
