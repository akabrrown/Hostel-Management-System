// Payment processing utilities and integration
import { paymentSchema } from '@/lib/security/validation'
import { generalRateLimiter, getClientId } from '@/lib/security/rateLimiting'

// Payment gateway configuration
const PAYMENT_CONFIG = {
  // Mobile Money (MTN, Vodafone, etc.)
  mobileMoney: {
    enabled: true,
    providers: ['mtn', 'vodacom', 'airteltigo'],
    fees: {
      mtn: 0.01, // 1% fee
      vodacom: 0.015, // 1.5% fee
      airteltigo: 0.012, // 1.2% fee
    },
  },
  // Bank Transfer
  bankTransfer: {
    enabled: true,
    banks: ['gcb', 'barclays', 'stanbic', 'calbank'],
    fees: {
      fixed: 5.0, // GHS 5 fixed fee
      percentage: 0.005, // 0.5% fee
    },
  },
  // Card payments
  card: {
    enabled: false, // Enable when card processor is integrated
    providers: ['visa', 'mastercard'],
    fees: {
      percentage: 0.029, // 2.9% + .30
      fixed: 0.30,
    },
  },
}

// Payment status types
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
export type PaymentMethod = 'mobile_money' | 'bank_transfer' | 'card'

// Payment interface
export interface Payment {
  id: string
  studentId: string
  amount: number
  paymentMethod: PaymentMethod
  provider?: string
  transactionId: string
  status: PaymentStatus
  semester: string
  academicYear: string
  description?: string
  fees: {
    processing: number
    gateway: number
    total: number
  }
  metadata: {
    ipAddress: string
    userAgent: string
    timestamp: string
  }
  createdAt: string
  updatedAt: string
}

// Payment processing class
class PaymentProcessor {
  private config: typeof PAYMENT_CONFIG

  constructor() {
    this.config = PAYMENT_CONFIG
  }

  // Calculate payment fees
  calculateFees(amount: number, method: PaymentMethod, provider?: string): number {
    switch (method) {
      case 'mobile_money':
        if (!provider || !this.config.mobileMoney.providers.includes(provider)) {
          throw new Error('Invalid mobile money provider')
        }
        return amount * this.config.mobileMoney.fees[provider as keyof typeof this.config.mobileMoney.fees]
      
      case 'bank_transfer':
        return this.config.bankTransfer.fees.fixed + (amount * this.config.bankTransfer.fees.percentage)
      
      case 'card':
        if (!this.config.card.enabled) {
          throw new Error('Card payments are not enabled')
        }
        return this.config.card.fees.fixed + (amount * this.config.card.fees.percentage)
      
      default:
        throw new Error('Invalid payment method')
    }
  }

  // Process payment
  async processPayment(paymentData: Omit<Payment, 'id' | 'fees' | 'metadata' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    // Validate payment data
    const validationResult = paymentSchema.safeParse(paymentData)
    if (!validationResult.success) {
      throw new Error('Invalid payment data')
    }

    // Calculate fees
    const processingFee = this.calculateFees(paymentData.amount, paymentData.paymentMethod, paymentData.provider)
    const gatewayFee = processingFee * 0.1 // 10% of processing fee goes to gateway
    
    const totalFees = processingFee + gatewayFee

    // Create payment record
    const payment: Payment = {
      id: this.generateTransactionId(),
      ...paymentData,
      fees: {
        processing: processingFee,
        gateway: gatewayFee,
        total: totalFees,
      },
      metadata: {
        ipAddress: '127.0.0.1', // Should be extracted from request
        userAgent: 'Mozilla/5.0...', // Should be extracted from request
        timestamp: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // In a real implementation, this would integrate with actual payment gateways
    // For now, we'll simulate the payment processing
    return this.simulatePaymentProcessing(payment)
  }

  // Generate unique transaction ID
  private generateTransactionId(): string {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 8)
    return `PAY_${timestamp}_${random}`.toUpperCase()
  }

  // Simulate payment processing (in real app, this would call actual payment APIs)
  private async simulatePaymentProcessing(payment: Payment): Promise<Payment> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simulate random success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1
    
    return {
      ...payment,
      status: isSuccess ? 'completed' : 'failed',
      updatedAt: new Date().toISOString(),
    }
  }

  // Get payment status
  async getPaymentStatus(transactionId: string): Promise<Payment | null> {
    // In a real implementation, this would query the database or payment provider
    // For now, return null as placeholder
    return null
  }

  // Refund payment
  async refundPayment(transactionId: string, reason?: string): Promise<Payment> {
    // In a real implementation, this would process the refund through the payment gateway
    throw new Error('Refund functionality not yet implemented')
  }
}

// Export singleton instance
export const paymentProcessor = new PaymentProcessor()

// Export utility functions
export const calculatePaymentFees = (amount: number, method: PaymentMethod, provider?: string) => {
  return paymentProcessor.calculateFees(amount, method, provider)
}

export const processStudentPayment = async (paymentData: Omit<Payment, 'id' | 'fees' | 'metadata' | 'createdAt' | 'updatedAt'>) => {
  return paymentProcessor.processPayment(paymentData)
}

// Payment validation schema (basic example)
export const paymentValidationRules = {
  amount: {
    required: true,
    min: 0,
    max: 10000, // Maximum payment amount
  },
  paymentMethod: {
    required: true,
    enum: ['mobile_money', 'bank_transfer', 'card'],
  },
  semester: {
    required: true,
    pattern: /^[A-Z0-9]+-\d{4}$/, // e.g., "FALL2024"
  },
}

export default paymentProcessor
