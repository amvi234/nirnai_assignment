import React, { useState } from 'react';
import axios from 'axios';

interface Transaction {
  buyer: string;
  seller: string;
  houseNo: string;
  surveyNo: string;
  documentNo: string;
  date: string;
  value: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: Transaction[];
  debug?: {
    parsedCount: number;
    translatedCount: number;
    filteredCount: number;
    queryParams: Record<string, string>;
  };
}

const Home = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    buyer: '',
    seller: '',
    houseNo: '',
    surveyNo: '',
    documentNo: ''
  });

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setPdfPreviewUrl(URL.createObjectURL(file));
      
      // Reset previous data
      setTransactions([]);
      setApiResponse(null);
      
      await uploadAndProcessPDF(file);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const uploadAndProcessPDF = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    // Build query parameters from filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim()) {
        queryParams.append(key, value.trim());
      }
    });

    const url = `http://localhost:3000/api/upload${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    try {
      setLoading(true);
      const response = await axios.post<ApiResponse>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('API Response:', response.data);
      setApiResponse(response.data);
      setTransactions(response.data.data || []);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      if (axios.isAxiosError(error)) {
        alert(`Failed to process PDF: ${error.response?.data?.message || error.message}`);
      } else {
        alert('Failed to process PDF');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    if (pdfFile) {
      uploadAndProcessPDF(pdfFile);
    }
  };

  const clearFilters = () => {
    setFilters({
      buyer: '',
      seller: '',
      houseNo: '',
      surveyNo: '',
      documentNo: ''
    });
    // Reload data without filters
    if (pdfFile) {
      const formData = new FormData();
      formData.append('file', pdfFile);
      
      setLoading(true);
      axios.post<ApiResponse>('http://localhost:3000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(response => {
        setApiResponse(response.data);
        setTransactions(response.data.data || []);
      }).catch(error => {
        console.error('Error reloading data:', error);
      }).finally(() => {
        setLoading(false);
      });
    }
  };

  const formatFieldName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      buyer: 'Buyer',
      seller: 'Seller',
      houseNo: 'House No',
      surveyNo: 'Survey No',
      documentNo: 'Document No',
      date: 'Date',
      value: 'Value'
    };
    return fieldNames[field] || field;
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>PDF Transaction Extractor</h1>

      {/* File Upload */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Upload PDF: </label>
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={handlePDFUpload}
          style={{ marginRight: '10px' }}
        />
        {loading && <span style={{ color: '#007bff' }}>Processing PDF...</span>}
      </div>

      {/* Filters Section */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f8f9fa' }}>
        <h3 style={{ marginTop: '0' }}>Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px' }}>
          {Object.entries(filters).map(([field, value]) => (
            <div key={field}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                {formatFieldName(field)}:
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => handleFilterChange(field as keyof typeof filters, e.target.value)}
                placeholder={`Filter by ${formatFieldName(field).toLowerCase()}`}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ccc', 
                  borderRadius: '3px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          ))}
        </div>
        <div>
          <button 
            onClick={applyFilters}
            disabled={!pdfFile || loading}
            style={{ 
              padding: '10px 20px', 
              marginRight: '10px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '3px',
              cursor: pdfFile && !loading ? 'pointer' : 'not-allowed',
              opacity: pdfFile && !loading ? 1 : 0.6
            }}
          >
            Apply Filters
          </button>
          <button 
            onClick={clearFilters}
            disabled={!pdfFile || loading}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '3px',
              cursor: pdfFile && !loading ? 'pointer' : 'not-allowed',
              opacity: pdfFile && !loading ? 1 : 0.6
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Debug Information */}
      {apiResponse?.debug && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e7f3ff', border: '1px solid #b3d7ff', borderRadius: '5px' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Processing Summary</h4>
          <p style={{ margin: '5px 0' }}>Status: <strong>{apiResponse.status}</strong></p>
          <p style={{ margin: '5px 0' }}>Message: {apiResponse.message}</p>
          <p style={{ margin: '5px 0' }}>Parsed: {apiResponse.debug.parsedCount} transactions</p>
          <p style={{ margin: '5px 0' }}>Translated: {apiResponse.debug.translatedCount} transactions</p>
          <p style={{ margin: '5px 0' }}>After Filtering: {apiResponse.debug.filteredCount} transactions</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Results Table */}
        <div style={{ flex: 2 }}>
          <h2>Extracted Transactions ({transactions.length})</h2>
          {transactions.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '5px' }}>
              {loading ? (
                <p>Processing PDF...</p>
              ) : pdfFile ? (
                <p>No transactions found matching the current filters.</p>
              ) : (
                <p>Upload a PDF file to extract transactions.</p>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                border: '1px solid #dee2e6',
                backgroundColor: 'white'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    {Object.keys(transactions[0]).map((key) => (
                      <th key={key} style={{ 
                        padding: '12px', 
                        textAlign: 'left', 
                        border: '1px solid #dee2e6',
                        fontWeight: 'bold'
                      }}>
                        {formatFieldName(key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, index) => (
                    <tr key={index} style={{ 
                      backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'
                    }}>
                      {Object.values(tx).map((val, i) => (
                        <td key={i} style={{ 
                          padding: '12px', 
                          border: '1px solid #dee2e6',
                          maxWidth: '200px',
                          wordWrap: 'break-word'
                        }}>
                          {String(val) || <em style={{ color: '#6c757d' }}>Empty</em>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PDF Preview Panel */}
        <div style={{ flex: 1 }}>
          <h2>PDF Preview</h2>
          {pdfPreviewUrl ? (
            <iframe
              src={pdfPreviewUrl}
              width="100%"
              height="600px"
              title="PDF Preview"
              style={{ border: '1px solid #dee2e6', borderRadius: '5px' }}
            />
          ) : (
            <div style={{ 
              height: '600px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              backgroundColor: '#f8f9fa', 
              border: '1px solid #dee2e6', 
              borderRadius: '5px',
              color: '#6c757d'
            }}>
              <p>No PDF uploaded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;