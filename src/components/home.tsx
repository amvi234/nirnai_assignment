import React, { useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setPdfPreviewUrl(URL.createObjectURL(file));

      const formData = new FormData();
      formData.append('file', file);

      try {
        setLoading(true);
        const response = await axios.post('http://localhost:3000/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Assuming the backend returns JSON array of transactions
        setTransactions(response.data);
      } catch (error) {
        console.error('Error uploading PDF:', error);
        alert('Failed to process PDF');
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Home Page</h1>

      <form>
        <label>Upload PDF: </label>
        <input type="file" accept="application/pdf" onChange={handlePDFUpload} />
      </form>

      {loading && <p>Processing PDF...</p>}

      <div style={{ display: 'flex', marginTop: '20px' }}>
        {/* Results Table */}
        <div style={{ flex: 1, marginRight: '20px' }}>
          <h2>Extracted Transactions</h2>
          {transactions.length === 0 ? (
            <p>No transactions to show.</p>
          ) : (
            <table cellPadding="10" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    {transactions?.length > 0 ? 
                      Object.keys(transactions[0]).map((key) => (
                        <th key={key}>{key}</th>
                      )) : 
                      <th>No data available</th>
                    }
                  </tr>
                 </thead>
              <tbody>
                          {transactions && Array.isArray(transactions) && transactions.map((tx: any, index: number) => (
              <tr key={index}>
                {Object.values(tx).map((val, i) => (
                  <td key={i}>{String(val)}</td>
                ))}
              </tr>
            ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PDF Preview Panel */}
        <div style={{ flex: 1 }}>
          <h2>PDF Preview</h2>
          {pdfPreviewUrl ? (
            <iframe
              src={pdfPreviewUrl}
              width="100%"
              height="400px"
              title="PDF Preview"
            />
          ) : (
            <p>No PDF uploaded.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
