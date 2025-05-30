# CryptoTrackr

CryptoTrackr is a Flask web application for tracking cryptocurrency portfolios and market data.

## Features

- User portfolio management
- Real-time cryptocurrency market data visualization
- Interactive dashboard and charts
- Secure user sessions

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/Mighty0147/CryptoTrackr.git
   ```
2. Navigate to the project directory:
   ```
   cd CryptoTrackr
   ```
3. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
5. Run the app:
   ```
   python app.py
   ```

## Deployment

The app can be deployed on platforms like Render or Heroku. Ensure environment variables such as `DATABASE_URL` and `SESSION_SECRET` are set.

## License

This project is licensed under the MIT License.
