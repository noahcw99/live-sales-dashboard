import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import TotalRevenueComponent from './TotalRevenue';
import QuarterlyEarningsGraph from './QuarterlyEarningsGraph';
import SalesTable from './LiveSalesTable';
import SalesByStore from './SalesByStore';
import ProductBarGraph from './ProductBarGraph';
import './SalesDashboardManager.css';

const SalesDashboardManager = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [filtersFetched, setFiltersFetched] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [salesByStoreData, setSalesByStoreData] = useState([]);
  const [quarterlyEarningsData, setQuarterlyEarningsData] = useState([]);
  const [productBarGraphData, setProductBarGraphData] = useState([]);
  const [totalSalesData, setTotalSalesData] = useState([]);
  const [totalsFetched, setTotalsFetched] = useState(false);
 
  useEffect(() => {
    if (filtersFetched) {
      fetchSalesData(selectedCategory, selectedSubCategory, selectedSubSubCategory, selectedStore, selectedVendor);
    }
  }, [selectedCategory, selectedSubCategory, selectedSubSubCategory, selectedStore, selectedVendor, filtersFetched]);  

  const fetchSalesData = async (category, subCategory, subSubCategory, store, vendor) => {
    try {
      await fetch(`http://localhost:3001/api/recent-sales?category=${category}&subCategory=${subCategory}&subSubCategory=${subSubCategory}&store=${store}&vendor=${vendor}`).then(async (response)=>{
      if (!response.ok) {
        throw new Error('Failed to fetch sales data');
      }
      const data = await response.json();
      setSalesData(data);
      fetchSalesByStoreData(selectedCategory, selectedSubCategory, selectedSubSubCategory, selectedStore, selectedVendor);
      })
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };
  
  const fetchSalesByStoreData = async (category, subCategory, subSubCategory, store, vendor) => {
    try {
      await fetch(`http://localhost:3001/api/profit-by-store?category=${category}&subCategory=${subCategory}&subSubCategory=${subSubCategory}&store=${store}&vendor=${vendor}`).then(async (response)=>{
      if (!response.ok) {
        throw new Error('Failed to fetch sales data');
      }
      const data = await response.json();
      setSalesByStoreData(data);
      fetchQuarterlyEarningsData(selectedCategory, selectedSubCategory, selectedSubSubCategory, selectedStore, selectedVendor)
      })
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  const fetchQuarterlyEarningsData = async (category, subCategory, subSubCategory, store, vendor) => {
    try {
      await fetch(`http://localhost:3001/api/quarterly-earnings?category=${category}&subCategory=${subCategory}&subSubCategory=${subSubCategory}&store=${store}&vendor=${vendor}`).then(async (response)=>{
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const revenues = data.map(entry => entry.Revenue);
        const profits = data.map(entry => entry.Profit);
        const profitMargins = data.map(entry => entry.ProfitMargin);

        setQuarterlyEarningsData({
          labels: data.map(entry => `Q${entry.Quarter} ${entry.Year}`),
          datasets: [
            {
              label: 'Revenue',
              data: revenues,
              yAxisID: 'revenueProfitAxis',
              backgroundColor: 'rgba(17, 84, 110, 0.9)',
              borderColor: 'rgba(17, 84, 110, 1)',
              borderWidth: 1,
            },
            {
              label: 'Profit',
              data: profits,
              yAxisID: 'revenueProfitAxis',
              backgroundColor: 'rgba(173, 216, 230, 0.9)',
              borderColor: 'rgba(173, 216, 230, 1)',
              borderWidth: 1,
            },
            {
              label: 'Profit Margin',
              data: profitMargins,
              yAxisID: 'profitMarginAxis',
              type: 'line',
              fill: false,
              backgroundColor: 'rgba(255, 105, 180, 1)',
              borderColor: 'rgba(255, 105, 180, 1)',
              borderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
              lineTension: .4, // Adjust this value for desired curvature
            },
          ],
        });
        fetchProductBarGraphData(selectedCategory, selectedSubCategory, selectedSubSubCategory, selectedStore, selectedVendor)
      } else {
        console.error('Data received from the server is not in the expected format.');
      }
      })
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchProductBarGraphData = async (category, subCategory, subSubCategory, store, vendor) => {
    try {
      await fetch(`http://localhost:3001/api/profit-by-product?category=${category}&subCategory=${subCategory}&subSubCategory=${subSubCategory}&store=${store}&vendor=${vendor}`).then(async (response)=>{
      const data = await response.json();

      //console.log('Response data:', data);

    if (Array.isArray(data) && data.length > 0) {
      const productIDs = data.map(entry => entry.ProductID);
      const revenues = data.map(entry => entry.Revenue);
      const profits = data.map(entry => entry.Profit);
      const profitPcts = data.map(entry => entry.ProfitPct);

      setProductBarGraphData({
        labels: productIDs,
        datasets: [
          {
            label: 'Revenue',
            data: revenues,
            yAxisID: 'revenueProfitAxis',
            backgroundColor: 'rgba(17, 84, 110, 0.9)',
          },
          {
            label: 'Profit',
            data: profits,
            yAxisID: 'revenueProfitAxis',
            backgroundColor: 'rgba(173, 216, 230, 0.9)',
          },
          {
            label: 'Profit Margin',
            data: profitPcts,
            yAxisID: 'profitMarginAxis',
            type: 'bubble',
            fill: false,
            backgroundColor: 'rgba(255, 105, 180, 1)',
            borderColor: 'rgba(255, 105, 180, 1)',
            borderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      });
      if(!totalsFetched) {
        fetchTotalsData()
      }
    } else {
        console.error('Data received from the server is not in the expected format.');
      }
    })
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchTotalsData = async () => {
    try {
      await fetch('http://localhost:3001/api/yearly-totals').then(async (response)=>{
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setTotalSalesData(data);
      } else {
        console.error('Invalid data structure in response:', data);
      }
      })
      setTotalsFetched(true)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      await fetch('http://localhost:3001/api/categories').then(async (response)=>{
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(['All', ...data]);
        fetchSubCategories();
      })
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      await fetch('http://localhost:3001/api/sub-Categories').then(async (response)=>{
      if (!response.ok) {
        throw new Error('Failed to fetch sub categories');
      }
      const data = await response.json();
      setSubCategories(['All', ...data]);
      fetchSubSubCategories();
      })
    } catch (error) {
      console.error('Error fetching sub categories:', error);
    }
  };

  const fetchSubSubCategories = async () => {
    try {
      await fetch('http://localhost:3001/api/sub-sub-categories').then(async (response)=>{
      if (!response.ok) {
        throw new Error('Failed to fetch sub sub categories');
      }
      const data = await response.json();
      setSubSubCategories(['All', ...data]);
      fetchStores();
      })
    } catch (error) {
      console.error('Error fetching sub sub categories:', error);
    }
  };

  const fetchStores = async () => {
    try {
      await fetch('http://localhost:3001/api/stores').then(async (response)=>{
      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }
      const data = await response.json();
      setStores(['All', ...data]);
      fetchVendors();
      })
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      await fetch('http://localhost:3001/api/vendors').then(async (response)=>{
      if (!response.ok) {
        throw new Error('Failed to fetch vendors');
      }
      const data = await response.json();
      setVendors(['All', ...data]);
      setFiltersFetched(true)
      })
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const handleCategoryChange = (selectedCategory) => {
    setSelectedCategory(selectedCategory === 'All' ? '' : selectedCategory);
  };

  const handleStoreChange = (selectedStore) => {
    setSelectedStore(selectedStore === 'All' ? '' : selectedStore);
  };
  
  const handleVendorChange = (selectedVendor) => {
    setSelectedVendor(selectedVendor === 'All' ? '' : selectedVendor);
  };

  const handleSubCategoryChange = (selectedSubCategory) => {
    setSelectedSubCategory(selectedSubCategory === 'All' ? '' : selectedSubCategory);
  };

  const handleSubSubCategoryChange = (selectedSubSubCategory) => {
    setSelectedSubSubCategory(selectedSubSubCategory === 'All' ? '' : selectedSubSubCategory);
  };

  return (
    <div>

      <div className="header" style={{display: 'flex'}}>

        <div className="header" style={{ padding: '16px' }}>
          <h1 style={{ color: 'white', marginRight: '10px', cursor: 'default' }}>Sales Analysis Dashboard</h1>
        </div>

        <div style={{ background: '#136E6D', padding: '4px', marginLeft: '5px', display: 'flex',  alignItems: 'center'}}>
          {/* Dropdown for selecting category */}
          <DropdownButton
            className="filterButton"
            size="sm"
            id="category-dropdown"
            title={`Store: ${selectedStore || 'All'}`}
            variant="info"
            onSelect={handleStoreChange}
          >
            {stores.map((store, index) => (
              <Dropdown.Item key={index} eventKey={store}>
                {store}
              </Dropdown.Item>
            ))}
          </DropdownButton>
          
          {/* Dropdown for selecting category */}
          <DropdownButton
            className="filterButton"
            size="sm"
            id="category-dropdown"
            title={`Vendor: ${selectedVendor || 'All'}`}
            variant="info"
            onSelect={handleVendorChange}
          >
            {vendors.map((vendor, index) => (
              <Dropdown.Item key={index} eventKey={vendor}>
                {vendor}
              </Dropdown.Item>
            ))}
          </DropdownButton>

          {/* Dropdown for selecting category */}
          <DropdownButton
            className="filterButton"
            size="sm"
            id="category-dropdown"
            title={`Product Main Group: ${selectedCategory || 'All'}`}
            variant="info"
            onSelect={handleCategoryChange}
          >
            {categories.map((category, index) => (
              <Dropdown.Item key={index} eventKey={category}>
                {category}
              </Dropdown.Item>
            ))}
          </DropdownButton>

          {/* Dropdown for selecting category */}
          <DropdownButton
            className="filterButton"
            size="sm"
            id="category-dropdown"
            title={`Product Sub Group: ${selectedSubCategory || 'All'}`}
            variant="info"
            onSelect={handleSubCategoryChange}
          >
            {subCategories.map((subCategory, index) => (
              <Dropdown.Item key={index} eventKey={subCategory}>
                {subCategory}
              </Dropdown.Item>
            ))}
          </DropdownButton>

          {/* Dropdown for selecting category */}
          <DropdownButton
            className="filterButton"
            size="sm"
            id="category-dropdown"
            title={`Product Sub-Sub Group: ${selectedSubSubCategory || 'All'}`}
            variant="info"
            onSelect={handleSubSubCategoryChange}
          >
            {subSubCategories.map((subSubCategory, index) => (
              <Dropdown.Item key={index} eventKey={subSubCategory}>
                {subSubCategory}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </div>
         
      </div>

     {(filtersFetched &&
      <div className="grid-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2" style={{ gridTemplateColumns: '35% 65%', paddingTop: '5px', paddingRight: '5px', paddingLeft: '5px' }}>
        {/* Row 1, Cell 1 (nested grid) */}
        <div className="grid-container rounded-lg" >
          <div className="nested-grid grid-cols-1 grid-rows-2 gap-" style={{ gridTemplateRows: 'min-content min-content', backgroundColor: '#e8e8e8'}}>
            {/* Top row */}
            <div>
              <TotalRevenueComponent totalsData={totalSalesData} />
            </div>

            {/* Bottom row */}
            <div className="col-span-3">
              <QuarterlyEarningsGraph quarterlyData={quarterlyEarningsData} selectedCategory={selectedCategory} selectedSubCategory={selectedSubCategory}  selectedSubSubCategory={selectedSubSubCategory} selectedStore={selectedStore} selectedVendor={selectedVendor} />
            </div>
          </div>
        </div>

        {/* Row 1, Cell 2 */}
        <div className="grid-container bg-white rounded-lg">
          <SalesTable salesData={salesData} selectedCategory={selectedCategory} selectedSubCategory={selectedSubCategory}  selectedSubSubCategory={selectedSubSubCategory} selectedStore={selectedStore} selectedVendor={selectedVendor} />
        </div>

        {/* Row 2, Cell 1 */}
        <div className="grid-container bg-white rounded-lg">
          <SalesByStore data={salesByStoreData} selectedCategory={selectedCategory} selectedSubCategory={selectedSubCategory}  selectedSubSubCategory={selectedSubSubCategory} selectedStore={selectedStore} selectedVendor={selectedVendor} />
        </div>

        {/* Row 2, Cell 2 */}
        <div className="grid-container bg-white rounded-lg">
          <ProductBarGraph productData={productBarGraphData} selectedCategory={selectedCategory} selectedSubCategory={selectedSubCategory}  selectedSubSubCategory={selectedSubSubCategory} selectedStore={selectedStore} selectedVendor={selectedVendor} />
        </div>
      </div>
     )}
    </div>
  );
};

export default SalesDashboardManager;
