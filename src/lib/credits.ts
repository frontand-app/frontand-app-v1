import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  credits_balance: number;
  tier: 'free' | 'pro' | 'enterprise';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'purchase' | 'execution' | 'refund' | 'bonus';
  reference_id?: string;
  description: string;
  created_at: string;
}

export interface WorkflowExecution {
  id: string;
  flow_id: string;
  user_id: string;
  inputs: any;
  outputs?: any;
  model_used?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  credits_used: number;
  execution_time_ms?: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface WorkflowCost {
  base_cost: number;
  per_input_cost: number;
  per_output_cost: number;
  model_multiplier: number;
}

// Workflow ID mapping for easier reference
export const WORKFLOW_IDS = {
  'loop-over-rows': '550e8400-e29b-41d4-a716-446655440001',
  'cluster-keywords': '550e8400-e29b-41d4-a716-446655440002'
} as const;

// Workflow pricing configuration
export const WORKFLOW_PRICING: Record<string, WorkflowCost> = {
  [WORKFLOW_IDS['loop-over-rows']]: {
    base_cost: 0.05, // Small base cost for setup
    per_input_cost: 0.01, // 1 cent per row of data
    per_output_cost: 0.005, // Small output cost
    model_multiplier: 1.5 // Gemini 2.5-Flash multiplier
  },
  [WORKFLOW_IDS['cluster-keywords']]: {
    base_cost: 0.1,
    per_input_cost: 0.001,
    per_output_cost: 0.002,
    model_multiplier: 1.0
  },
  'sentiment-analysis': {
    base_cost: 0.05,
    per_input_cost: 0.0005,
    per_output_cost: 0.001,
    model_multiplier: 1.0
  },
  'google-sheets-processor': {
    base_cost: 0.2,
    per_input_cost: 0.01,
    per_output_cost: 0.005,
    model_multiplier: 1.5
  },
  'data-enrichment': {
    base_cost: 0.15,
    per_input_cost: 0.005,
    per_output_cost: 0.003,
    model_multiplier: 1.2
  }
};

export class CreditsService {
  /**
   * Get or create user profile
   */
  static async getUserProfile(user: User): Promise<UserProfile | null> {
    try {
      // First try to get existing profile
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile && !fetchError) {
        return profile;
      }

      // If profile doesn't exist, create it
      const newProfile = {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        credits_balance: 100.0, // Give new users 100 free credits
        tier: 'free' as const,
        is_verified: user.email_confirmed_at !== null,
      };

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return null;
      }

      // Add welcome bonus transaction
      await this.addCreditTransaction(
        user.id,
        100.0,
        'bonus',
        'Welcome bonus for new users'
      );

      return createdProfile;
    } catch (error) {
      console.error('Error getting/creating user profile:', error);
      return null;
    }
  }

  /**
   * Get user's current credit balance
   */
  static async getCreditBalance(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits_balance')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching credit balance:', error);
        return 0;
      }

      return data?.credits_balance || 0;
    } catch (error) {
      console.error('Error getting credit balance:', error);
      return 0;
    }
  }

  /**
   * Calculate workflow execution cost
   */
  static calculateWorkflowCost(
    workflowId: string,
    inputData: any,
    modelUsed: string = 'default'
  ): number {
    const pricing = WORKFLOW_PRICING[workflowId];
    if (!pricing) {
      console.warn(`No pricing found for workflow: ${workflowId}`);
      return 0.1; // Default cost
    }

    let cost = pricing.base_cost;

    // Special handling for loop-over-rows: cost based on number of data rows
    if (workflowId === WORKFLOW_IDS['loop-over-rows'] && inputData?.data) {
      const numRows = Object.keys(inputData.data).length;
      cost += numRows * pricing.per_input_cost; // Cost per row
    } else if (inputData) {
      // Default: calculate input-based costs by size
      const inputSize = JSON.stringify(inputData).length;
      const inputUnits = Math.ceil(inputSize / 1000); // 1 unit per 1KB
      cost += inputUnits * pricing.per_input_cost;
    }

    // Apply model multiplier
    const modelMultipliers: Record<string, number> = {
      'gpt-4': 2.0,
      'gpt-3.5-turbo': 1.0,
      'claude-3': 1.8,
      'llama-3': 0.8,
      'gemini-2.5-flash': 1.5,
      'default': 1.0
    };

    const multiplier = modelMultipliers[modelUsed] || 1.0;
    cost *= multiplier * pricing.model_multiplier;

    return Math.round(cost * 10000) / 10000; // Round to 4 decimal places
  }

  /**
   * Check if user has sufficient credits for workflow
   */
  static async canExecuteWorkflow(
    userId: string,
    workflowId: string,
    inputData: any,
    modelUsed?: string
  ): Promise<{ canExecute: boolean; cost: number; balance: number }> {
    const balance = await this.getCreditBalance(userId);
    const cost = this.calculateWorkflowCost(workflowId, inputData, modelUsed);

    return {
      canExecute: balance >= cost,
      cost,
      balance
    };
  }

  /**
   * Deduct credits for workflow execution
   */
  static async deductCredits(
    userId: string,
    amount: number,
    executionId: string,
    description: string
  ): Promise<boolean> {
    try {
      // Use Supabase function for atomic credit deduction
      const { data, error } = await supabase.rpc('deduct_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_reference_id: executionId,
        p_description: description
      });

      if (error) {
        console.error('Error deducting credits:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error deducting credits:', error);
      return false;
    }
  }

  /**
   * Add credit transaction record
   */
  static async addCreditTransaction(
    userId: string,
    amount: number,
    type: CreditTransaction['transaction_type'],
    description: string,
    referenceId?: string
  ): Promise<CreditTransaction | null> {
    try {
      const transaction = {
        user_id: userId,
        amount,
        transaction_type: type,
        reference_id: referenceId,
        description
      };

      const { data, error } = await supabase
        .from('credit_transactions')
        .insert(transaction)
        .select()
        .single();

      if (error) {
        console.error('Error adding credit transaction:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error adding credit transaction:', error);
      return null;
    }
  }

  /**
   * Get user's credit transaction history
   */
  static async getCreditHistory(
    userId: string,
    limit: number = 50
  ): Promise<CreditTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching credit history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting credit history:', error);
      return [];
    }
  }

  /**
   * Create workflow execution record
   */
  static async createExecution(
    flowId: string,
    userId: string,
    inputs: any,
    modelUsed?: string
  ): Promise<WorkflowExecution | null> {
    try {
      const execution = {
        flow_id: flowId,
        user_id: userId,
        inputs,
        model_used: modelUsed,
        status: 'pending' as const,
        credits_used: this.calculateWorkflowCost(flowId, inputs, modelUsed)
      };

      const { data, error } = await supabase
        .from('executions')
        .insert(execution)
        .select()
        .single();

      if (error) {
        console.error('Error creating execution:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating execution:', error);
      return null;
    }
  }

  /**
   * Update workflow execution with results
   */
  static async updateExecution(
    executionId: string,
    updates: Partial<WorkflowExecution>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('executions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', executionId);

      if (error) {
        console.error('Error updating execution:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating execution:', error);
      return false;
    }
  }

  /**
   * Execute workflow with proper credit management
   */
  static async executeWorkflow(
    workflowId: string,
    userId: string,
    inputs: any,
    modelUsed?: string
  ): Promise<{
    success: boolean;
    execution?: WorkflowExecution;
    error?: string;
  }> {
    try {
      // Check if user can execute workflow
      const { canExecute, cost, balance } = await this.canExecuteWorkflow(
        userId,
        workflowId,
        inputs,
        modelUsed
      );

      if (!canExecute) {
        return {
          success: false,
          error: `Insufficient credits. Required: ${cost}, Available: ${balance}`
        };
      }

      // Create execution record
      const execution = await this.createExecution(workflowId, userId, inputs, modelUsed);
      if (!execution) {
        return {
          success: false,
          error: 'Failed to create execution record'
        };
      }

      // Deduct credits
      const deducted = await this.deductCredits(
        userId,
        cost,
        execution.id,
        `Workflow execution: ${workflowId}`
      );

      if (!deducted) {
        // Mark execution as failed
        await this.updateExecution(execution.id, {
          status: 'failed',
          error_message: 'Failed to deduct credits'
        });

        return {
          success: false,
          error: 'Failed to deduct credits'
        };
      }

      return {
        success: true,
        execution
      };
    } catch (error) {
      console.error('Error executing workflow:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }

  /**
   * Get user's workflow execution history
   */
  static async getExecutionHistory(
    userId: string,
    limit: number = 20
  ): Promise<WorkflowExecution[]> {
    try {
      const { data, error } = await supabase
        .from('executions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching execution history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting execution history:', error);
      return [];
    }
  }
} 
