import React, { useState, useEffect } from 'react';
import './totals.css';

const TotalRevenueComponent = ({ totalsData }) => {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true); // Set loading state when data is being fetched
    if (Array.isArray(totalsData) && totalsData.length > 0) {
      setData(totalsData[0]); // Assuming totalsData is an array of objects
      setIsLoading(false); // Set loading state to false when data is fetched
    }
  }, [totalsData]);

  const totalRevenue = isLoading ? '' : formatRevenue(data['Total Revenue'][0]);
  const percentageDifferenceRevenue = isLoading ? '' : data['Revenue Difference Percentage'];

  const totalProfit = isLoading ? '' : formatRevenue(data['Total Profit'][0]);
  const percentageDifferenceProfit = isLoading ? '' : data['Profit Difference Percentage'];

  const avgProfitMargin = isLoading ? '' : data['Avg Profit Margin'][0].toFixed(1);
  const percentageDifferenceMargin = isLoading ? '' : data['Avg Profit Margin Difference Percentage'];

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div className="container" style={{ marginRight: '3px' }}>
        <h5 className="heading heading-total-revenue">Total Revenue</h5>
        <div className="content">
          <p className="totalValue">{totalRevenue}</p>
          <p className={`percentageDifference ${percentageDifferenceRevenue >= 0 ? 'positivePercentage' : 'negativePercentage'}`}>
            {percentageDifferenceRevenue >= 0 ? `(+${Math.round(percentageDifferenceRevenue)}%)` : `(${Math.round(percentageDifferenceRevenue)}%)`}
          </p>
        </div>
      </div>

      <div className="container" style={{ marginRight: '3px', marginLeft: '3px' }}>
        <h5 className="heading">Total Profit</h5>
        <div className="content">
          <p className="totalValue">{totalProfit}</p>
          <p className={`percentageDifference ${percentageDifferenceProfit >= 0 ? 'positivePercentage' : 'negativePercentage'}`}>
            {percentageDifferenceProfit >= 0 ? `(+${Math.round(percentageDifferenceProfit)}%)` : `(${Math.round(percentageDifferenceProfit)}%)`}
          </p>
        </div>
      </div>

      <div className="container" style={{ marginLeft: '3px' }}>
        <h5 className="heading">Avg Profit Margin</h5>
        <div className="content">
          <p className="totalValue">{avgProfitMargin}</p>
          <p className={`percentageDifference ${percentageDifferenceMargin >= 0 ? 'positivePercentage' : 'negativePercentage'}`}>
            {percentageDifferenceMargin >= 0 ? `(+${Math.round(percentageDifferenceMargin)}%)` : `(${Math.round(percentageDifferenceMargin)}%)`}
          </p>
        </div>
      </div>
    </div>
  );
};

const formatRevenue = (revenue) => {
  if (revenue < 1000) {
    return `$${revenue.toFixed(0)}`;
  } else if (revenue < 1000000) {
    const truncatedValue = Math.floor(revenue / 1000);
    const decimalPart = Math.floor((revenue % 1000) / 100);
    return `$${truncatedValue}.${decimalPart}k`;
  } else if (revenue < 1000000000) {
    return `$${(revenue / 1000000).toFixed(revenue % 1000000 !== 0 ? 1 : 0)}M`;
  } else {
    return `$${(revenue / 1000000000).toFixed(revenue % 1000000000 !== 0 ? 1 : 0)}B`;
  }
};

export default TotalRevenueComponent;
