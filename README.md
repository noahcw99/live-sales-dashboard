Live Sales Dashboard

Welcome to the Live Sales Dashboard project! This dashboard provides real-time insights into sales data, allowing you to analyze performance and make informed decisions.

Getting Started
To run this project locally, follow these steps:

Clone the repository to your local machine:
Copy code -
git clone https://github.com/your-username/live-sales-dashboard.git

Navigate to the project directory:
Copy code -
cd live-sales-dashboard


Install dependencies for the frontend and backend:
Copy code -
cd frontend
npm install
cd ../backend
npm install
cd ..

Create a .env file in the root directory of the project with the following content:
Copy code -
DB_USER=your_sql_server_username
DB_PASSWORD=your_sql_server_password
DB_SERVER=your_sql_server_address
DB_DATABASE=your_database_name
Replace your_sql_server_username, your_sql_server_password, your_sql_server_address, and your_database_name with your SQL Server credentials and database information.

Start the frontend and backend servers using PM2:
Copy code
pm2 start frontend/server.js --name frontend
pm2 start backend/server.js --name backend


Access the Live Sales Dashboard in your browser:
Frontend: http://localhost:3000
Backend API: http://localhost:3001
Additional Information
The frontend is built using React, and the backend is powered by Node.js and Express.
For production deployment, configure your PM2 instances and server environment accordingly.
Contact noah.c.welsh99@gmail.com for any issues or inquiries.
