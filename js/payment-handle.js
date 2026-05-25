const paymentHandler = {
    goToPayment: function(planType, source) {
        // Store the source page for potential return navigation
        sessionStorage.setItem('paymentSource', source);
        window.location.href = `../services/payment-handle.html?plan=${planType}&source=${source}`;
    },

    getPlanDetails: function() {
        return {
            'youtube': {
                individual: { name: 'Individual Plan', price: 'Rs.200/month' },
                family: { name: 'Family Plan', price: 'Rs.350/month' },
                student: { name: 'Student Plan', price: 'Rs.100/month' }
            },
            'netflix': {
                basic: { name: 'Basic Plan', price: 'Rs.200/month' },
                premium: { name: 'Premium Plan', price: 'Rs.300/month' },
                super: { name: 'Super Premium Plan', price: 'Rs.400/month' }
            },
            'prime': {
                mobile: { name: 'Mobile Plan', price: 'Rs.100/month' },
                prime: { name: 'Prime Plan', price: 'Rs.200/month' },
                family: { name: 'Family Plan', price: 'Rs.300/month' }
            },
            'crunchyroll': {
                fan: { name: 'Fan Plan', price: 'Rs.150/month' },
                mega: { name: 'Mega Fan Plan', price: 'Rs.250/month' },
                ultimate: { name: 'Ultimate Fan Plan', price: 'Rs.350/month' }
            },
            'spotify': {
                individual: { name: 'Individual Plan', price: 'Rs.150/month' },
                duo: { name: 'Duo Plan', price: 'Rs.250/month' },
                family: { name: 'Family Plan', price: 'Rs.350/month' }
            },
            'disney': {
                basic: { name: 'Basic Plan', price: 'Rs.250/month' },
                premium: { name: 'Premium Plan', price: 'Rs.350/month' },
                bundle: { name: 'Bundle Plan', price: 'Rs.450/month' }
            }
        };
    },

    handlePaymentSuccess: function(method, planType, source) {
        try {
            const transactionId = `TRX${Date.now()}`;
            const plan = this.getPlanDetails()[source][planType];
            
            // Store complete payment details
            const paymentDetails = {
                transactionId,
                service: source,
                plan: planType,
                planName: plan.name,
                amount: plan.price,
                paymentMethod: method,
                date: new Date().toISOString(),
                status: 'COMPLETED'
            };

            // Store in sessionStorage for confirmation page
            sessionStorage.setItem('paymentDetails', JSON.stringify(paymentDetails));

            // Redirect to confirmation with parameters
            const params = new URLSearchParams({
                txn: transactionId,
                service: source,
                plan: planType,
                method: method
            });
            
            window.location.href = `../services/confirmation.html?${params.toString()}`;
        } catch (error) {
            this.handleError(error);
        }
    },

    handleError: function(error) {
        console.error('Payment error:', error);
        
        // Store error details
        sessionStorage.setItem('paymentError', JSON.stringify({
            message: error.message,
            timestamp: new Date().toISOString()
        }));

        // Show user-friendly error
        const message = error.message || 'Payment processing failed. Please try again.';
        if (typeof showMessage === 'function') {
            showMessage(message, 'error');
        } else {
            alert(message);
        }

        // Delayed redirect
        setTimeout(() => {
            window.history.back();
        }, 3000);
    },

    validatePlan: function(source, planType) {
        const plans = this.getPlanDetails()[source];
        if (!plans) return false;
        return !!plans[planType];
    },

    validatePayment: function(paymentData) {
        const required = ['transferRef', 'transferDate', 'method'];
        const missing = required.filter(field => !paymentData[field]);
        
        if (missing.length) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }

        if (new Date(paymentData.transferDate) > new Date()) {
            throw new Error('Transfer date cannot be in the future');
        }

        return true;
    },

    processPayment: function(paymentData) {
        return new Promise((resolve, reject) => {
            try {
                // Validate payment data
                this.validatePayment(paymentData);

                // Simulate payment processing
                setTimeout(() => {
                    const success = Math.random() > 0.1; // 90% success rate
                    if (success) {
                        resolve({
                            status: 'COMPLETED',
                            message: 'Payment processed successfully',
                            timestamp: new Date().toISOString()
                        });
                    } else {
                        reject(new Error('Payment processing failed'));
                    }
                }, 2000);
            } catch (error) {
                reject(error);
            }
        });
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = paymentHandler;
}
