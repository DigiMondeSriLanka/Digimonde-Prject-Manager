export const PROJECT_STATUSES = ['Planning', 'Research', 'Development', 'Testing', 'Launch', 'Completed', 'On Hold', 'Cancelled'] as const
export const DM_STATUSES = ['Active', 'Inactive'] as const
export const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'] as const
export const DEV_DEPARTMENTS = ['Web', 'SD', 'Media', 'Other'] as const
export const TASK_DEPARTMENTS = ['Web', 'SD', 'Media', 'Other', 'DM'] as const
export const RISK_LEVELS = ['Low', 'Medium', 'High', 'Critical'] as const
export const TASK_STATUSES = ['Backlog', 'Assigned', 'In Progress', 'Review', 'Testing', 'Completed', 'Blocked'] as const
export const TASK_CATEGORIES = ['Development', 'Design', 'QA', 'DevOps', 'Content', 'Research', 'Management', 'Marketing', 'Other'] as const
export const TASK_HEALTH = ['Completed', 'Overdue', 'Urgent', 'On Track'] as const
export const MEETING_TYPES = ['Daily Standup', 'Sprint Planning', 'Sprint Review', 'Client Meeting', 'Management', 'Investor Update', 'All Hands', 'One-on-One', 'Other'] as const
export const MEETING_STATUSES = ['Open', 'In Progress', 'Completed', 'Cancelled'] as const
export const EMP_DEPARTMENTS = ['Web', 'SD', 'Media', 'DM', 'Management', 'Operations', 'Finance', 'Other'] as const
export const EMPLOYMENT_STATUSES = ['Active', 'On Leave', 'Inactive'] as const
export const WORKLOAD_STATUSES = ['Underutilized', 'Balanced', 'Overloaded'] as const
export const SERVICE_TYPES = ['Web Development', 'Software Development', 'Media Production', 'Digital Marketing', 'Consulting', 'Other'] as const
export const CLIENT_STATUSES = ['Lead', 'Active', 'On Hold', 'Completed', 'Churned'] as const
export const INVOICE_STATUSES = ['Draft', 'Sent', 'Cancelled'] as const
export const PAYMENT_STATUSES = ['Paid', 'Partially Paid', 'Unpaid', 'Overdue', 'Draft', 'Cancelled'] as const
export const EXPENSE_CATEGORIES = ['Salaries', 'Software & Tools', 'Hosting & Infrastructure', 'Marketing', 'Office & Rent', 'Equipment', 'Travel', 'Professional Services', 'Utilities', 'Other'] as const
export const PAYMENT_METHODS = ['Bank Transfer', 'Card', 'Cash', 'Cheque', 'Other'] as const
export const EXPENSE_STATUSES = ['Paid', 'Pending'] as const
export const RISK_CATEGORIES = ['Technical', 'Financial', 'Market', 'Customer', 'Operational', 'Legal', 'Team'] as const
export const RISK_STATUSES = ['Open', 'Monitoring', 'Mitigated', 'Escalated', 'Closed'] as const
export const SEVERITY_LEVELS = ['Low', 'Medium', 'Critical'] as const
export const SCALE_1_5 = ['1', '2', '3', '4', '5'] as const
export const ASSET_CATEGORIES = ['Laptop', 'Desktop', 'Monitor', 'Mobile Device', 'Camera', 'Audio', 'Networking', 'Furniture', 'Software License', 'Subscription', 'Other'] as const
export const BILLING_CYCLES = ['Monthly', 'Quarterly', 'Annual', 'One-time'] as const
export const ASSET_CONDITIONS = ['New', 'Excellent', 'Good', 'Fair', 'Poor', 'Damaged'] as const
export const ASSET_STATUSES = ['Available', 'Assigned', 'Under Repair', 'Retired', 'Lost'] as const
export const WARRANTY_STATUSES = ['Active', 'Expiring Soon', 'Renewing Soon', 'Expired', 'No Warranty', 'No Renewal Date'] as const

export const HEALTH_LABEL: Record<string, string> = {
  Green: 'Healthy',
  Yellow: 'Attention',
  Red: 'At Risk',
  Gray: 'Closed',
}

export type Tone = 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'navy' | 'gray' | 'teal'

// One place that decides the colour of every status-like value ("conditional formatting").
const TONES: Record<string, Tone> = {
  // health & state
  Green: 'green', Healthy: 'green', Completed: 'green', Paid: 'green', Balanced: 'green',
  Active: 'green', Mitigated: 'green', Closed: 'gray', Available: 'green', New: 'green', Excellent: 'green', Good: 'green',
  Yellow: 'yellow', Attention: 'yellow', Medium: 'yellow', 'Partially Paid': 'yellow', Monitoring: 'yellow', Fair: 'yellow', 'Expiring Soon': 'yellow', 'Renewing Soon': 'yellow', Pending: 'yellow',
  Urgent: 'orange', High: 'orange', 'On Hold': 'orange', 'Under Repair': 'orange', Review: 'orange', 'On Leave': 'orange', Poor: 'orange',
  Red: 'red', 'At Risk': 'red', Overdue: 'red', Critical: 'red', Blocked: 'red', Overloaded: 'red', Escalated: 'red',
  Lost: 'red', Damaged: 'red', Expired: 'red', Churned: 'red', Cancelled: 'gray', Unpaid: 'orange',
  // flow
  'In Progress': 'blue', 'On Track': 'blue', Development: 'blue', Testing: 'blue', Launch: 'teal', Assigned: 'blue', Sent: 'blue', Underutilized: 'blue', Lead: 'teal',
  Planning: 'navy', Research: 'navy', Backlog: 'gray', Draft: 'gray', Open: 'navy', Low: 'green',
  Retired: 'gray', Inactive: 'gray', 'No Warranty': 'gray', 'No Renewal Date': 'gray',
}

export function toneFor(value: unknown): Tone {
  return TONES[String(value)] ?? 'gray'
}
