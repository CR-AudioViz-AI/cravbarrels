/**
 * AUTONOMOUS ERROR HANDLER
 * ========================
 * Global error handling system that automatically creates
 * support tickets from errors, integrates with the
 * self-healing system, and tracks error patterns.
 * 
 * Features:
 * - Automatic ticket creation for errors
 * - Error deduplication (prevents spam)
 * - Severity classification
 * - Pattern detection
 * - Integration with AI task queue for auto-fixes
 * 
 * CR AudioViz AI, LLC - BarrelVerse
 * Timestamp: 2025-12-05
 */

import { createClient } from '@supabase/supabase-js'

// Singleton Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabaseInstance
}

// Error severity classification
type Severity = 'low' | 'medium' | 'high' | 'critical'

interface ErrorDetails {
  message: string
  stack?: string
  source: string
  url?: string
  userId?: string
  metadata?: Record<string, any>
}

// Recent errors cache for deduplication (in-memory)
const recentErrors = new Map<string, number>()
const ERROR_DEDUP_WINDOW = 300000 // 5 minutes

/**
 * Report an error to the autonomous system
 * Creates a ticket and optionally queues an auto-fix task
 */
export async function reportError(error: Error | string, details: Partial<ErrorDetails> = {}) {
  const supabase = getSupabase()
  
  const errorMessage = typeof error === 'string' ? error : error.message
  const errorStack = typeof error === 'string' ? undefined : error.stack
  
  // Create dedup key
  const dedupKey = `${errorMessage}-${details.source || 'unknown'}`
  const lastReported = recentErrors.get(dedupKey)
  
  // Skip if reported recently
  if (lastReported && Date.now() - lastReported < ERROR_DEDUP_WINDOW) {
    console.log('[ErrorHandler] Skipping duplicate error:', errorMessage.substring(0, 50))
    return null
  }
  
  // Update dedup cache
  recentErrors.set(dedupKey, Date.now())
  
  // Clean old entries
  for (const [key, time] of recentErrors.entries()) {
    if (Date.now() - time > ERROR_DEDUP_WINDOW) {
      recentErrors.delete(key)
    }
  }
  
  // Classify severity
  const severity = classifySeverity(errorMessage, errorStack)
  
  // Create ticket
  const ticket = {
    ticket_type: 'error',
    title: truncate(errorMessage, 200),
    description: formatErrorDescription(errorMessage, errorStack, details),
    source: details.source || 'application',
    severity,
    auto_generated: true,
    error_details: {
      message: errorMessage,
      stack: errorStack,
      url: details.url,
      metadata: details.metadata,
      timestamp: new Date().toISOString()
    },
    user_id: details.userId || null
  }
  
  try {
    const { data, error: insertError } = await supabase
      .from('bv_auto_tickets')
      .insert(ticket)
      .select()
      .single()
    
    if (insertError) {
      console.error('[ErrorHandler] Failed to create ticket:', insertError)
      return null
    }
    
    console.log(`[ErrorHandler] Created ticket ${data.id} - Severity: ${severity}`)
    
    // For critical errors, queue an immediate investigation task
    if (severity === 'critical') {
      await queueInvestigation(data.id, errorMessage, details)
    }
    
    // Record error metric
    await recordErrorMetric(severity, details.source)
    
    return data
  } catch (e) {
    console.error('[ErrorHandler] Error in error handler:', e)
    return null
  }
}

/**
 * Report a user-facing error (gentler handling)
 */
export async function reportUserError(
  message: string, 
  userId?: string, 
  context?: Record<string, any>
) {
  return reportError(message, {
    source: 'user-facing',
    userId,
    metadata: context
  })
}

/**
 * Report an API error
 */
export async function reportApiError(
  endpoint: string,
  error: Error | string,
  request?: { method?: string; body?: any }
) {
  return reportError(error, {
    source: 'api',
    url: endpoint,
    metadata: {
      method: request?.method,
      bodyPreview: request?.body ? JSON.stringify(request.body).substring(0, 500) : undefined
    }
  })
}

/**
 * Report a cron job error
 */
export async function reportCronError(jobName: string, error: Error | string) {
  return reportError(error, {
    source: 'cron',
    metadata: { job: jobName }
  })
}

// Helper: Classify error severity
function classifySeverity(message: string, stack?: string): Severity {
  const msg = message.toLowerCase()
  const stk = (stack || '').toLowerCase()
  
  // Critical: Database, auth, payment issues
  if (
    msg.includes('database') ||
    msg.includes('supabase') ||
    msg.includes('postgres') ||
    msg.includes('stripe') ||
    msg.includes('payment') ||
    msg.includes('authentication failed') ||
    msg.includes('out of memory') ||
    msg.includes('fatal')
  ) {
    return 'critical'
  }
  
  // High: API failures, data corruption
  if (
    msg.includes('api') ||
    msg.includes('fetch failed') ||
    msg.includes('500') ||
    msg.includes('corrupt') ||
    msg.includes('invalid data')
  ) {
    return 'high'
  }
  
  // Medium: Validation, parsing issues
  if (
    msg.includes('validation') ||
    msg.includes('parse') ||
    msg.includes('invalid') ||
    msg.includes('not found')
  ) {
    return 'medium'
  }
  
  // Default to low
  return 'low'
}

// Helper: Format error description
function formatErrorDescription(
  message: string, 
  stack?: string, 
  details?: Partial<ErrorDetails>
): string {
  let desc = `**Error:** ${message}\n\n`
  
  if (details?.url) {
    desc += `**URL:** ${details.url}\n\n`
  }
  
  if (details?.source) {
    desc += `**Source:** ${details.source}\n\n`
  }
  
  if (stack) {
    desc += `**Stack Trace:**\n\`\`\`\n${stack.substring(0, 1000)}\n\`\`\`\n\n`
  }
  
  if (details?.metadata) {
    desc += `**Additional Context:**\n${JSON.stringify(details.metadata, null, 2)}`
  }
  
  return desc
}

// Helper: Queue investigation for critical errors
async function queueInvestigation(ticketId: string, errorMessage: string, details: Partial<ErrorDetails>) {
  const supabase = getSupabase()
  
  await supabase
    .from('bv_ai_tasks')
    .insert({
      task_type: 'investigation',
      task_name: `Investigate critical error: ${truncate(errorMessage, 50)}`,
      parameters: {
        ticket_id: ticketId,
        error_message: errorMessage,
        source: details.source,
        url: details.url
      },
      priority: 1, // Highest priority
      status: 'queued'
    })
}

// Helper: Record error metric
async function recordErrorMetric(severity: Severity, source?: string) {
  const supabase = getSupabase()
  
  await supabase
    .from('bv_growth_metrics')
    .insert({
      metric_type: `errors_${severity}`,
      metric_value: 1,
      metric_details: { source }
    })
    .catch(() => {}) // Don't fail if metrics recording fails
}

// Helper: Truncate string
function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.substring(0, length - 3) + '...'
}

/**
 * React Error Boundary helper
 * Use in error boundaries to report caught errors
 */
export function handleBoundaryError(error: Error, errorInfo: { componentStack: string }) {
  reportError(error, {
    source: 'react-boundary',
    metadata: {
      componentStack: errorInfo.componentStack.substring(0, 500)
    }
  })
}

/**
 * API Route wrapper for automatic error handling
 */
export function withErrorHandler<T>(
  handler: () => Promise<T>,
  context: { source: string; url?: string }
): Promise<T> {
  return handler().catch(async (error) => {
    await reportError(error, context)
    throw error
  })
}

export default {
  reportError,
  reportUserError,
  reportApiError,
  reportCronError,
  handleBoundaryError,
  withErrorHandler
}
