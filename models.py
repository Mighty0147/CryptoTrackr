from app import db
from datetime import datetime
from sqlalchemy import func

class Portfolio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to holdings
    holdings = db.relationship('Holding', backref='portfolio', lazy=True, cascade='all, delete-orphan')
    transactions = db.relationship('Transaction', backref='portfolio', lazy=True, cascade='all, delete-orphan')

class Holding(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolio.id'), nullable=False)
    crypto_id = db.Column(db.String(50), nullable=False)  # CoinGecko ID
    crypto_symbol = db.Column(db.String(10), nullable=False)
    crypto_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Float, nullable=False, default=0.0)
    average_buy_price = db.Column(db.Float, nullable=False, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolio.id'), nullable=False)
    crypto_id = db.Column(db.String(50), nullable=False)
    crypto_symbol = db.Column(db.String(10), nullable=False)
    crypto_name = db.Column(db.String(100), nullable=False)
    transaction_type = db.Column(db.String(10), nullable=False)  # 'buy' or 'sell'
    quantity = db.Column(db.Float, nullable=False)
    price_per_unit = db.Column(db.Float, nullable=False)
    total_value = db.Column(db.Float, nullable=False)
    transaction_date = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)

class BitcoinWallet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolio.id'), nullable=False)
    wallet_name = db.Column(db.String(100), nullable=False)
    bitcoin_address = db.Column(db.String(62), nullable=False)  # Bitcoin addresses are max 62 chars
    balance = db.Column(db.Float, nullable=False, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to Bitcoin transactions
    btc_transactions = db.relationship('BitcoinTransaction', backref='wallet', lazy=True, cascade='all, delete-orphan')

class BitcoinTransaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    wallet_id = db.Column(db.Integer, db.ForeignKey('bitcoin_wallet.id'), nullable=False)
    transaction_type = db.Column(db.String(10), nullable=False)  # 'send' or 'receive'
    amount = db.Column(db.Float, nullable=False)
    to_address = db.Column(db.String(62))  # For send transactions
    from_address = db.Column(db.String(62))  # For receive transactions
    transaction_hash = db.Column(db.String(64))  # Bitcoin transaction hash
    transaction_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, failed
    notes = db.Column(db.Text)
