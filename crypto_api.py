import requests
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class CoinGeckoAPI:
    BASE_URL = "https://api.coingecko.com/api/v3"
    
    def __init__(self):
        self.session = requests.Session()
    
    def get_trending_coins(self) -> Optional[List[Dict]]:
        """Get trending coins from CoinGecko"""
        try:
            response = self.session.get(f"{self.BASE_URL}/search/trending", timeout=10)
            response.raise_for_status()
            data = response.json()
            return data.get('coins', [])
        except requests.RequestException as e:
            logger.error(f"Error fetching trending coins: {e}")
            return None
    
    def get_market_data(self, vs_currency='usd', per_page=100, page=1) -> Optional[List[Dict]]:
        """Get market data for cryptocurrencies"""
        try:
            params = {
                'vs_currency': vs_currency,
                'order': 'market_cap_desc',
                'per_page': per_page,
                'page': page,
                'sparkline': 'true',
                'price_change_percentage': '1h,24h,7d'
            }
            response = self.session.get(f"{self.BASE_URL}/coins/markets", params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Error fetching market data: {e}")
            return None
    
    def get_coin_price(self, coin_ids: List[str], vs_currencies=['usd']) -> Optional[Dict]:
        """Get current prices for specific coins"""
        try:
            params = {
                'ids': ','.join(coin_ids),
                'vs_currencies': ','.join(vs_currencies),
                'include_24hr_change': 'true',
                'include_market_cap': 'true'
            }
            response = self.session.get(f"{self.BASE_URL}/simple/price", params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Error fetching coin prices: {e}")
            return None
    
    def search_coins(self, query: str) -> Optional[Dict]:
        """Search for coins by name or symbol"""
        try:
            params = {'query': query}
            response = self.session.get(f"{self.BASE_URL}/search", params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Error searching coins: {e}")
            return None
    
    def get_coin_history(self, coin_id: str, days: int = 30, vs_currency='usd') -> Optional[Dict]:
        """Get historical price data for a coin"""
        try:
            params = {
                'vs_currency': vs_currency,
                'days': days,
                'interval': 'daily' if days > 1 else 'hourly'
            }
            response = self.session.get(f"{self.BASE_URL}/coins/{coin_id}/market_chart", params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Error fetching coin history: {e}")
            return None

# Global API instance
crypto_api = CoinGeckoAPI()
