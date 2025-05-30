// Main JavaScript functionality for the crypto tracker

// Global variables
let portfolioData = {};
let marketData = {};
let refreshInterval = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Start auto-refresh for market data
    startAutoRefresh();
    
    // Add event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Add click handlers for dynamic content
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-action="refresh-prices"]')) {
            refreshPrices();
        }
    });
}

function startAutoRefresh() {
    // Refresh market data every 5 minutes
    refreshInterval = setInterval(function() {
        if (window.location.pathname === '/market' || window.location.pathname === '/') {
            refreshMarketData();
        }
    }, 300000); // 5 minutes
}

function refreshMarketData() {
    // This would be implemented to refresh market data without page reload
    console.log('Refreshing market data...');
}

function refreshPrices() {
    // Show loading indicator
    const refreshBtn = document.querySelector('[data-action="refresh-prices"]');
    if (refreshBtn) {
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<i data-feather="loader" class="me-1"></i>Refreshing...';
        refreshBtn.disabled = true;
        
        // Simulate refresh (in a real app, this would make API calls)
        setTimeout(() => {
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
            feather.replace();
        }, 2000);
    }
}

// Utility functions
function formatCurrency(amount, decimals = 2) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(amount);
}

function formatPercentage(value) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

function formatNumber(num) {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(1) + 'B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(1) + 'M';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(1) + 'K';
    }
    return num.toFixed(0);
}

// API helper functions
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Portfolio management functions
async function createPortfolio(name, description) {
    try {
        const response = await apiRequest('/api/portfolio/create', {
            method: 'POST',
            body: JSON.stringify({ name, description })
        });
        
        if (response.success) {
            showNotification('Portfolio created successfully', 'success');
            return response;
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        showNotification('Error creating portfolio: ' + error.message, 'error');
        throw error;
    }
}

async function addTransaction(portfolioId, transactionData) {
    try {
        const response = await apiRequest(`/api/portfolio/${portfolioId}/transaction`, {
            method: 'POST',
            body: JSON.stringify(transactionData)
        });
        
        if (response.success) {
            showNotification('Transaction added successfully', 'success');
            return response;
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        showNotification('Error adding transaction: ' + error.message, 'error');
        throw error;
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Loading states
function showLoading(element) {
    const spinner = document.createElement('div');
    spinner.className = 'text-center py-4';
    spinner.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `;
    element.innerHTML = '';
    element.appendChild(spinner);
}

function hideLoading(element, content) {
    element.innerHTML = content;
}

// Error handling
function showError(element, message) {
    element.innerHTML = `
        <div class="text-center py-4">
            <i data-feather="alert-circle" size="48" class="text-danger mb-3"></i>
            <h6 class="text-danger">Error</h6>
            <p class="text-muted">${message}</p>
        </div>
    `;
    feather.replace();
}

// Local storage helpers
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

// Cleanup
window.addEventListener('beforeunload', function() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});
