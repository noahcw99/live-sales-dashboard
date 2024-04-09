import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const formatAxisLabel = (value) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  } else {
    return `$${value}`;
  }
};

const QuarterlyEarningsGraph = ({ quarterlyData, selectedCategory, selectedSubCategory, selectedSubSubCategory, selectedStore, selectedVendor }) => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    setChartData(quarterlyData);
  }, [quarterlyData]);

  return (
    <div style={{ padding: '15px', backgroundColor: '#F0F0F0'}}>
      <p style={{ fontSize: '1.2rem', marginBottom: '0'}}>Revenue & Profit</p>
      <span style={{ fontSize: '.8rem', display: 'flex', marginTop: '.3rem', marginLeft: '.2rem', lineHeight: '0', color: 'gray' }}>last 2 years</span>
      {chartData.labels && chartData.labels.length > 0 ? (
        <Bar
          data={chartData}
          options={{
            layout: {
              padding: {
                top: 30,
              },
            },
            scales: {
              x: {
                type: 'category',
                ticks: {
                  color: 'rgba(17, 84, 110, 1)',
                  font: {
                    size: 12,
                    weight: '500',
                  },
                },
              },
              revenueProfitAxis: {
                type: 'linear',
                display: true,
                position: 'left',
                grid: {
                  drawOnChartArea: false,
                },
                ticks: {
                  callback: (value) => formatAxisLabel(value),
                  color: 'rgba(128, 0, 128, .8)', // Set the color for the y-axis values
                },                
                title: {
                  display: true,
                  text: 'Revenue | Profit', // Label for the left axis
                  color: 'rgba(128, 0, 128, .8)',
                  font: {
                    size: 12,
                  },
                },
              },
              profitMarginAxis: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                  drawOnChartArea: false,
                },
                ticks: {
                  callback: value => `${value}%`,
                  color: 'rgba(128, 0, 128, .8)', // Set the color for the y-axis values
                },                
                title: {
                  display: true,
                  text: 'Profit Margin', // Label for the left axis
                  color: 'rgba(128, 0, 128, .8)',
                  font: {
                    size: 12,
                  },
                },
              },
            },
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: 'rgba(128, 0, 128, .8)',
                  font: {
                    size: 12,
                  },
                },
              },
              datalabels: {
                display: true,
                color: (context) => {
                  if (context.dataset.label === 'Profit Margin') {
                    return 'rgba(255, 105, 180, 1)';
                  } else {
                    return 'rgba(17, 84, 110, 1)';
                  }
                },
                align: 'end',
                anchor: 'end',
                font: {
                  size: '14',
                },
                formatter: (value, context) => {
                  if (context.dataset.label === 'Profit Margin') {
                    return `${value}%`;
                  } else if (value >= 1000000) {
                    const valueInMillions = (value / 1000000).toFixed(1);
                    return `$${valueInMillions}M`;
                  } else if (value >= 1000) {
                    const valueInThousands = (value / 1000).toFixed(1);
                    return `$${valueInThousands}k`;
                  } else {
                    return `$${value}`;
                  }
                },
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    if (context.dataset.label === 'Revenue') {
                      return `Revenue: $${context.formattedValue}`;
                    }
                    if (context.dataset.label === 'Profit') {
                      return `Profit: $${context.formattedValue}`;
                    }
                    if (context.dataset.label === 'Profit Margin') {
                      return `Profit Margin: ${context.formattedValue}%`;
                    }
                    return context.formattedValue;
                  },
                },
              },
            },
          }}          
        />
      ) : (
        <p>No data available for the chart.</p>
      )}
    </div>
  );
};

export default QuarterlyEarningsGraph;
