import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import './LiveSalesTable.css';

const SalesTable = ({ salesData, selectedCategory, selectedSubCategory, selectedSubSubCategory, selectedStore, selectedVendor }) => {
  // Initialize salesData as an empty array
  const [data, setData] = useState([]);

  useEffect(() => {
    // Check if salesData is not undefined before updating state
    if (Array.isArray(salesData)) {
      setData(salesData);
    }
  }, [salesData]);

  return (
    <div style={{ padding: '15px', height: '100%', minHeight: '47vh', overflowY: 'auto', backgroundColor: '#F0F0F0'}}>
      <div>
        {/* fixed header */}
        <p style={{ fontSize: '1.2rem', marginRight: '1%', marginBottom: '.6rem', lineHeight: '100%' }}>Real-Time Sales</p>
      </div>
      <div style={{ maxHeight: '43vh', overflowY: 'auto'}}>
        {/* scrollable body */}
        <Table striped bordered hover>
          <thead>
            <tr>
              <th className="headerCell" style={{ userSelect: 'none' }}>Store</th>
              <th className="headerCell" style={{ userSelect: 'none' }}>Receipt</th>
              <th className="headerCell" style={{ userSelect: 'none' }}>Customer</th>
              <th className="headerCell" style={{ userSelect: 'none' }}>Transaction Date</th>
              <th className="headerCell" style={{ userSelect: 'none' }}>Sales</th>
            </tr>
          </thead>
          <tbody>
            {/* Use data from state to map over */}
            {data.map((sale) => (
              <tr key={sale.receiptno}>
                <td  style={{ fontSize: '1rem' }}>{sale.storeid}</td>
                <td  style={{ fontSize: '1rem' }}>{sale.receiptno}</td>
                <td  style={{ fontSize: '1rem' }}>{sale.customerid}</td>
                <td  style={{ fontSize: '1rem' }}>{new Date(sale.lastupdate).toLocaleString()}</td>
                <td  style={{ fontSize: '1rem' }}>${sale.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default SalesTable;
