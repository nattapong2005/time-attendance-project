import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function ScanPage() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 });
    scanner.render(onScanSuccess);
    function onScanSuccess(decodedText) {
      alert('Scanned: ' + decodedText);
      const user_id = parseInt(decodedText);
      fetch('http://localhost/qr_attendance_app/backend/api/qr_scan.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) alert('Check-in success');
        else alert('Check-in failed: ' + data.message);
      });
    }
  }, []);
  return <div><h2>Scan QR Code</h2><div id="reader" style={{ width: 300 }}></div></div>;
}

export default ScanPage;
