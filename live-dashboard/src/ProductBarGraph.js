import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(...registerables);

const ProductBarGraph = ({ productData, selectedCategory, selectedSubCategory, selectedSubSubCategory, selectedStore, selectedVendor }) => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    setChartData(productData);
  }, [productData]);

  return (
    <div style={{ height: '100%', padding: '15px', backgroundColor: '#F0F0F0'}}>
    <p style={{ fontSize: '1.2rem', marginRight: '1%', marginBottom: '1rem'}}>Revenue & Profit by Product</p>
      {chartData.labels && chartData.labels.length > 0 ? (
        <Bar
          data={chartData}
          plugins={[ChartDataLabels]}
          options={{
            maintainAspectRatio: true, // Set to false
            aspectRatio: 4, // Adjust the aspectRatio to control height
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
                    size: 13,
                    weight: '500',
                  },
                },
                grid: {
                  display: false,
                },
                barPercentage: 1, // Make the bars touch the x-axis line
                categoryPercentage: 1, // Make the bars touch each other
              },
              revenueProfitAxis: {
                type: 'linear',
                display: false,
                position: 'left',
                grid: {
                  drawOnChartArea: false,
                },
              },
              profitMarginAxis: {
                type: 'linear',
                display: false,
                position: 'right',
                grid: {
                  drawOnChartArea: false,
                },
                max: 105,
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
                  size: '12',
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
  
  export default ProductBarGraph;