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
      const devs = XLSX.utils.sheet_to_json(workbook.Sheets['Dev']);
      const bas = XLSX.utils.sheet_to_json(workbook.Sheets['BA']);
      const das = XLSX.utils.sheet_to_json(workbook.Sheets['DA']);
      
      const generatedTeams = generateTeams(devs, bas, das);
      setTeams(generatedTeams);
    };

    reader.readAsArrayBuffer(file);
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
    teams.forEach((team, index) => {
      doc.text(`Team ${index + 1}`, 10, 10 + (index * 70));
      doc.text('Developers:', 10, 20 + (index * 70));
      team.devs.forEach((dev, i) => {
        doc.text(`${i + 1}. ${dev.Name} (${dev.Role})`, 10, 30 + (index * 70) + (i * 10));
      });
      doc.text(`Business Analyst: ${team.ba.Name} (${team.ba.Role})`, 10, 60 + (index * 70));
      doc.text(`Data Analyst: ${team.da.Name} (${team.da.Role})`, 10, 70 + (index * 70));
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
