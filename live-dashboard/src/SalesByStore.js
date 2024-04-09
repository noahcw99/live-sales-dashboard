import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import './SalesByStore.css';

const SalesByStore = ({ data, selectedCategory, selectedSubCategory, selectedSubSubCategory, selectedStore, selectedVendor }) => {
  const [salesData, setSalesData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    // Check if salesData is not undefined before updating state
    if (Array.isArray(data)) {
      setSalesData(data);
    }
  }, [data]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const dataForSorting = salesData.filter((sale) => sale.StoreID !== 'Total/Avg');

  const sortedDataForSorting = [...dataForSorting].sort((a, b) => {
    if (sortConfig.key) {
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];

      if (typeof valueA === 'string') {
        return sortConfig.direction === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      } else {
        return sortConfig.direction === 'asc' ? valueA - valueB : valueB - valueA;
      }
    }
    return 0;
  });

  const totalsRow = salesData.find((sale) => sale.StoreID === 'Total/Avg') || {}; // Initialize with an empty object if not found

  return (
    <div className="table-hover-effect" style={{ padding: '15px', height: '39vh', overflowY: 'auto', backgroundColor: '#F0F0F0'}}>
      <div>
        <p style={{ fontSize: '1.2rem', marginRight: '1%', marginBottom: '.6rem'}}>Summary By Store</p>
      </div>
      <div >
        <Table striped bordered hover>
          <thead>
            <tr>
              <th className="headerCell" onClick={() => handleSort('StoreID')} style={{ userSelect: 'none' }}>
                Store
              </th>
              <th className="headerCell" onClick={() => handleSort('QtySold')} style={{ userSelect: 'none' }}>
                Units Sold
              </th>
              <th className="headerCell" onClick={() => handleSort('Cost')} style={{ userSelect: 'none' }}>
                COG
              </th>
              <th className="headerCell" onClick={() => handleSort('Amount')} style={{ userSelect: 'none' }}>
                Revenue
              </th>
              <th className="headerCell" onClick={() => handleSort('Profit')} style={{ userSelect: 'none' }}>
                Profit
              </th>
              <th className="headerCell" onClick={() => handleSort('ProfitPCT')} style={{ userSelect: 'none' }}>
                Profit Margin
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(sortedDataForSorting) && sortedDataForSorting.length > 0 ? (
              sortedDataForSorting.map((sale, index) => (
                <tr key={index}>
                  <td>{sale.StoreID}</td>
                  <td>{sale.QtySold.toLocaleString()}</td>
                  <td>${sale.Cost !== undefined ? sale.Cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</td>
                  <td>${sale.Amount !== undefined ? sale.Amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</td>
                  <td>${sale.Profit !== undefined ? sale.Profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</td>
                  <td>{sale.ProfitPCT !== undefined ? `${sale.ProfitPCT}%` : 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No data available</td>
              </tr>
            )}
            {/* Display the totals row, even if it's not included in sorting */}
            {totalsRow && (
              <tr className="totalsRow">
                <td>{totalsRow.StoreID}</td>
                <td>{totalsRow.QtySold?.toLocaleString()}</td>
                <td>${totalsRow.Cost !== undefined ? totalsRow.Cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</td>
                <td>${totalsRow.Amount !== undefined ? totalsRow.Amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</td>
                <td>${totalsRow.Profit !== undefined ? totalsRow.Profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</td>
                <td>{totalsRow.ProfitPCT !== undefined ? `${totalsRow.ProfitPCT}%` : 'N/A'}</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default SalesByStore;
