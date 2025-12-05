/**
 * AUTONOMOUS ERROR HANDLER
 * ========================
 * Global error handling system that automatically creates
 * support tickets from errors, integrates with the
 * self-healing system, and tracks error patterns.
 * 
 * CR AudioViz AI, LLC - BarrelVerse
 * Timestamp: 2025-12-05 (Fixed)
 */

import { createClient } from '@supabase/supabase-js'

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

type Severity = 'low' | 'medium' | 'high' | 'critical'

interface ErrorDetails {
  message: string
  stack?: string
  source: string
  url?: string
  userId?: string
  metadata?: Record<string, any>
}

// Recent errors cache for deduplication
const recentErrors: Record<string, number> = {}
const ERROR_DEDUP_WINDOW = 300000 // 5 minutes

export async function reportError(error: Error | string, details: Partial<ErrorDetails> = {}) {
  const supabase = getSupabase()
  
  const errorMessage = typeof error === 'string' ? error : error.message
  const errorStack = typeof error === 'string' ? undefined : error.stack
  
  // Create dedup key
  const dedupKey = `${errorMessage}-${details.source || 'unknown'}`
  const lastReported = recentErrors[dedupKey]
  
  // Skip if reported recently
  if (lastReported && Date.now() - lastReported < ERROR_DEDUP_WINDOW) {
    console.log('[ErrorHandler] Skipping duplicate error:', errorMessage.substring(0, 50))
    return null
  }
  
  // Update dedup cache
  recentErrors[dedupKey] = Date.now()
  
  // Clean old entries (using Object.keys instead of Map.entries)
  Object.keys(recentErrors).forEach(key => {
    if (Date.now() - recentErrors[key] > ERROR_DEDUP_WINDOW) {
      delete recentErrors[key]
    }
  })
  
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
    
    // For critical errors, queue investigation
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

export async function reportUserError(message: string, userId?: string, context?: Record<string, any>) {
  return reportError(message, { source: 'user-facing', userId, metadata: context })
}

export async function reportApiError(endpoint: string, error: Error | string, request?: { method?: string; body?: any }) {
  return reportError(error, {
    source: 'api',
    url: endpoint,
    metadata: { method: request?.method, bodyPreview: request?.body ? JSON.stringify(request.body).substring(0, 500) : undefined }
  })
}

export async function reportCronError(jobName: string, error: Error | string) {
  return reportError(error, { source: 'cron', metadata: { job: jobName } })
}

function classifySeverity(message: string, stack?: string): Severity {
  const msg = message.toLowerCase()
  
  if (msg.includes('database') || msg.includes('supabase') || msg.includes('stripe') || 
      msg.includes('payment') || msg.includes('authentication failed') || msg.includes('fatal')) {
    return 'critical'
  }
  
  if (msg.includes('api') || msg.includes('fetch failed') || msg.includes('500') || msg.includes('corrupt')) {
    return 'high'
  }
  
  if (msg.includes('validation') || msg.includes('parse') || msg.includes('invalid') || msg.includes('not found')) {
    return 'medium'
  }
  
  return 'low'
}

function formatErrorDescription(message: string, stack?: string, details?: Partial<ErrorDetails>): string {
  let desc = `**Error:** ${message}\n\n`
  if (details?.url) desc += `**URL:** ${details.url}\n\n`
  if (details?.source) desc += `**Source:** ${details.source}\n\n`
  if (stack) desc += `**Stack Trace:**\n\`\`\`\n${stack.substring(0, 1000)}\n\`\`\`\n\n`
  if (details?.metadata) desc += `**Additional Context:**\n${JSON.stringify(details.metadata, null, 2)}`
  return desc
}

async function queueInvestigation(ticketId: string, errorMessage: string, details: Partial<ErrorDetails>) {
  const supabase = getSupabase()
  await supabase.from('bv_ai_tasks').insert({
    task_type: 'investigation',
    task_name: `Investigate: ${truncate(errorMessage, 50)}`,
    parameters: { ticket_id: ticketId, error_message: errorMessage, source: details.source, url: details.url },
    priority: 1,
    status: 'queued'
  })
}

async function recordErrorMetric(severity: Severity, source?: string) {
  const supabase = getSupabase()
  await supabase.from('bv_growth_metrics').insert({
    metric_type: `errors_${severity}`,
    metric_value: 1,
    metric_details: { source }
  }).catch(() => {})
}

function truncate(str: string, length: number): string {
  return str.length <= length ? str : str.substring(0, length - 3) + '...'
}

export function handleBoundaryError(error: Error, errorInfo: { componentStack: string }) {
  reportError(error, { source: 'react-boundary', metadata: { componentStack: errorInfo.componentStack.substring(0, 500) } })
}

export function withErrorHandler<T>(handler: () => Promise<T>, context: { source: string; url?: string }): Promise<T> {
  return handler().catch(async (error) => { await reportError(error, context); throw error })
}

export default { reportError, reportUserError, reportApiError, reportCronError, handleBoundaryError, withErrorHandler }
