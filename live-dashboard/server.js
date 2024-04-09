require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ConnectionPool } = require('mssql');

const app = express();
const PORT = process.env.DB_PORT || 3001;

app.use(cors());

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
    requestTimeout: 30000,
    connectionTimeout: 30000,
    maxRetries: 3,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 300000,
  },
};

const pool = new ConnectionPool(config);
const poolConnect = pool.connect();

poolConnect
  .then(() => console.log('Connected to SQL Server'))
  .catch((err) => console.error('Error connecting to SQL Server:', err));

app.get('/api/categories', async (req, res) => {
  try {
    const pool = await poolConnect;
    const result = await pool.request().query(`
      select top 5 a.mg,count(*) from (select top 10000 mg from sales with (nolock) where trsdate>getdate()-365
      order by trsdate desc) a
      group by mg
      order by count(*) desc
    `);
    //console.log('Categories Fetch:', result); // Log the SQL query
    const categories = result.recordset.map((row) => row.mg);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories from SQL Server:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/sub-categories', async (req, res) => {
  try {
    const pool = await poolConnect;
    const result = await pool.request().query(`
      select top 5 a.sg,count(*) from (select top 10000 sg from sales with (nolock) where trsdate>getdate()-365 and sg<>''
      order by trsdate desc) a
      group by sg
      order by count(*) desc
    `);
    //console.log('Sub Categories Fetch:', result); // Log the SQL query
    const categories = result.recordset.map((row) => row.sg);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching sub categories from SQL Server:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/sub-sub-categories', async (req, res) => {
  try {
    const pool = await poolConnect;
    const result = await pool.request().query(`
      select top 5 a.ssg,count(*) from (select top 10000 ssg from sales with (nolock) where trsdate>getdate()-365 and ssg<>''
      order by trsdate desc) a
      group by ssg
      order by count(*) desc
    `);
    //console.log('Sub Sub Categories Fetch:', result); // Log the SQL query
    const categories = result.recordset.map((row) => row.ssg);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching sub sub categories from SQL Server:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/stores', async (req, res) => {
  try {
    const pool = await poolConnect;
    const result = await pool.request().query(`
      select distinct storeid from sales with (nolock) where trsdate>getdate()-365
      order by storeid
    `);
    //console.log('Stores Fetch:', result); // Log the SQL query
    const categories = result.recordset.map((row) => row.storeid);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching stores from SQL Server:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/vendors', async (req, res) => {
  try {
    const pool = await poolConnect;
    const result = await pool.request().query(`
      select top 5 a.vendorid,count(*) from (select top 10000 vendorid from sales with (nolock) where trsdate>getdate()-365 and vendorid<>''
      order by trsdate desc) a
      group by vendorid
      order by count(*) desc
    `);
    //console.log('Vendors Fetch:', result); // Log the SQL query
    const categories = result.recordset.map((row) => row.vendorid);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching stores from SQL Server:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/recent-sales', async (req, res) => {
  try {
    const { category, store, vendor, subCategory, subSubCategory } = req.query
    let query = `
      SELECT TOP 30 storeid, receiptno, customerid, cast(sum(quantity*amount) as decimal(12,2)) as amount, lastupdate
      FROM sales with (nolock) where 1=1
    `;
    
    if (category) {
      query += ` and mg = '${category}' `;
    }
    
    if (subCategory) {
      query += ` and sg = '${subCategory}' `;
    }
    
    if (subSubCategory) {
      query += ` and ssg = '${subSubCategory}' `;
    }

    if (store) {
      query += ` and storeid = '${store}' `;
    }

    if (vendor) {
      query += ` and vendorid = '${vendor}' `;
    }

    query += `GROUP BY storeid, receiptno, lastupdate, customerid ORDER BY lastupdate DESC`;

    const request = pool.request();
    const result = await request.query(query);
    //console.log('SQL Query:', query); // Log the SQL query
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching recent sales data from SQL Server:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/api/profit-by-store', async (req, res) => {
  try {
    const { category, store, vendor, subCategory, subSubCategory } = req.query
    const request = pool.request();
    let query = `
    BEGIN TRANSACTION
      if OBJECT_ID('tempdb.dbo.##Profit01','U') is not null drop table ##Profit01
      select  cast('' as varchar(5)) as StoreID,cast(0 as integer) as QtySold,cast(0 as decimal(18,2)) as Cost,cast(0 as decimal(18,2)) as Amount,cast(0 as decimal(18,2)) as Profit,cast(0 as decimal(18,2)) as ProfitPct,cast(0 as decimal(18,2)) as QtyPct,cast(0 as decimal(18,2)) asCostPct,cast
      (0 as decimal(18,2)) as SoldPct,cast(0 as integer) as Seq into ##Profit01 where 1=2
      insert into ##Profit01 select  StoreID,sum(quantity) as QtySold, sum(quantity * cost) as Cost,sum(amount * quantity - discount) as Amount,0 as Profit,0,0,0,0,0 from sales i with (nolock) where i.upc<>'!!gcvrp' and trsdate between CONVERT(DATE, '01/01/' + CAST(YEAR(GETDATE()) AS VARCHAR), 101) and getdate() and i.active<>0 and 
      i.service=0`

      if (category) {
        query += ` and i.mg='${category}' `;
      }
    
      if (subCategory) {
        query += ` and i.sg = '${subCategory}' `;
      }
      
      if (subSubCategory) {
        query += ` and i.ssg = '${subSubCategory}' `;
      }

      if (store) {
        query += ` and i.storeid = '${store}' `;
      }

      if (vendor) {
        query += ` and i.vendorid = '${vendor}' `;
      }

    query+= 
      `
      group by  StoreID
      update ##Profit01 set profit=amount-cost, profitpct= 100 * (1- (cost/amount)) where amount<>0
      select coalesce(StoreID, 'Total/Avg') as StoreID, sum(QtySold) as QtySold, sum(Cost) as Cost, sum(Amount) as Amount, sum(Profit) as Profit, cast(avg(ProfitPCT) as decimal(12,2)) as ProfitPCT from ##Profit01
      group by rollup(storeid)
    COMMIT TRANSACTION
    `;
    const result = await request.query(query);
    //console.log('SQL Query:', query); // Log the SQL query
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching profit by store data from SQL Server:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/profit-by-product', async (req, res) => {
  try {
    const { category, store, vendor, subCategory, subSubCategory } = req.query
    const request = pool.request();
    let query = `
    BEGIN TRANSACTION
      drop table if exists ##Show7011871517
      Select top 10 i.ProductID, cast(sum(amount * quantity) as Decimal(18,2)) as Sold,cast(sum(discount) as decimal(18,2)) as Discount,
      cast(0 as Decimal(18,2)) as ExtSold,cast(sum(cost * quantity) as Decimal(18,2)) as COGS, 
      cast((sum(amount * quantity-discount) - sum(cost * quantity)) as decimal(18,2)) as Profit$, cast(0 as decimal(12,2)) as ProfitPct
      into ##Show7011871517
      from Sales  s with (nolock) left outer join rpcust cust on cust.customerid=s.customerid,Inventory i 
      where s.upc=i.upc and s.storeid=i.storeid and quantity<>0 
      and i.upc<>'!!gcvrp' and i.upc<>'Shipping' and i.active<>0 and i.service=0 and s.trsdate between CONVERT(DATE, '01/01/' + CAST(YEAR(GETDATE())-1 AS VARCHAR), 101) and dateadd(year, -1, getdate())`;

    if (category) {
      query += ` and s.mg='${category}'`;
    }
    
    if (subCategory) {
      query += ` and s.sg = '${subCategory}' `;
    }
    
    if (subSubCategory) {
      query += ` and s.ssg = '${subSubCategory}' `;
    }

    if (store) {
      query += ` and s.storeid = '${store}' `;
    }

    if (vendor) {
      query += ` and s.vendorid = '${vendor}' `;
    }

    query += `
      group by i.ProductID having sum(amount * quantity)-sum(discount)>0 and sum(amount * quantity-discount) - sum(cost * quantity)>0 order by sum(amount * quantity)-sum(discount) desc

      update ##Show7011871517 set extsold=sold-discount
      update ##Show7011871517 set profitpct=100 * (1 - (cogs / ExtSold)) where extsold<>0

      select top 10 ProductID, ExtSold as Revenue, Profit$ as Profit, Case when ProfitPct<0 then 0 else ProfitPct end as ProfitPct from ##Show7011871517  order by Revenue desc
    COMMIT TRANSACTION
    `;

    const result = await request.query(query);
    //console.log('SQL Query:', query); // Log the SQL query
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching profit by product data from SQL Server:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/api/quarterly-earnings', async (req, res) => {
  try {
    const { category, store, vendor, subCategory, subSubCategory } = req.query
    const request = pool.request();
/*
    // Drop table if exists
    try {
      await request.query('if OBJECT_ID(\'tempdb.dbo.##ProfitQuarterly\',\'U\') is not null drop table ##ProfitQuarterly;');
    } catch (dropError) {
      console.error('Error dropping table:', dropError);
    }
*/
    let query = `
    BEGIN TRANSACTION
      IF OBJECT_ID('tempdb.dbo.##ProfitQuarterly', 'U') IS NOT NULL DROP TABLE ##ProfitQuarterly;
      select  cast(0 as decimal(18,2)) as Amount,cast(0 as decimal(18,2)) as Cost,cast(0 as decimal(18,2)) as Revenue,cast(0 as decimal(18,2)) as Profit,cast(0 as decimal(18,2)) as ProfitMargin,cast(0 as int) as Quarter,cast(0 as int) as Year
      into ##ProfitQuarterly where 1=2;
      insert into ##ProfitQuarterly (Amount, Cost, Revenue, Profit, ProfitMargin, Quarter, Year)
      select  sum(amount) as Amount,sum(cost*quantity) as Cost,sum(amount*quantity-discount) as Revenue,0 as Profit,0 as ProfitMargin,datepart(quarter, trsdate) as Quarter,datepart(year, trsdate) as Year from sales i  
      with (nolock) where i.upc <> '!!gcvrp' and trsdate between dateadd(quarter, -7, getdate()) and dateadd(quarter, 1, getdate())  and i.active <> 0 and i.service = 0 `;

    if (category) {
      query += ` and i.mg='${category}' `;
    }
    
    if (subCategory) {
      query += ` and i.sg = '${subCategory}' `;
    }
    
    if (subSubCategory) {
      query += ` and i.ssg = '${subSubCategory}' `;
    }

    if (store) {
      query += ` and i.storeid = '${store}' `;
    }

    if (vendor) {
      query += ` and i.vendorid = '${vendor}' `;
    }

    query += `
      group by grouping sets (
      (datepart(quarter, trsdate), datepart(year, trsdate)),()
      );
      update ##ProfitQuarterly set profit=revenue-cost, ProfitMargin= 100 * (1- (cost/Revenue)) where Revenue<>0
      select sum(Revenue) as Revenue,sum(Profit) as Profit,cast(avg(ProfitMargin) as decimal(12,2)) as ProfitMargin,Quarter,Year
      from ##ProfitQuarterly
      where Year is not null
      group by Quarter,Year
      order by Year asc, Quarter asc
    COMMIT TRANSACTION
    `;

    //console.log('SQL Query:', query); // Log the SQL query
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching quarterly earnings data:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/api/yearly-totals', async (req, res) => {
  try {
    const request = pool.request();
    const result = await request.query(`
	  BEGIN TRANSACTION
      if OBJECT_ID('tempdb.dbo.##Profit70','U') is not null drop table ##Profit70
      select  cast('' as varchar(5)) as StoreID,cast(0 as integer) as QtySold,cast(0 as decimal(18,2)) as Cost,cast(0 as decimal(18,2)) as Amount,cast(0 as decimal(18,2)) as Profit,cast(0 as decimal(18,2)) as ProfitPct,
      cast(0 as decimal(18,2)) as QtyPct,cast(0 as decimal(18,2)) as CostPct,cast(0 as decimal(18,2)) as SoldPct,cast(0 as integer) as OnHand,cast(0 as integer) as Seq into ##Profit70 where 1=2
      insert into ##Profit70 select  StoreID,sum(quantity) as QtySold, sum(quantity * cost) as Cost,sum(amount * quantity - discount) as Amount,0 as Profit,0,0,0,0,0,0 from sales i  with (nolock)
      where i.upc<>'!!gcvrp' and trsdate between CONVERT(DATE, '01/01/' + CAST(YEAR(GETDATE())-1 AS VARCHAR), 101) and dateadd(year, -1, getdate())  and i.active<>0 and i.service=0  group by  StoreID
      update ##Profit70 set profit=amount-cost, profitpct= 100 * (1- (cost/amount)) where amount<>0
      ---
      if OBJECT_ID('tempdb.dbo.##Profit69','U') is not null drop table ##Profit69
      select  cast('' as varchar(5)) as StoreID,cast(0 as integer) as QtySold,cast(0 as decimal(18,2)) as Cost,cast(0 as decimal(18,2)) as Amount,cast(0 as decimal(18,2)) as Profit,cast(0 as decimal(18,2)) as ProfitPct,
      cast(0 as decimal(18,2)) as QtyPct,cast(0 as decimal(18,2)) as CostPct,cast(0 as decimal(18,2)) as SoldPct,cast(0 as integer) as OnHand,cast(0 as integer) as Seq into ##Profit69 where 1=2
      insert into ##Profit69 select  StoreID,sum(quantity) as QtySold, sum(quantity * cost) as Cost,sum(amount * quantity - discount) as Amount,0 as Profit,0,0,0,0,0,0 from sales i with (nolock) 
      where i.upc<>'!!gcvrp' and trsdate between CONVERT(DATE, '01/01/' + CAST(YEAR(GETDATE()) AS VARCHAR), 101) and getdate() and i.active<>0 and i.service=0  group by  StoreID
      update ##Profit69 set profit=amount-cost, profitpct= 100 * (1- (cost/amount)) where amount<>0
      ---
      DECLARE @CurrentYearTotalRevenue DECIMAL(18,2)
      DECLARE @CurrentYearTotalProfit DECIMAL(18,2)
      DECLARE @CurrentYearAvgProfitMargin DECIMAL(12,2)
      DECLARE @PreviousYearTotalRevenue DECIMAL(18,2)
      DECLARE @PreviousYearTotalProfit DECIMAL(18,2)
      DECLARE @PreviousYearAvgProfitMargin DECIMAL(12,2)
      -- Calculate totals for the current year (##Profit69)
      SELECT @CurrentYearTotalRevenue = COALESCE(SUM(amount), 0),
            @CurrentYearTotalProfit = COALESCE(SUM(profit), 0),
            @CurrentYearAvgProfitMargin = CAST(COALESCE(AVG(ProfitPct), 0) AS DECIMAL(12,2))
      FROM ##Profit69
      -- Calculate totals for the previous year (##Profit70)
      SELECT @PreviousYearTotalRevenue = COALESCE(SUM(amount), 0),
            @PreviousYearTotalProfit = COALESCE(SUM(profit), 0),
            @PreviousYearAvgProfitMargin = CAST(COALESCE(AVG(ProfitPct), 0) AS DECIMAL(12,2))
      FROM ##Profit70
      -- Calculate percentage difference
      DECLARE @RevenueDifferencePercentage DECIMAL(12,2)
      DECLARE @ProfitDifferencePercentage DECIMAL(12,2)
      DECLARE @AvgProfitMarginDifferencePercentage DECIMAL(12,2)
      SET @RevenueDifferencePercentage = CASE WHEN @PreviousYearTotalRevenue = 0 THEN 100.00
                                            ELSE ((@CurrentYearTotalRevenue - @PreviousYearTotalRevenue) / @PreviousYearTotalRevenue) * 100
                                        END
      SET @ProfitDifferencePercentage = CASE WHEN @PreviousYearTotalProfit = 0 THEN 100.00
                                            ELSE ((@CurrentYearTotalProfit - @PreviousYearTotalProfit) / @PreviousYearTotalProfit) * 100
                                      END
      SET @AvgProfitMarginDifferencePercentage = @CurrentYearAvgProfitMargin - @PreviousYearAvgProfitMargin
      -- Output results
      SELECT 'Current Year' AS YearType,
            @CurrentYearTotalRevenue AS [Total Revenue],
            @CurrentYearTotalProfit AS [Total Profit],
            @CurrentYearAvgProfitMargin AS [Avg Profit Margin],
            'Previous Year' AS YearType,
            @PreviousYearTotalRevenue AS [Total Revenue],
            @PreviousYearTotalProfit AS [Total Profit],
            @PreviousYearAvgProfitMargin AS [Avg Profit Margin],
            'Percentage Difference' AS YearType,
            @RevenueDifferencePercentage AS [Revenue Difference Percentage],
            @ProfitDifferencePercentage AS [Profit Difference Percentage],
            @AvgProfitMarginDifferencePercentage AS [Avg Profit Margin Difference Percentage]
	  COMMIT TRANSACTION
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching yearly totals data from SQL Server:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});