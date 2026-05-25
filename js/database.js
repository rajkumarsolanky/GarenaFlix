const DatabaseHandler = {
    getAllTransactions: function() {
        const transactions = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('transaction_')) {
                try {
                    const transaction = JSON.parse(localStorage.getItem(key));
                    transactions.push(transaction);
                } catch (error) {
                    console.error('Error parsing transaction:', error);
                }
            }
        }
        return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    searchTransactions: function(query, status = 'all') {
        const transactions = this.getAllTransactions();
        return transactions.filter(transaction => {
            const matchesQuery = !query || 
                transaction.transactionId.toLowerCase().includes(query.toLowerCase()) ||
                transaction.service.toLowerCase().includes(query.toLowerCase()) ||
                transaction.planName.toLowerCase().includes(query.toLowerCase());
            
            const matchesStatus = status === 'all' || transaction.status === status;
            
            return matchesQuery && matchesStatus;
        });
    },

    deleteTransaction: function(transactionId) {
        try {
            // Validate transaction exists
            const transaction = localStorage.getItem(`transaction_${transactionId}`);
            if (!transaction) {
                throw new Error('Transaction not found');
            }

            // Archive transaction before deletion (optional)
            try {
                const archived = JSON.parse(transaction);
                archived.deletedAt = new Date().toISOString();
                localStorage.setItem(`archived_${transactionId}`, JSON.stringify(archived));
            } catch (e) {
                console.warn('Failed to archive transaction:', e);
            }

            // Remove transaction and receipt
            localStorage.removeItem(`transaction_${transactionId}`);
            localStorage.removeItem(`receipt_${transactionId}`);
            
            return true;
        } catch (error) {
            console.error('Error deleting transaction:', error);
            return false;
        }
    },

    exportTransactions: function(format = 'json') {
        const transactions = this.getAllTransactions();
        if (format === 'csv') {
            const headers = ['Date', 'Transaction ID', 'Service', 'Plan', 'Amount', 'Status'];
            const csvContent = [
                headers.join(','),
                ...transactions.map(t => [
                    new Date(t.date).toLocaleString(),
                    t.transactionId,
                    t.service,
                    t.planName,
                    t.amount,
                    t.status
                ].join(','))
            ].join('\n');
            return csvContent;
        }
        return JSON.stringify(transactions, null, 2);
    }
};
