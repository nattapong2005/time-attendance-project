import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AttendancePage() {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    axios.get(`http://localhost/qr_attendance_app/backend/api/attendance.php?user_id=${user.id}`)
      .then(res => setLogs(res.data));
  }, []);
  return (
    <div>
      <h2>Attendance Logs</h2>
      <table>
        <thead><tr><th>#</th><th>Check-in</th></tr></thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={log.id}>
              <td>{i + 1}</td>
              <td>{log.check_in}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AttendancePage;
