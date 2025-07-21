/**
 * Monetization System - 50:50 Profit Split
 * 
 * Handles workflow pricing, payments, revenue tracking, and automatic
 * 50:50 profit distribution between creators and the platform.
 */

export interface WorkflowPricing {
  workflowId: string;
  creator: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Pricing model
  model: 'free' | 'pay_per_use' | 'subscription' | 'one_time';
  
  // Pay-per-use pricing
  basePrice: number; // Base price in credits
  perUnitPrice?: number; // Price per unit (e.g., per row, per image)
  unit?: string; // Unit description (e.g., 'row', 'image', 'word')
  
  // Subscription pricing
  monthlyPrice?: number;
  yearlyPrice?: number;
  freeTrialDays?: number;
  
  // One-time purchase
  oneTimePrice?: number;
  
  // Pricing tiers
  tiers?: PricingTier[];
  
  // Free tier limits
  freeUsageLimit?: number;
  freeTierActive: boolean;
  
  // Revenue settings
  platformShare: number; // Platform's share (default 50%)
  creatorShare: number; // Creator's share (default 50%)
}

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  limits: {
    executions?: number;
    dataRows?: number;
    fileSize?: number;
  };
  popular?: boolean;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  userId: string;
  createdAt: Date;
  completedAt?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  
  // Cost calculation
  baseCost: number;
  unitCost: number;
  totalCost: number;
  currency: string;
  
  // Usage metrics
  inputSize?: number;
  outputSize?: number;
  processingTime?: number;
  unitsProcessed?: number;
  
  // Payment info
  paymentId?: string;
  paid: boolean;
  
  // Revenue distribution
  revenueDistribution?: RevenueDistribution;
}

export interface RevenueDistribution {
  executionId: string;
  workflowId: string;
  totalRevenue: number;
  platformRevenue: number;
  creatorRevenue: number;
  processingFees: number;
  netRevenue: number;
  distributedAt: Date;
}

export interface CreatorEarnings {
  userId: string;
  workflowId: string;
  workflowName: string;
  
  // Totals
  totalRevenue: number;
  totalExecutions: number;
  totalUsers: number;
  
  // Time periods
  thisMonth: number;
  lastMonth: number;
  thisYear: number;
  
  // Breakdown
  revenueByDay: Array<{ date: Date; revenue: number; executions: number }>;
  revenueBySource: Record<string, number>;
  
  // Metrics
  averageRevenuePerExecution: number;
  averageRevenuePerUser: number;
  conversionRate: number;
  
  // Payouts
  totalPaidOut: number;
  pendingPayout: number;
  lastPayoutDate?: Date;
  nextPayoutDate?: Date;
}

export interface Payout {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
  
  // Payment details
  paymentMethod: string;
  paymentId?: string;
  
  // Breakdown
  executions: string[];
  totalExecutions: number;
  grossAmount: number;
  fees: number;
  netAmount: number;
  
  // Failure info
  failureReason?: string;
  retryCount: number;
}

export interface UsageQuota {
  userId: string;
  workflowId: string;
  
  // Current usage
  currentUsage: number;
  maxUsage: number;
  resetDate: Date;
  
  // Subscription info
  subscriptionId?: string;
  subscriptionTier?: string;
  
  // Overages
  overageUsage: number;
  overageRate: number;
  
  // Limits
  dailyLimit?: number;
  monthlyLimit?: number;
  rateLimitPerMinute?: number;
}

// Platform configuration
export const PLATFORM_CONFIG = {
  defaultPlatformShare: 0.5, // 50%
  defaultCreatorShare: 0.5, // 50%
  minimumPayout: 25, // $25 minimum payout
  payoutCurrency: 'USD',
  payoutSchedule: 'weekly', // weekly, monthly
  processingFeeRate: 0.029, // 2.9% processing fee
  fixedProcessingFee: 0.30, // $0.30 fixed fee
  
  // Free tier limits
  defaultFreeLimit: 10, // 10 executions per month
  
  // Credit system
  creditToDollar: 0.01, // 1 credit = $0.01
  dollarToCredit: 100, // $1 = 100 credits
};

export class MonetizationManager {
  private static instance: MonetizationManager;
  private pricingConfigs: Map<string, WorkflowPricing> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private earnings: Map<string, CreatorEarnings> = new Map();
  private payouts: Map<string, Payout[]> = new Map();
  private quotas: Map<string, UsageQuota> = new Map();

  static getInstance(): MonetizationManager {
    if (!MonetizationManager.instance) {
      MonetizationManager.instance = new MonetizationManager();
    }
    return MonetizationManager.instance;
  }

  /**
   * Configure workflow pricing
   */
  async configureWorkflowPricing(
    workflowId: string,
    creator: string,
    pricing: Partial<WorkflowPricing>
  ): Promise<WorkflowPricing> {
    const config: WorkflowPricing = {
      workflowId,
      creator,
      createdAt: new Date(),
      updatedAt: new Date(),
      model: pricing.model || 'free',
      basePrice: pricing.basePrice || 0,
      perUnitPrice: pricing.perUnitPrice,
      unit: pricing.unit,
      monthlyPrice: pricing.monthlyPrice,
      yearlyPrice: pricing.yearlyPrice,
      freeTrialDays: pricing.freeTrialDays,
      oneTimePrice: pricing.oneTimePrice,
      tiers: pricing.tiers || [],
      freeUsageLimit: pricing.freeUsageLimit || PLATFORM_CONFIG.defaultFreeLimit,
      freeTierActive: pricing.freeTierActive ?? true,
      platformShare: pricing.platformShare || PLATFORM_CONFIG.defaultPlatformShare,
      creatorShare: pricing.creatorShare || PLATFORM_CONFIG.defaultCreatorShare,
    };

    this.pricingConfigs.set(workflowId, config);
    return config;
  }

  /**
   * Calculate execution cost
   */
  calculateExecutionCost(
    workflowId: string,
    unitsProcessed: number = 1,
    userTier?: string
  ): { baseCost: number; unitCost: number; totalCost: number } {
    const pricing = this.pricingConfigs.get(workflowId);
    if (!pricing) {
      return { baseCost: 0, unitCost: 0, totalCost: 0 };
    }

    if (pricing.model === 'free') {
      return { baseCost: 0, unitCost: 0, totalCost: 0 };
    }

    const baseCost = pricing.basePrice;
    const unitCost = (pricing.perUnitPrice || 0) * unitsProcessed;
    const totalCost = baseCost + unitCost;

    return { baseCost, unitCost, totalCost };
  }

  /**
   * Execute workflow with payment processing
   */
  async executeWorkflow(
    workflowId: string,
    userId: string,
    inputData: any,
    unitsProcessed: number = 1
  ): Promise<WorkflowExecution> {
    const pricing = this.pricingConfigs.get(workflowId);
    if (!pricing) {
      throw new Error('Workflow pricing not configured');
    }

    // Check quota
    const canExecute = await this.checkUsageQuota(userId, workflowId);
    if (!canExecute) {
      throw new Error('Usage quota exceeded');
    }

    // Calculate cost
    const { baseCost, unitCost, totalCost } = this.calculateExecutionCost(
      workflowId,
      unitsProcessed
    );

    // Create execution record
    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      userId,
      createdAt: new Date(),
      status: 'pending',
      baseCost,
      unitCost,
      totalCost,
      currency: 'USD',
      unitsProcessed,
      paid: totalCost === 0, // Free executions are automatically "paid"
    };

    // Process payment if needed
    if (totalCost > 0) {
      const paymentResult = await this.processPayment(userId, totalCost);
      execution.paymentId = paymentResult.paymentId;
      execution.paid = paymentResult.success;
    }

    if (execution.paid) {
      // Update quota
      await this.updateUsageQuota(userId, workflowId, 1);
      
      // Distribute revenue
      if (totalCost > 0) {
        execution.revenueDistribution = await this.distributeRevenue(execution);
      }
    }

    this.executions.set(execution.id, execution);
    return execution;
  }

  /**
   * Process payment
   */
  private async processPayment(
    userId: string,
    amount: number
  ): Promise<{ paymentId: string; success: boolean }> {
    // Mock payment processing
    // In production, this would integrate with Stripe, PayPal, etc.
    
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock 95% success rate
    const success = Math.random() > 0.05;
    
    return { paymentId, success };
  }

  /**
   * Distribute revenue with 50:50 split
   */
  private async distributeRevenue(execution: WorkflowExecution): Promise<RevenueDistribution> {
    const pricing = this.pricingConfigs.get(execution.workflowId);
    if (!pricing) {
      throw new Error('Pricing configuration not found');
    }

    const totalRevenue = execution.totalCost;
    const processingFees = totalRevenue * PLATFORM_CONFIG.processingFeeRate + PLATFORM_CONFIG.fixedProcessingFee;
    const netRevenue = totalRevenue - processingFees;
    
    const platformRevenue = netRevenue * pricing.platformShare;
    const creatorRevenue = netRevenue * pricing.creatorShare;

    const distribution: RevenueDistribution = {
      executionId: execution.id,
      workflowId: execution.workflowId,
      totalRevenue,
      platformRevenue,
      creatorRevenue,
      processingFees,
      netRevenue,
      distributedAt: new Date()
    };

    // Update creator earnings
    await this.updateCreatorEarnings(pricing.creator, execution.workflowId, distribution);

    return distribution;
  }

  /**
   * Update creator earnings
   */
  private async updateCreatorEarnings(
    creatorId: string,
    workflowId: string,
    distribution: RevenueDistribution
  ): Promise<void> {
    const key = `${creatorId}_${workflowId}`;
    const existing = this.earnings.get(key);
    
    if (existing) {
      existing.totalRevenue += distribution.creatorRevenue;
      existing.totalExecutions += 1;
      existing.averageRevenuePerExecution = existing.totalRevenue / existing.totalExecutions;
      
      // Update monthly earnings
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      if (distribution.distributedAt.getMonth() === currentMonth && 
          distribution.distributedAt.getFullYear() === currentYear) {
        existing.thisMonth += distribution.creatorRevenue;
      }
      
      existing.pendingPayout += distribution.creatorRevenue;
    } else {
      const newEarnings: CreatorEarnings = {
        userId: creatorId,
        workflowId,
        workflowName: `Workflow ${workflowId}`, // Would be fetched from workflow service
        totalRevenue: distribution.creatorRevenue,
        totalExecutions: 1,
        totalUsers: 1,
        thisMonth: distribution.creatorRevenue,
        lastMonth: 0,
        thisYear: distribution.creatorRevenue,
        revenueByDay: [],
        revenueBySource: {},
        averageRevenuePerExecution: distribution.creatorRevenue,
        averageRevenuePerUser: distribution.creatorRevenue,
        conversionRate: 1.0,
        totalPaidOut: 0,
        pendingPayout: distribution.creatorRevenue,
        nextPayoutDate: this.getNextPayoutDate()
      };
      
      this.earnings.set(key, newEarnings);
    }
  }

  /**
   * Check usage quota
   */
  private async checkUsageQuota(userId: string, workflowId: string): Promise<boolean> {
    const key = `${userId}_${workflowId}`;
    const quota = this.quotas.get(key);
    
    if (!quota) {
      // Create new quota
      const pricing = this.pricingConfigs.get(workflowId);
      const newQuota: UsageQuota = {
        userId,
        workflowId,
        currentUsage: 0,
        maxUsage: pricing?.freeUsageLimit || PLATFORM_CONFIG.defaultFreeLimit,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        overageUsage: 0,
        overageRate: 0
      };
      
      this.quotas.set(key, newQuota);
      return true;
    }

    // Check if quota allows execution
    return quota.currentUsage < quota.maxUsage || quota.subscriptionId !== undefined;
  }

  /**
   * Update usage quota
   */
  private async updateUsageQuota(
    userId: string,
    workflowId: string,
    usageAmount: number
  ): Promise<void> {
    const key = `${userId}_${workflowId}`;
    const quota = this.quotas.get(key);
    
    if (quota) {
      quota.currentUsage += usageAmount;
      
      // Handle overage
      if (quota.currentUsage > quota.maxUsage) {
        quota.overageUsage += usageAmount;
      }
    }
  }

  /**
   * Get creator earnings
   */
  getCreatorEarnings(creatorId: string): CreatorEarnings[] {
    return Array.from(this.earnings.values()).filter(
      earning => earning.userId === creatorId
    );
  }

  /**
   * Get creator total earnings
   */
  getCreatorTotalEarnings(creatorId: string): {
    totalRevenue: number;
    totalExecutions: number;
    totalWorkflows: number;
    pendingPayout: number;
    thisMonth: number;
  } {
    const earnings = this.getCreatorEarnings(creatorId);
    
    return {
      totalRevenue: earnings.reduce((sum, e) => sum + e.totalRevenue, 0),
      totalExecutions: earnings.reduce((sum, e) => sum + e.totalExecutions, 0),
      totalWorkflows: earnings.length,
      pendingPayout: earnings.reduce((sum, e) => sum + e.pendingPayout, 0),
      thisMonth: earnings.reduce((sum, e) => sum + e.thisMonth, 0)
    };
  }

  /**
   * Process creator payout
   */
  async processCreatorPayout(
    creatorId: string,
    paymentMethod: string
  ): Promise<Payout> {
    const earnings = this.getCreatorEarnings(creatorId);
    const totalPending = earnings.reduce((sum, e) => sum + e.pendingPayout, 0);
    
    if (totalPending < PLATFORM_CONFIG.minimumPayout) {
      throw new Error(`Minimum payout amount is $${PLATFORM_CONFIG.minimumPayout}`);
    }

    const payout: Payout = {
      id: `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: creatorId,
      amount: totalPending,
      currency: PLATFORM_CONFIG.payoutCurrency,
      status: 'pending',
      createdAt: new Date(),
      paymentMethod,
      executions: [],
      totalExecutions: earnings.reduce((sum, e) => sum + e.totalExecutions, 0),
      grossAmount: totalPending,
      fees: 0,
      netAmount: totalPending,
      retryCount: 0
    };

    // Mock payout processing
    setTimeout(() => {
      payout.status = 'completed';
      payout.processedAt = new Date();
      
      // Reset pending payouts
      earnings.forEach(earning => {
        earning.totalPaidOut += earning.pendingPayout;
        earning.pendingPayout = 0;
        earning.lastPayoutDate = new Date();
        earning.nextPayoutDate = this.getNextPayoutDate();
      });
    }, 3000);

    // Store payout
    const userPayouts = this.payouts.get(creatorId) || [];
    this.payouts.set(creatorId, [...userPayouts, payout]);

    return payout;
  }

  /**
   * Get creator payouts
   */
  getCreatorPayouts(creatorId: string): Payout[] {
    return this.payouts.get(creatorId) || [];
  }

  /**
   * Get next payout date
   */
  private getNextPayoutDate(): Date {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Next Friday
    const daysToFriday = (5 - nextWeek.getDay() + 7) % 7;
    return new Date(nextWeek.getTime() + daysToFriday * 24 * 60 * 60 * 1000);
  }

  /**
   * Get workflow analytics
   */
  getWorkflowAnalytics(workflowId: string): {
    totalRevenue: number;
    totalExecutions: number;
    totalUsers: number;
    averageRevenue: number;
    revenueGrowth: number;
    topUsers: Array<{ userId: string; revenue: number; executions: number }>;
  } {
    const executions = Array.from(this.executions.values())
      .filter(exec => exec.workflowId === workflowId && exec.paid);
    
    const totalRevenue = executions.reduce((sum, exec) => sum + exec.totalCost, 0);
    const totalExecutions = executions.length;
    const uniqueUsers = new Set(executions.map(exec => exec.userId));
    
    const userStats = new Map<string, { revenue: number; executions: number }>();
    executions.forEach(exec => {
      const existing = userStats.get(exec.userId) || { revenue: 0, executions: 0 };
      existing.revenue += exec.totalCost;
      existing.executions += 1;
      userStats.set(exec.userId, existing);
    });

    const topUsers = Array.from(userStats.entries())
      .map(([userId, stats]) => ({ userId, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalRevenue,
      totalExecutions,
      totalUsers: uniqueUsers.size,
      averageRevenue: totalRevenue / Math.max(totalExecutions, 1),
      revenueGrowth: 0, // Would calculate based on historical data
      topUsers
    };
  }
}

// Export singleton
export const monetizationManager = MonetizationManager.getInstance();

// Helper functions
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

export const formatCredits = (credits: number): string => {
  return `${credits.toLocaleString()} credits`;
};

export const creditsToUSD = (credits: number): number => {
  return credits * PLATFORM_CONFIG.creditToDollar;
};

export const usdToCredits = (usd: number): number => {
  return usd * PLATFORM_CONFIG.dollarToCredit;
};

/**
 * Monetization System - 50:50 Profit Split
 * 
 * Handles workflow pricing, payments, revenue tracking, and automatic
 * 50:50 profit distribution between creators and the platform.
 */

export interface WorkflowPricing {
  workflowId: string;
  creator: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Pricing model
  model: 'free' | 'pay_per_use' | 'subscription' | 'one_time';
  
  // Pay-per-use pricing
  basePrice: number; // Base price in credits
  perUnitPrice?: number; // Price per unit (e.g., per row, per image)
  unit?: string; // Unit description (e.g., 'row', 'image', 'word')
  
  // Subscription pricing
  monthlyPrice?: number;
  yearlyPrice?: number;
  freeTrialDays?: number;
  
  // One-time purchase
  oneTimePrice?: number;
  
  // Pricing tiers
  tiers?: PricingTier[];
  
  // Free tier limits
  freeUsageLimit?: number;
  freeTierActive: boolean;
  
  // Revenue settings
  platformShare: number; // Platform's share (default 50%)
  creatorShare: number; // Creator's share (default 50%)
}

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  limits: {
    executions?: number;
    dataRows?: number;
    fileSize?: number;
  };
  popular?: boolean;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  userId: string;
  createdAt: Date;
  completedAt?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  
  // Cost calculation
  baseCost: number;
  unitCost: number;
  totalCost: number;
  currency: string;
  
  // Usage metrics
  inputSize?: number;
  outputSize?: number;
  processingTime?: number;
  unitsProcessed?: number;
  
  // Payment info
  paymentId?: string;
  paid: boolean;
  
  // Revenue distribution
  revenueDistribution?: RevenueDistribution;
}

export interface RevenueDistribution {
  executionId: string;
  workflowId: string;
  totalRevenue: number;
  platformRevenue: number;
  creatorRevenue: number;
  processingFees: number;
  netRevenue: number;
  distributedAt: Date;
}

export interface CreatorEarnings {
  userId: string;
  workflowId: string;
  workflowName: string;
  
  // Totals
  totalRevenue: number;
  totalExecutions: number;
  totalUsers: number;
  
  // Time periods
  thisMonth: number;
  lastMonth: number;
  thisYear: number;
  
  // Breakdown
  revenueByDay: Array<{ date: Date; revenue: number; executions: number }>;
  revenueBySource: Record<string, number>;
  
  // Metrics
  averageRevenuePerExecution: number;
  averageRevenuePerUser: number;
  conversionRate: number;
  
  // Payouts
  totalPaidOut: number;
  pendingPayout: number;
  lastPayoutDate?: Date;
  nextPayoutDate?: Date;
}

export interface Payout {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
  
  // Payment details
  paymentMethod: string;
  paymentId?: string;
  
  // Breakdown
  executions: string[];
  totalExecutions: number;
  grossAmount: number;
  fees: number;
  netAmount: number;
  
  // Failure info
  failureReason?: string;
  retryCount: number;
}

export interface UsageQuota {
  userId: string;
  workflowId: string;
  
  // Current usage
  currentUsage: number;
  maxUsage: number;
  resetDate: Date;
  
  // Subscription info
  subscriptionId?: string;
  subscriptionTier?: string;
  
  // Overages
  overageUsage: number;
  overageRate: number;
  
  // Limits
  dailyLimit?: number;
  monthlyLimit?: number;
  rateLimitPerMinute?: number;
}

// Platform configuration
export const PLATFORM_CONFIG = {
  defaultPlatformShare: 0.5, // 50%
  defaultCreatorShare: 0.5, // 50%
  minimumPayout: 25, // $25 minimum payout
  payoutCurrency: 'USD',
  payoutSchedule: 'weekly', // weekly, monthly
  processingFeeRate: 0.029, // 2.9% processing fee
  fixedProcessingFee: 0.30, // $0.30 fixed fee
  
  // Free tier limits
  defaultFreeLimit: 10, // 10 executions per month
  
  // Credit system
  creditToDollar: 0.01, // 1 credit = $0.01
  dollarToCredit: 100, // $1 = 100 credits
};

export class MonetizationManager {
  private static instance: MonetizationManager;
  private pricingConfigs: Map<string, WorkflowPricing> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private earnings: Map<string, CreatorEarnings> = new Map();
  private payouts: Map<string, Payout[]> = new Map();
  private quotas: Map<string, UsageQuota> = new Map();

  static getInstance(): MonetizationManager {
    if (!MonetizationManager.instance) {
      MonetizationManager.instance = new MonetizationManager();
    }
    return MonetizationManager.instance;
  }

  /**
   * Configure workflow pricing
   */
  async configureWorkflowPricing(
    workflowId: string,
    creator: string,
    pricing: Partial<WorkflowPricing>
  ): Promise<WorkflowPricing> {
    const config: WorkflowPricing = {
      workflowId,
      creator,
      createdAt: new Date(),
      updatedAt: new Date(),
      model: pricing.model || 'free',
      basePrice: pricing.basePrice || 0,
      perUnitPrice: pricing.perUnitPrice,
      unit: pricing.unit,
      monthlyPrice: pricing.monthlyPrice,
      yearlyPrice: pricing.yearlyPrice,
      freeTrialDays: pricing.freeTrialDays,
      oneTimePrice: pricing.oneTimePrice,
      tiers: pricing.tiers || [],
      freeUsageLimit: pricing.freeUsageLimit || PLATFORM_CONFIG.defaultFreeLimit,
      freeTierActive: pricing.freeTierActive ?? true,
      platformShare: pricing.platformShare || PLATFORM_CONFIG.defaultPlatformShare,
      creatorShare: pricing.creatorShare || PLATFORM_CONFIG.defaultCreatorShare,
    };

    this.pricingConfigs.set(workflowId, config);
    return config;
  }

  /**
   * Calculate execution cost
   */
  calculateExecutionCost(
    workflowId: string,
    unitsProcessed: number = 1,
    userTier?: string
  ): { baseCost: number; unitCost: number; totalCost: number } {
    const pricing = this.pricingConfigs.get(workflowId);
    if (!pricing) {
      return { baseCost: 0, unitCost: 0, totalCost: 0 };
    }

    if (pricing.model === 'free') {
      return { baseCost: 0, unitCost: 0, totalCost: 0 };
    }

    const baseCost = pricing.basePrice;
    const unitCost = (pricing.perUnitPrice || 0) * unitsProcessed;
    const totalCost = baseCost + unitCost;

    return { baseCost, unitCost, totalCost };
  }

  /**
   * Execute workflow with payment processing
   */
  async executeWorkflow(
    workflowId: string,
    userId: string,
    inputData: any,
    unitsProcessed: number = 1
  ): Promise<WorkflowExecution> {
    const pricing = this.pricingConfigs.get(workflowId);
    if (!pricing) {
      throw new Error('Workflow pricing not configured');
    }

    // Check quota
    const canExecute = await this.checkUsageQuota(userId, workflowId);
    if (!canExecute) {
      throw new Error('Usage quota exceeded');
    }

    // Calculate cost
    const { baseCost, unitCost, totalCost } = this.calculateExecutionCost(
      workflowId,
      unitsProcessed
    );

    // Create execution record
    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      userId,
      createdAt: new Date(),
      status: 'pending',
      baseCost,
      unitCost,
      totalCost,
      currency: 'USD',
      unitsProcessed,
      paid: totalCost === 0, // Free executions are automatically "paid"
    };

    // Process payment if needed
    if (totalCost > 0) {
      const paymentResult = await this.processPayment(userId, totalCost);
      execution.paymentId = paymentResult.paymentId;
      execution.paid = paymentResult.success;
    }

    if (execution.paid) {
      // Update quota
      await this.updateUsageQuota(userId, workflowId, 1);
      
      // Distribute revenue
      if (totalCost > 0) {
        execution.revenueDistribution = await this.distributeRevenue(execution);
      }
    }

    this.executions.set(execution.id, execution);
    return execution;
  }

  /**
   * Process payment
   */
  private async processPayment(
    userId: string,
    amount: number
  ): Promise<{ paymentId: string; success: boolean }> {
    // Mock payment processing
    // In production, this would integrate with Stripe, PayPal, etc.
    
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock 95% success rate
    const success = Math.random() > 0.05;
    
    return { paymentId, success };
  }

  /**
   * Distribute revenue with 50:50 split
   */
  private async distributeRevenue(execution: WorkflowExecution): Promise<RevenueDistribution> {
    const pricing = this.pricingConfigs.get(execution.workflowId);
    if (!pricing) {
      throw new Error('Pricing configuration not found');
    }

    const totalRevenue = execution.totalCost;
    const processingFees = totalRevenue * PLATFORM_CONFIG.processingFeeRate + PLATFORM_CONFIG.fixedProcessingFee;
    const netRevenue = totalRevenue - processingFees;
    
    const platformRevenue = netRevenue * pricing.platformShare;
    const creatorRevenue = netRevenue * pricing.creatorShare;

    const distribution: RevenueDistribution = {
      executionId: execution.id,
      workflowId: execution.workflowId,
      totalRevenue,
      platformRevenue,
      creatorRevenue,
      processingFees,
      netRevenue,
      distributedAt: new Date()
    };

    // Update creator earnings
    await this.updateCreatorEarnings(pricing.creator, execution.workflowId, distribution);

    return distribution;
  }

  /**
   * Update creator earnings
   */
  private async updateCreatorEarnings(
    creatorId: string,
    workflowId: string,
    distribution: RevenueDistribution
  ): Promise<void> {
    const key = `${creatorId}_${workflowId}`;
    const existing = this.earnings.get(key);
    
    if (existing) {
      existing.totalRevenue += distribution.creatorRevenue;
      existing.totalExecutions += 1;
      existing.averageRevenuePerExecution = existing.totalRevenue / existing.totalExecutions;
      
      // Update monthly earnings
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      if (distribution.distributedAt.getMonth() === currentMonth && 
          distribution.distributedAt.getFullYear() === currentYear) {
        existing.thisMonth += distribution.creatorRevenue;
      }
      
      existing.pendingPayout += distribution.creatorRevenue;
    } else {
      const newEarnings: CreatorEarnings = {
        userId: creatorId,
        workflowId,
        workflowName: `Workflow ${workflowId}`, // Would be fetched from workflow service
        totalRevenue: distribution.creatorRevenue,
        totalExecutions: 1,
        totalUsers: 1,
        thisMonth: distribution.creatorRevenue,
        lastMonth: 0,
        thisYear: distribution.creatorRevenue,
        revenueByDay: [],
        revenueBySource: {},
        averageRevenuePerExecution: distribution.creatorRevenue,
        averageRevenuePerUser: distribution.creatorRevenue,
        conversionRate: 1.0,
        totalPaidOut: 0,
        pendingPayout: distribution.creatorRevenue,
        nextPayoutDate: this.getNextPayoutDate()
      };
      
      this.earnings.set(key, newEarnings);
    }
  }

  /**
   * Check usage quota
   */
  private async checkUsageQuota(userId: string, workflowId: string): Promise<boolean> {
    const key = `${userId}_${workflowId}`;
    const quota = this.quotas.get(key);
    
    if (!quota) {
      // Create new quota
      const pricing = this.pricingConfigs.get(workflowId);
      const newQuota: UsageQuota = {
        userId,
        workflowId,
        currentUsage: 0,
        maxUsage: pricing?.freeUsageLimit || PLATFORM_CONFIG.defaultFreeLimit,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        overageUsage: 0,
        overageRate: 0
      };
      
      this.quotas.set(key, newQuota);
      return true;
    }

    // Check if quota allows execution
    return quota.currentUsage < quota.maxUsage || quota.subscriptionId !== undefined;
  }

  /**
   * Update usage quota
   */
  private async updateUsageQuota(
    userId: string,
    workflowId: string,
    usageAmount: number
  ): Promise<void> {
    const key = `${userId}_${workflowId}`;
    const quota = this.quotas.get(key);
    
    if (quota) {
      quota.currentUsage += usageAmount;
      
      // Handle overage
      if (quota.currentUsage > quota.maxUsage) {
        quota.overageUsage += usageAmount;
      }
    }
  }

  /**
   * Get creator earnings
   */
  getCreatorEarnings(creatorId: string): CreatorEarnings[] {
    return Array.from(this.earnings.values()).filter(
      earning => earning.userId === creatorId
    );
  }

  /**
   * Get creator total earnings
   */
  getCreatorTotalEarnings(creatorId: string): {
    totalRevenue: number;
    totalExecutions: number;
    totalWorkflows: number;
    pendingPayout: number;
    thisMonth: number;
  } {
    const earnings = this.getCreatorEarnings(creatorId);
    
    return {
      totalRevenue: earnings.reduce((sum, e) => sum + e.totalRevenue, 0),
      totalExecutions: earnings.reduce((sum, e) => sum + e.totalExecutions, 0),
      totalWorkflows: earnings.length,
      pendingPayout: earnings.reduce((sum, e) => sum + e.pendingPayout, 0),
      thisMonth: earnings.reduce((sum, e) => sum + e.thisMonth, 0)
    };
  }

  /**
   * Process creator payout
   */
  async processCreatorPayout(
    creatorId: string,
    paymentMethod: string
  ): Promise<Payout> {
    const earnings = this.getCreatorEarnings(creatorId);
    const totalPending = earnings.reduce((sum, e) => sum + e.pendingPayout, 0);
    
    if (totalPending < PLATFORM_CONFIG.minimumPayout) {
      throw new Error(`Minimum payout amount is $${PLATFORM_CONFIG.minimumPayout}`);
    }

    const payout: Payout = {
      id: `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: creatorId,
      amount: totalPending,
      currency: PLATFORM_CONFIG.payoutCurrency,
      status: 'pending',
      createdAt: new Date(),
      paymentMethod,
      executions: [],
      totalExecutions: earnings.reduce((sum, e) => sum + e.totalExecutions, 0),
      grossAmount: totalPending,
      fees: 0,
      netAmount: totalPending,
      retryCount: 0
    };

    // Mock payout processing
    setTimeout(() => {
      payout.status = 'completed';
      payout.processedAt = new Date();
      
      // Reset pending payouts
      earnings.forEach(earning => {
        earning.totalPaidOut += earning.pendingPayout;
        earning.pendingPayout = 0;
        earning.lastPayoutDate = new Date();
        earning.nextPayoutDate = this.getNextPayoutDate();
      });
    }, 3000);

    // Store payout
    const userPayouts = this.payouts.get(creatorId) || [];
    this.payouts.set(creatorId, [...userPayouts, payout]);

    return payout;
  }

  /**
   * Get creator payouts
   */
  getCreatorPayouts(creatorId: string): Payout[] {
    return this.payouts.get(creatorId) || [];
  }

  /**
   * Get next payout date
   */
  private getNextPayoutDate(): Date {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Next Friday
    const daysToFriday = (5 - nextWeek.getDay() + 7) % 7;
    return new Date(nextWeek.getTime() + daysToFriday * 24 * 60 * 60 * 1000);
  }

  /**
   * Get workflow analytics
   */
  getWorkflowAnalytics(workflowId: string): {
    totalRevenue: number;
    totalExecutions: number;
    totalUsers: number;
    averageRevenue: number;
    revenueGrowth: number;
    topUsers: Array<{ userId: string; revenue: number; executions: number }>;
  } {
    const executions = Array.from(this.executions.values())
      .filter(exec => exec.workflowId === workflowId && exec.paid);
    
    const totalRevenue = executions.reduce((sum, exec) => sum + exec.totalCost, 0);
    const totalExecutions = executions.length;
    const uniqueUsers = new Set(executions.map(exec => exec.userId));
    
    const userStats = new Map<string, { revenue: number; executions: number }>();
    executions.forEach(exec => {
      const existing = userStats.get(exec.userId) || { revenue: 0, executions: 0 };
      existing.revenue += exec.totalCost;
      existing.executions += 1;
      userStats.set(exec.userId, existing);
    });

    const topUsers = Array.from(userStats.entries())
      .map(([userId, stats]) => ({ userId, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalRevenue,
      totalExecutions,
      totalUsers: uniqueUsers.size,
      averageRevenue: totalRevenue / Math.max(totalExecutions, 1),
      revenueGrowth: 0, // Would calculate based on historical data
      topUsers
    };
  }
}

// Export singleton
export const monetizationManager = MonetizationManager.getInstance();

// Helper functions
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

export const formatCredits = (credits: number): string => {
  return `${credits.toLocaleString()} credits`;
};

export const creditsToUSD = (credits: number): number => {
  return credits * PLATFORM_CONFIG.creditToDollar;
};

export const usdToCredits = (usd: number): number => {
  return usd * PLATFORM_CONFIG.dollarToCredit;
}; 
 * Monetization System - 50:50 Profit Split
 * 
 * Handles workflow pricing, payments, revenue tracking, and automatic
 * 50:50 profit distribution between creators and the platform.
 */

export interface WorkflowPricing {
  workflowId: string;
  creator: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Pricing model
  model: 'free' | 'pay_per_use' | 'subscription' | 'one_time';
  
  // Pay-per-use pricing
  basePrice: number; // Base price in credits
  perUnitPrice?: number; // Price per unit (e.g., per row, per image)
  unit?: string; // Unit description (e.g., 'row', 'image', 'word')
  
  // Subscription pricing
  monthlyPrice?: number;
  yearlyPrice?: number;
  freeTrialDays?: number;
  
  // One-time purchase
  oneTimePrice?: number;
  
  // Pricing tiers
  tiers?: PricingTier[];
  
  // Free tier limits
  freeUsageLimit?: number;
  freeTierActive: boolean;
  
  // Revenue settings
  platformShare: number; // Platform's share (default 50%)
  creatorShare: number; // Creator's share (default 50%)
}

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  limits: {
    executions?: number;
    dataRows?: number;
    fileSize?: number;
  };
  popular?: boolean;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  userId: string;
  createdAt: Date;
  completedAt?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  
  // Cost calculation
  baseCost: number;
  unitCost: number;
  totalCost: number;
  currency: string;
  
  // Usage metrics
  inputSize?: number;
  outputSize?: number;
  processingTime?: number;
  unitsProcessed?: number;
  
  // Payment info
  paymentId?: string;
  paid: boolean;
  
  // Revenue distribution
  revenueDistribution?: RevenueDistribution;
}

export interface RevenueDistribution {
  executionId: string;
  workflowId: string;
  totalRevenue: number;
  platformRevenue: number;
  creatorRevenue: number;
  processingFees: number;
  netRevenue: number;
  distributedAt: Date;
}

export interface CreatorEarnings {
  userId: string;
  workflowId: string;
  workflowName: string;
  
  // Totals
  totalRevenue: number;
  totalExecutions: number;
  totalUsers: number;
  
  // Time periods
  thisMonth: number;
  lastMonth: number;
  thisYear: number;
  
  // Breakdown
  revenueByDay: Array<{ date: Date; revenue: number; executions: number }>;
  revenueBySource: Record<string, number>;
  
  // Metrics
  averageRevenuePerExecution: number;
  averageRevenuePerUser: number;
  conversionRate: number;
  
  // Payouts
  totalPaidOut: number;
  pendingPayout: number;
  lastPayoutDate?: Date;
  nextPayoutDate?: Date;
}

export interface Payout {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
  
  // Payment details
  paymentMethod: string;
  paymentId?: string;
  
  // Breakdown
  executions: string[];
  totalExecutions: number;
  grossAmount: number;
  fees: number;
  netAmount: number;
  
  // Failure info
  failureReason?: string;
  retryCount: number;
}

export interface UsageQuota {
  userId: string;
  workflowId: string;
  
  // Current usage
  currentUsage: number;
  maxUsage: number;
  resetDate: Date;
  
  // Subscription info
  subscriptionId?: string;
  subscriptionTier?: string;
  
  // Overages
  overageUsage: number;
  overageRate: number;
  
  // Limits
  dailyLimit?: number;
  monthlyLimit?: number;
  rateLimitPerMinute?: number;
}

// Platform configuration
export const PLATFORM_CONFIG = {
  defaultPlatformShare: 0.5, // 50%
  defaultCreatorShare: 0.5, // 50%
  minimumPayout: 25, // $25 minimum payout
  payoutCurrency: 'USD',
  payoutSchedule: 'weekly', // weekly, monthly
  processingFeeRate: 0.029, // 2.9% processing fee
  fixedProcessingFee: 0.30, // $0.30 fixed fee
  
  // Free tier limits
  defaultFreeLimit: 10, // 10 executions per month
  
  // Credit system
  creditToDollar: 0.01, // 1 credit = $0.01
  dollarToCredit: 100, // $1 = 100 credits
};

export class MonetizationManager {
  private static instance: MonetizationManager;
  private pricingConfigs: Map<string, WorkflowPricing> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private earnings: Map<string, CreatorEarnings> = new Map();
  private payouts: Map<string, Payout[]> = new Map();
  private quotas: Map<string, UsageQuota> = new Map();

  static getInstance(): MonetizationManager {
    if (!MonetizationManager.instance) {
      MonetizationManager.instance = new MonetizationManager();
    }
    return MonetizationManager.instance;
  }

  /**
   * Configure workflow pricing
   */
  async configureWorkflowPricing(
    workflowId: string,
    creator: string,
    pricing: Partial<WorkflowPricing>
  ): Promise<WorkflowPricing> {
    const config: WorkflowPricing = {
      workflowId,
      creator,
      createdAt: new Date(),
      updatedAt: new Date(),
      model: pricing.model || 'free',
      basePrice: pricing.basePrice || 0,
      perUnitPrice: pricing.perUnitPrice,
      unit: pricing.unit,
      monthlyPrice: pricing.monthlyPrice,
      yearlyPrice: pricing.yearlyPrice,
      freeTrialDays: pricing.freeTrialDays,
      oneTimePrice: pricing.oneTimePrice,
      tiers: pricing.tiers || [],
      freeUsageLimit: pricing.freeUsageLimit || PLATFORM_CONFIG.defaultFreeLimit,
      freeTierActive: pricing.freeTierActive ?? true,
      platformShare: pricing.platformShare || PLATFORM_CONFIG.defaultPlatformShare,
      creatorShare: pricing.creatorShare || PLATFORM_CONFIG.defaultCreatorShare,
    };

    this.pricingConfigs.set(workflowId, config);
    return config;
  }

  /**
   * Calculate execution cost
   */
  calculateExecutionCost(
    workflowId: string,
    unitsProcessed: number = 1,
    userTier?: string
  ): { baseCost: number; unitCost: number; totalCost: number } {
    const pricing = this.pricingConfigs.get(workflowId);
    if (!pricing) {
      return { baseCost: 0, unitCost: 0, totalCost: 0 };
    }

    if (pricing.model === 'free') {
      return { baseCost: 0, unitCost: 0, totalCost: 0 };
    }

    const baseCost = pricing.basePrice;
    const unitCost = (pricing.perUnitPrice || 0) * unitsProcessed;
    const totalCost = baseCost + unitCost;

    return { baseCost, unitCost, totalCost };
  }

  /**
   * Execute workflow with payment processing
   */
  async executeWorkflow(
    workflowId: string,
    userId: string,
    inputData: any,
    unitsProcessed: number = 1
  ): Promise<WorkflowExecution> {
    const pricing = this.pricingConfigs.get(workflowId);
    if (!pricing) {
      throw new Error('Workflow pricing not configured');
    }

    // Check quota
    const canExecute = await this.checkUsageQuota(userId, workflowId);
    if (!canExecute) {
      throw new Error('Usage quota exceeded');
    }

    // Calculate cost
    const { baseCost, unitCost, totalCost } = this.calculateExecutionCost(
      workflowId,
      unitsProcessed
    );

    // Create execution record
    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      userId,
      createdAt: new Date(),
      status: 'pending',
      baseCost,
      unitCost,
      totalCost,
      currency: 'USD',
      unitsProcessed,
      paid: totalCost === 0, // Free executions are automatically "paid"
    };

    // Process payment if needed
    if (totalCost > 0) {
      const paymentResult = await this.processPayment(userId, totalCost);
      execution.paymentId = paymentResult.paymentId;
      execution.paid = paymentResult.success;
    }

    if (execution.paid) {
      // Update quota
      await this.updateUsageQuota(userId, workflowId, 1);
      
      // Distribute revenue
      if (totalCost > 0) {
        execution.revenueDistribution = await this.distributeRevenue(execution);
      }
    }

    this.executions.set(execution.id, execution);
    return execution;
  }

  /**
   * Process payment
   */
  private async processPayment(
    userId: string,
    amount: number
  ): Promise<{ paymentId: string; success: boolean }> {
    // Mock payment processing
    // In production, this would integrate with Stripe, PayPal, etc.
    
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock 95% success rate
    const success = Math.random() > 0.05;
    
    return { paymentId, success };
  }

  /**
   * Distribute revenue with 50:50 split
   */
  private async distributeRevenue(execution: WorkflowExecution): Promise<RevenueDistribution> {
    const pricing = this.pricingConfigs.get(execution.workflowId);
    if (!pricing) {
      throw new Error('Pricing configuration not found');
    }

    const totalRevenue = execution.totalCost;
    const processingFees = totalRevenue * PLATFORM_CONFIG.processingFeeRate + PLATFORM_CONFIG.fixedProcessingFee;
    const netRevenue = totalRevenue - processingFees;
    
    const platformRevenue = netRevenue * pricing.platformShare;
    const creatorRevenue = netRevenue * pricing.creatorShare;

    const distribution: RevenueDistribution = {
      executionId: execution.id,
      workflowId: execution.workflowId,
      totalRevenue,
      platformRevenue,
      creatorRevenue,
      processingFees,
      netRevenue,
      distributedAt: new Date()
    };

    // Update creator earnings
    await this.updateCreatorEarnings(pricing.creator, execution.workflowId, distribution);

    return distribution;
  }

  /**
   * Update creator earnings
   */
  private async updateCreatorEarnings(
    creatorId: string,
    workflowId: string,
    distribution: RevenueDistribution
  ): Promise<void> {
    const key = `${creatorId}_${workflowId}`;
    const existing = this.earnings.get(key);
    
    if (existing) {
      existing.totalRevenue += distribution.creatorRevenue;
      existing.totalExecutions += 1;
      existing.averageRevenuePerExecution = existing.totalRevenue / existing.totalExecutions;
      
      // Update monthly earnings
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      if (distribution.distributedAt.getMonth() === currentMonth && 
          distribution.distributedAt.getFullYear() === currentYear) {
        existing.thisMonth += distribution.creatorRevenue;
      }
      
      existing.pendingPayout += distribution.creatorRevenue;
    } else {
      const newEarnings: CreatorEarnings = {
        userId: creatorId,
        workflowId,
        workflowName: `Workflow ${workflowId}`, // Would be fetched from workflow service
        totalRevenue: distribution.creatorRevenue,
        totalExecutions: 1,
        totalUsers: 1,
        thisMonth: distribution.creatorRevenue,
        lastMonth: 0,
        thisYear: distribution.creatorRevenue,
        revenueByDay: [],
        revenueBySource: {},
        averageRevenuePerExecution: distribution.creatorRevenue,
        averageRevenuePerUser: distribution.creatorRevenue,
        conversionRate: 1.0,
        totalPaidOut: 0,
        pendingPayout: distribution.creatorRevenue,
        nextPayoutDate: this.getNextPayoutDate()
      };
      
      this.earnings.set(key, newEarnings);
    }
  }

  /**
   * Check usage quota
   */
  private async checkUsageQuota(userId: string, workflowId: string): Promise<boolean> {
    const key = `${userId}_${workflowId}`;
    const quota = this.quotas.get(key);
    
    if (!quota) {
      // Create new quota
      const pricing = this.pricingConfigs.get(workflowId);
      const newQuota: UsageQuota = {
        userId,
        workflowId,
        currentUsage: 0,
        maxUsage: pricing?.freeUsageLimit || PLATFORM_CONFIG.defaultFreeLimit,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        overageUsage: 0,
        overageRate: 0
      };
      
      this.quotas.set(key, newQuota);
      return true;
    }

    // Check if quota allows execution
    return quota.currentUsage < quota.maxUsage || quota.subscriptionId !== undefined;
  }

  /**
   * Update usage quota
   */
  private async updateUsageQuota(
    userId: string,
    workflowId: string,
    usageAmount: number
  ): Promise<void> {
    const key = `${userId}_${workflowId}`;
    const quota = this.quotas.get(key);
    
    if (quota) {
      quota.currentUsage += usageAmount;
      
      // Handle overage
      if (quota.currentUsage > quota.maxUsage) {
        quota.overageUsage += usageAmount;
      }
    }
  }

  /**
   * Get creator earnings
   */
  getCreatorEarnings(creatorId: string): CreatorEarnings[] {
    return Array.from(this.earnings.values()).filter(
      earning => earning.userId === creatorId
    );
  }

  /**
   * Get creator total earnings
   */
  getCreatorTotalEarnings(creatorId: string): {
    totalRevenue: number;
    totalExecutions: number;
    totalWorkflows: number;
    pendingPayout: number;
    thisMonth: number;
  } {
    const earnings = this.getCreatorEarnings(creatorId);
    
    return {
      totalRevenue: earnings.reduce((sum, e) => sum + e.totalRevenue, 0),
      totalExecutions: earnings.reduce((sum, e) => sum + e.totalExecutions, 0),
      totalWorkflows: earnings.length,
      pendingPayout: earnings.reduce((sum, e) => sum + e.pendingPayout, 0),
      thisMonth: earnings.reduce((sum, e) => sum + e.thisMonth, 0)
    };
  }

  /**
   * Process creator payout
   */
  async processCreatorPayout(
    creatorId: string,
    paymentMethod: string
  ): Promise<Payout> {
    const earnings = this.getCreatorEarnings(creatorId);
    const totalPending = earnings.reduce((sum, e) => sum + e.pendingPayout, 0);
    
    if (totalPending < PLATFORM_CONFIG.minimumPayout) {
      throw new Error(`Minimum payout amount is $${PLATFORM_CONFIG.minimumPayout}`);
    }

    const payout: Payout = {
      id: `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: creatorId,
      amount: totalPending,
      currency: PLATFORM_CONFIG.payoutCurrency,
      status: 'pending',
      createdAt: new Date(),
      paymentMethod,
      executions: [],
      totalExecutions: earnings.reduce((sum, e) => sum + e.totalExecutions, 0),
      grossAmount: totalPending,
      fees: 0,
      netAmount: totalPending,
      retryCount: 0
    };

    // Mock payout processing
    setTimeout(() => {
      payout.status = 'completed';
      payout.processedAt = new Date();
      
      // Reset pending payouts
      earnings.forEach(earning => {
        earning.totalPaidOut += earning.pendingPayout;
        earning.pendingPayout = 0;
        earning.lastPayoutDate = new Date();
        earning.nextPayoutDate = this.getNextPayoutDate();
      });
    }, 3000);

    // Store payout
    const userPayouts = this.payouts.get(creatorId) || [];
    this.payouts.set(creatorId, [...userPayouts, payout]);

    return payout;
  }

  /**
   * Get creator payouts
   */
  getCreatorPayouts(creatorId: string): Payout[] {
    return this.payouts.get(creatorId) || [];
  }

  /**
   * Get next payout date
   */
  private getNextPayoutDate(): Date {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Next Friday
    const daysToFriday = (5 - nextWeek.getDay() + 7) % 7;
    return new Date(nextWeek.getTime() + daysToFriday * 24 * 60 * 60 * 1000);
  }

  /**
   * Get workflow analytics
   */
  getWorkflowAnalytics(workflowId: string): {
    totalRevenue: number;
    totalExecutions: number;
    totalUsers: number;
    averageRevenue: number;
    revenueGrowth: number;
    topUsers: Array<{ userId: string; revenue: number; executions: number }>;
  } {
    const executions = Array.from(this.executions.values())
      .filter(exec => exec.workflowId === workflowId && exec.paid);
    
    const totalRevenue = executions.reduce((sum, exec) => sum + exec.totalCost, 0);
    const totalExecutions = executions.length;
    const uniqueUsers = new Set(executions.map(exec => exec.userId));
    
    const userStats = new Map<string, { revenue: number; executions: number }>();
    executions.forEach(exec => {
      const existing = userStats.get(exec.userId) || { revenue: 0, executions: 0 };
      existing.revenue += exec.totalCost;
      existing.executions += 1;
      userStats.set(exec.userId, existing);
    });

    const topUsers = Array.from(userStats.entries())
      .map(([userId, stats]) => ({ userId, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalRevenue,
      totalExecutions,
      totalUsers: uniqueUsers.size,
      averageRevenue: totalRevenue / Math.max(totalExecutions, 1),
      revenueGrowth: 0, // Would calculate based on historical data
      topUsers
    };
  }
}

// Export singleton
export const monetizationManager = MonetizationManager.getInstance();

// Helper functions
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

export const formatCredits = (credits: number): string => {
  return `${credits.toLocaleString()} credits`;
};

export const creditsToUSD = (credits: number): number => {
  return credits * PLATFORM_CONFIG.creditToDollar;
};

export const usdToCredits = (usd: number): number => {
  return usd * PLATFORM_CONFIG.dollarToCredit;
}; 
 
 