# E-commerce Application

## Project Structure
- src/main/java - Backend source code
- src/main/resources/templates - HTML templates
- src/main/resources/static - CSS and JavaScript
- pom.xml - Maven dependencies and configuration

## Running the Application

###Prerequisites

Install the following:
- Java JDK 17 or Later
- Apache Maven
- PostgreSql
- Git

### 1. Clone the repository

git clone https://github.com/jimmyjames10-code/ecommerce-project.git

### 2. Configure the database

Create PostgreSQL database

Configure database credentials using environment variables

Required environment variables 
- DB_URL
- DB_USERNAME
- DB_PASSWORD
- PAYSTACK_SECRETE_KEY

### 3. Configure application properties

Reference the appropriate environment variables in your application.properties file.

### 4. Run the application

In your Terminal, navigate to your project directory and execute: mvn spring-boot:run 

### 5. Access the application

Once the application starts, open your browser: http://localhost:8080/ecom

#### Technologies Used
- Java/ Spring Boot
- PostgreSQL
- JDBC
- JavaScript
- HTML/CSS
- Paystck API
- Maven
