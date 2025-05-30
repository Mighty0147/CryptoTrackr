// Chart.js configurations and utilities for the crypto tracker

// Default chart configuration
const defaultChartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                usePointStyle: true,
                font: {
                    size: 12
                }
            }
        },
        tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#ddd',
            borderWidth: 1
        }
    },
    scales: {
        x: {
            grid: {
                display: false
            }
        },
        y: {
            grid: {
                color: 'rgba(255,255,255,0.1)'
            }
        }
    }
};

// Color palette for charts
const chartColors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#FF6384',
    '#C9CBCF',
    '#4BC0C0',
    '#FF6384'
];

// Portfolio allocation chart
function createPortfolioChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                backgroundColor: chartColors.slice(0, data.labels.length),
                borderWidth: 2,
                borderColor: '#1a1a1a'
            }]
        },
        options: {
            ...defaultChartConfig,
            plugins: {
                ...defaultChartConfig.plugins,
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Price history line chart
function createPriceChart(canvasId, data, coinName) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Calculate gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(54, 162, 235, 0.2)');
    gradient.addColorStop(1, 'rgba(54, 162, 235, 0.02)');
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: `${coinName} Price`,
                data: data.data,
                borderColor: '#36A2EB',
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#36A2EB',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            ...defaultChartConfig,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 6
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255,255,255,0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Price: $${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            }
        }
    });
}

// Portfolio performance chart
function createPerformanceChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Portfolio Value',
                data: data.values,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }, {
                label: 'Cost Basis',
                data: data.costBasis,
                borderColor: '#6c757d',
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderDash: [5, 5],
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            ...defaultChartConfig,
            scales: {
                ...defaultChartConfig.scales,
                y: {
                    ...defaultChartConfig.scales.y,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                ...defaultChartConfig.plugins,
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label;
                            const value = context.parsed.y;
                            return `${label}: $${value.toLocaleString()}`;
                        }
                    }
                }
            }
        }
    });
}

// Market overview sparkline charts
function createSparklineChart(canvasId, data, color = '#36A2EB') {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                borderColor: color,
                backgroundColor: 'transparent',
                borderWidth: 1,
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            },
            elements: {
                point: {
                    radius: 0
                }
            }
        }
    });
}

// Profit/Loss comparison chart
function createPLChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Profit/Loss',
                data: data.data,
                backgroundColor: data.data.map(value => value >= 0 ? '#28a745' : '#dc3545'),
                borderColor: data.data.map(value => value >= 0 ? '#1e7e34' : '#bd2130'),
                borderWidth: 1
            }]
        },
        options: {
            ...defaultChartConfig,
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255,255,255,0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            const sign = value >= 0 ? '+' : '';
                            return `P/L: ${sign}$${value.toLocaleString()}`;
                        }
                    }
                }
            }
        }
    });
}

// Chart utility functions
function updateChartData(chart, newData) {
    chart.data.labels = newData.labels;
    chart.data.datasets[0].data = newData.data;
    chart.update('active');
}

function destroyChart(chart) {
    if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
    }
}

// Chart animations
Chart.defaults.animation.duration = 1000;
Chart.defaults.animation.easing = 'easeInOutQuart';

// Responsive chart handling
function handleChartResize() {
    Chart.instances.forEach(chart => {
        chart.resize();
    });
}

window.addEventListener('resize', handleChartResize);

// Export functions for global use
window.chartUtils = {
    createPortfolioChart,
    createPriceChart,
    createPerformanceChart,
    createSparklineChart,
    createPLChart,
    updateChartData,
    destroyChart,
    chartColors
};
