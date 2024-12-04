# CIS550_Group15_Movie

## Overview
This project is a movie web application that allows users to explore movies, manage their own lists of liked movies, and receive personalized movie recommendations based on their preferences. Users can search by title, genre, director, and more, as well as view detailed information on each movie. The app aims to make movie discovery easy and engaging.


## Data Source
- https://grouplens.org/datasets/movielens/latest/
- https://www.kaggle.com/datasets/shubhamchandra235/imdb-and-tmdb-movie-metadata-big-dataset-1m
- TMDB Images API
  
## Cleaned Data
The Data folder contains all raw data, cleaned data, and cleaning scripts. We used Python and Pandas to clean our data.

## ER Diagram
<img width="1108" alt="Screenshot 2024-10-15 at 3 30 15 PM" src="https://github.com/user-attachments/assets/58917c61-1ea5-4504-a76c-50b6835aea53">

## SQL Queries
SQL queries can be found in this [file](https://github.com/xuxx0426/CIS550_Group15_Movie/blob/main/SQL%20Queries/0_Create_database.txt).


## Getting Started
  ### Prerequisites
Before running the application, ensure you have the following installed:

1. **Node.js**:
   - Version: 14.x or above
   - [Download Node.js](https://nodejs.org/)
     
2. **npm** (Node Package Manager):
   - Comes bundled with Node.js.
   - Check version: `npm -v`
   

### **Installation**
1. **Clone the Repository (or download all application code files)**:
   ```bash
   git clone https://github.com/xuxx0426/CIS550_Group15_Movie.git
   ```

2. **Install Dependencies**:
   Navigate to the project directory and install the required Node.js packages:
   ```bash
   npm install
   ```


#### **Running the Application**
1. **Start the Backend Server**:
   In the root directory, run:
   ```bash
   npm start
   ```
   This will launch the backend server on the specified port (default: `8080`).

2. **Run the Frontend**:
   Navigate to the `frontend` directory:
   ```bash
   cd frontend
   npm install
   npm start
   ```
   This will launch the React frontend on `http://localhost:3000`.

3. **Access the Application**:
   Open your browser and navigate to `http://localhost:3000`.

