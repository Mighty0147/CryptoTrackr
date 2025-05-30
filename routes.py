from flask import render_template, request, jsonify, redirect, url_for, flash
from app import app, db
from models import Portfolio, Holding, Transaction, BitcoinWallet, BitcoinTransaction
from crypto_api import crypto_api
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@app.route('/welcome')
def welcome():
    """Welcome page for new users"""
    return render_template('welcome.html')

@app.route('/')
def dashboard():
    """Main dashboard showing portfolio overview"""
    portfolios = Portfolio.query.all()
    
    # Get market overview data
    market_data = crypto_api.get_market_data(per_page=10)
    if not market_data:
        market_data = []
    else:
        # Ensure all numeric fields are properly formatted
        for coin in market_data:
            if coin.get('market_cap') is None:
                coin['market_cap'] = 0
            if coin.get('total_volume') is None:
                coin['total_volume'] = 0
            if coin.get('current_price') is None:
                coin['current_price'] = 0
            if coin.get('price_change_percentage_24h') is None:
                coin['price_change_percentage_24h'] = 0
    
    # Get trending coins
    trending = crypto_api.get_trending_coins()
    trending_coins = []
    if trending:
        trending_coins = [coin['item'] for coin in trending[:5]]
    
    return render_template('dashboard_simple.html', 
                         portfolios=portfolios,
                         market_data=market_data,
                         trending_coins=trending_coins)

@app.route('/portfolio')
@app.route('/portfolio/<int:portfolio_id>')
def portfolio(portfolio_id=None):
    """Portfolio management page"""
    portfolios = Portfolio.query.all()
    current_portfolio = None
    holdings_with_prices = []
    
    if portfolio_id:
        current_portfolio = Portfolio.query.get_or_404(portfolio_id)
        holdings = current_portfolio.holdings
        
        # Get current prices for holdings
        if holdings:
            coin_ids = [h.crypto_id for h in holdings]
            prices = crypto_api.get_coin_price(coin_ids)
            
            for holding in holdings:
                current_price = 0
                price_change_24h = 0
                
                if prices and holding.crypto_id in prices:
                    price_data = prices[holding.crypto_id]
                    current_price = price_data.get('usd', 0)
                    price_change_24h = price_data.get('usd_24h_change', 0)
                
                current_value = current_price * holding.quantity
                cost_basis = holding.average_buy_price * holding.quantity
                profit_loss = current_value - cost_basis
                profit_loss_percentage = (profit_loss / cost_basis * 100) if cost_basis > 0 else 0
                
                holdings_with_prices.append({
                    'holding': holding,
                    'current_price': current_price,
                    'current_value': current_value,
                    'cost_basis': cost_basis,
                    'profit_loss': profit_loss,
                    'profit_loss_percentage': profit_loss_percentage,
                    'price_change_24h': price_change_24h
                })
    
    return render_template('portfolio.html',
                         portfolios=portfolios,
                         current_portfolio=current_portfolio,
                         holdings_with_prices=holdings_with_prices)

@app.route('/market')
def market():
    """Cryptocurrency market overview"""
    page = request.args.get('page', 1, type=int)
    per_page = 50
    
    market_data = crypto_api.get_market_data(per_page=per_page, page=page)
    if not market_data:
        market_data = []
    else:
        # Ensure all numeric fields are properly formatted
        for coin in market_data:
            if coin.get('market_cap') is None:
                coin['market_cap'] = 0
            if coin.get('total_volume') is None:
                coin['total_volume'] = 0
            if coin.get('current_price') is None:
                coin['current_price'] = 0
            if coin.get('price_change_percentage_24h') is None:
                coin['price_change_percentage_24h'] = 0
    
    return render_template('market.html', market_data=market_data, current_page=page)

@app.route('/api/portfolio/create', methods=['POST'])
def create_portfolio():
    """Create a new portfolio"""
    try:
        data = request.get_json()
        portfolio = Portfolio(
            name=data['name'],
            description=data.get('description', '')
        )
        db.session.add(portfolio)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'portfolio_id': portfolio.id,
            'message': 'Portfolio created successfully'
        })
    except Exception as e:
        logger.error(f"Error creating portfolio: {e}")
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/portfolio/<int:portfolio_id>/transaction', methods=['POST'])
def add_transaction():
    """Add a transaction to a portfolio"""
    try:
        portfolio_id = request.view_args['portfolio_id']
        data = request.get_json()
        
        portfolio = Portfolio.query.get_or_404(portfolio_id)
        
        # Create transaction
        transaction = Transaction(
            portfolio_id=portfolio_id,
            crypto_id=data['crypto_id'],
            crypto_symbol=data['crypto_symbol'],
            crypto_name=data['crypto_name'],
            transaction_type=data['transaction_type'],
            quantity=float(data['quantity']),
            price_per_unit=float(data['price_per_unit']),
            total_value=float(data['quantity']) * float(data['price_per_unit']),
            notes=data.get('notes', '')
        )
        db.session.add(transaction)
        
        # Update or create holding
        holding = Holding.query.filter_by(
            portfolio_id=portfolio_id,
            crypto_id=data['crypto_id']
        ).first()
        
        if not holding:
            holding = Holding(
                portfolio_id=portfolio_id,
                crypto_id=data['crypto_id'],
                crypto_symbol=data['crypto_symbol'],
                crypto_name=data['crypto_name'],
                quantity=0,
                average_buy_price=0
            )
            db.session.add(holding)
        
        if data['transaction_type'] == 'buy':
            # Calculate new average buy price
            current_value = holding.quantity * holding.average_buy_price
            new_value = float(data['quantity']) * float(data['price_per_unit'])
            total_quantity = holding.quantity + float(data['quantity'])
            
            if total_quantity > 0:
                holding.average_buy_price = (current_value + new_value) / total_quantity
            holding.quantity = total_quantity
            
        elif data['transaction_type'] == 'sell':
            holding.quantity -= float(data['quantity'])
            if holding.quantity <= 0:
                holding.quantity = 0
        
        holding.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Transaction added successfully'
        })
        
    except Exception as e:
        logger.error(f"Error adding transaction: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/search/coins')
def search_coins():
    """Search for cryptocurrencies"""
    query = request.args.get('q', '')
    if not query:
        return jsonify([])
    
    results = crypto_api.search_coins(query)
    if not results:
        return jsonify([])
    
    # Return top 10 coin results
    coins = results.get('coins', [])[:10]
    return jsonify(coins)

@app.route('/api/portfolio/<int:portfolio_id>/chart')
def portfolio_chart_data():
    """Get portfolio performance chart data"""
    try:
        portfolio = Portfolio.query.get_or_404(portfolio_id)
        holdings = portfolio.holdings
        
        if not holdings:
            return jsonify({'labels': [], 'data': []})
        
        # Get historical data for portfolio holdings
        # This is a simplified version - in a real app you'd want to store historical portfolio values
        coin_ids = [h.crypto_id for h in holdings]
        
        # For demo purposes, we'll just return current allocation
        labels = [h.crypto_name for h in holdings]
        data = []
        
        # Get current prices
        prices = crypto_api.get_coin_price(coin_ids)
        
        for holding in holdings:
            current_price = 0
            if prices and holding.crypto_id in prices:
                current_price = prices[holding.crypto_id].get('usd', 0)
            
            current_value = current_price * holding.quantity
            data.append(current_value)
        
        return jsonify({
            'labels': labels,
            'data': data
        })
        
    except Exception as e:
        logger.error(f"Error getting portfolio chart data: {e}")
        return jsonify({'labels': [], 'data': []}), 400

@app.route('/api/market/chart/<coin_id>')
def coin_chart_data(coin_id):
    """Get historical price data for a coin"""
    days = request.args.get('days', 30, type=int)
    
    try:
        data = crypto_api.get_coin_history(coin_id, days)
        if not data:
            return jsonify({'labels': [], 'data': []}), 400
        
        prices = data.get('prices', [])
        
        labels = []
        price_data = []
        
        for price_point in prices:
            timestamp = price_point[0]
            price = price_point[1]
            
            # Convert timestamp to date
            date = datetime.fromtimestamp(timestamp / 1000)
            labels.append(date.strftime('%Y-%m-%d'))
            price_data.append(price)
        
        return jsonify({
            'labels': labels,
            'data': price_data
        })
        
    except Exception as e:
        logger.error(f"Error getting coin chart data: {e}")
        return jsonify({'labels': [], 'data': []}), 400

@app.route('/bitcoin')
@app.route('/bitcoin/<int:portfolio_id>')
def bitcoin_wallet(portfolio_id=None):
    """Bitcoin wallet management page"""
    portfolios = Portfolio.query.all()
    current_portfolio = None
    bitcoin_wallets = []
    recent_transactions = []
    
    if portfolio_id:
        current_portfolio = Portfolio.query.get_or_404(portfolio_id)
        bitcoin_wallets = BitcoinWallet.query.filter_by(portfolio_id=portfolio_id).all()
        
        # Get recent Bitcoin transactions
        if bitcoin_wallets:
            wallet_ids = [w.id for w in bitcoin_wallets]
            recent_transactions = BitcoinTransaction.query.filter(
                BitcoinTransaction.wallet_id.in_(wallet_ids)
            ).order_by(BitcoinTransaction.transaction_date.desc()).limit(10).all()
    
    return render_template('bitcoin_wallet.html',
                         portfolios=portfolios,
                         current_portfolio=current_portfolio,
                         bitcoin_wallets=bitcoin_wallets,
                         recent_transactions=recent_transactions)

@app.route('/api/bitcoin/wallet/create', methods=['POST'])
def create_bitcoin_wallet():
    """Create a new Bitcoin wallet"""
    try:
        data = request.get_json()
        wallet = BitcoinWallet(
            portfolio_id=data['portfolio_id'],
            wallet_name=data['wallet_name'],
            bitcoin_address=data['bitcoin_address'],
            balance=0.0
        )
        db.session.add(wallet)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'wallet_id': wallet.id,
            'message': 'Bitcoin wallet created successfully'
        })
    except Exception as e:
        logger.error(f"Error creating Bitcoin wallet: {e}")
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/bitcoin/send', methods=['POST'])
def send_bitcoin():
    """Send Bitcoin transaction"""
    try:
        data = request.get_json()
        wallet = BitcoinWallet.query.get_or_404(data['wallet_id'])
        
        amount = float(data['amount'])
        if amount <= 0:
            return jsonify({'success': False, 'message': 'Invalid amount'}), 400
        
        if wallet.balance < amount:
            return jsonify({'success': False, 'message': 'Insufficient balance'}), 400
        
        # Create send transaction
        transaction = BitcoinTransaction(
            wallet_id=wallet.id,
            transaction_type='send',
            amount=amount,
            to_address=data['to_address'],
            transaction_hash=data.get('transaction_hash', ''),
            notes=data.get('notes', '')
        )
        
        # Update wallet balance
        wallet.balance -= amount
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Successfully sent {amount} BTC to {data["to_address"]}'
        })
        
    except Exception as e:
        logger.error(f"Error sending Bitcoin: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/bitcoin/receive', methods=['POST'])
def receive_bitcoin():
    """Receive Bitcoin transaction"""
    try:
        data = request.get_json()
        wallet = BitcoinWallet.query.get_or_404(data['wallet_id'])
        
        amount = float(data['amount'])
        if amount <= 0:
            return jsonify({'success': False, 'message': 'Invalid amount'}), 400
        
        # Create receive transaction
        transaction = BitcoinTransaction(
            wallet_id=wallet.id,
            transaction_type='receive',
            amount=amount,
            from_address=data.get('from_address', ''),
            transaction_hash=data.get('transaction_hash', ''),
            notes=data.get('notes', '')
        )
        
        # Update wallet balance
        wallet.balance += amount
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Successfully received {amount} BTC from {data.get("from_address", "unknown")}'
        })
        
    except Exception as e:
        logger.error(f"Error receiving Bitcoin: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@app.errorhandler(404)
def not_found_error(error):
    return render_template('base.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('base.html'), 500
