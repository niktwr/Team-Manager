import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import './App.css';

function App() {
  const [teams, setTeams] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet1']);
      
      const { devs, bas, das } = parseData(sheet);
      const generatedTeams = generateTeams(devs, bas, das);
      setTeams(generatedTeams);
    };

    reader.readAsArrayBuffer(file);
  };

  const parseData = (sheet) => {
    const devs = sheet.map(row => ({ Name: row['Developers'], Role: 'Developer' })).filter(dev => dev.Name);
    const bas = sheet.map(row => ({ Name: row['Business Analysts'], Role: 'Business Analyst' })).filter(ba => ba.Name);
    const das = sheet.map(row => ({ Name: row['Data Analysts'], Role: 'Data Analyst' })).filter(da => da.Name);
    return { devs, bas, das };
  };

  const generateTeams = (devs, bas, das) => {
    let teams = [];
    const numTeams = Math.min(Math.floor(devs.length / 3), bas.length, das.length);

    for (let i = 0; i < numTeams; i++) {
      let team = {
        devs: devs.slice(i * 3, i * 3 + 3),
        ba: bas[i],
        da: das[i]
      };
      teams.push(team);
    }

    return teams;
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    let yOffset = 10; // Starting Y position

    teams.forEach((team, index) => {
      doc.text(`Team ${index + 1}`, 10, yOffset);
      yOffset += 10; // Add space for the team name

      doc.text('Developers:', 10, yOffset);
      yOffset += 10; // Add space for the "Developers" label

      team.devs.forEach((dev, i) => {
        doc.text(`${i + 1}. ${dev.Name} (${dev.Role})`, 10, yOffset);
        yOffset += 10; // Add space for each developer
      });

      doc.text(`Business Analyst: ${team.ba.Name} (${team.ba.Role})`, 10, yOffset);
      yOffset += 10; // Add space for the Business Analyst

      doc.text(`Data Analyst: ${team.da.Name} (${team.da.Role})`, 10, yOffset);
      yOffset += 20; // Add space for the Data Analyst and extra space before the next team

      // Add a page break if needed (if yOffset is near the bottom of the page)
      if (yOffset > 270) { 
        doc.addPage();
        yOffset = 10; // Reset Y position for the new page
      }
    });

    doc.save('teams.pdf');
  };

  return (
    <div className="App">
      <h2>Upload an Excel file to generate teams</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      {teams.length > 0 && (
        <button onClick={handleGeneratePDF}>Generate PDF</button>
      )}
      {teams.map((team, index) => (
        <div key={index} className="team">
          <h3>Team {index + 1}</h3>
          <div className="team-member">
            <h4>Developers</h4>
            <ul>
              {team.devs.map((dev, i) => (
                <li key={i}>{dev.Name} ({dev.Role})</li>
              ))}
            </ul>
          </div>
          <div className="team-member">
            <h4>Business Analyst</h4>
            <p>{team.ba.Name} ({team.ba.Role})</p>
          </div>
          <div className="team-member">
            <h4>Data Analyst</h4>
            <p>{team.da.Name} ({team.da.Role})</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
