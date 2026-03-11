import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function ExcelUpload() {
  const [data, setData] = useState([]);

  const handleFile = (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();

    reader.onload = (evt) => {
      const binary = evt.target.result;

      const workbook = XLSX.read(binary, { type: "binary" });

      const sheetName = workbook.SheetNames[0];

      const sheet = workbook.Sheets[sheetName];

      const json = XLSX.utils.sheet_to_json(sheet);

      setData(json);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div>
      <h2>Upload Excel Orders</h2>

      <input type="file" accept=".xlsx,.xls" onChange={handleFile} />

      <table border="1" style={{ marginTop: "20px", width: "100%" }}>
        <thead>
          <tr>
            {data.length > 0 &&
              Object.keys(data[0]).map((key) => <th key={key}>{key}</th>)}
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {Object.values(row).map((val, j) => (
                <td key={j}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
