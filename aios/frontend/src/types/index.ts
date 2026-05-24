export type Mode =
  | 'daily'
  | 'graph'
  | 'engineering'
  | 'agents'
  | 'workflows'
  | 'files'
  | 'timeline'

export type NodeType =
  | 'project'
  | 'task'
  | 'file'
  | 'decision'
  | 'failure'
  | 'person'
  | 'company'
  | 'memory'
  | 'agent'
  | 'workflow'

export type Status =
  | 'active'
  | 'pending'
  | 'in_progress'
  | 'blocked'
  | 'done'
  | 'completed'
  | 'failed'
  | 'paused'
  | 'archived'
  | 'idle'
  | 'running'

export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface Project {
  id: string
  name: string
  type: string
  status: Status
  phase?: string
  description?: string
  summary?: string
  goal?: string
  color: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  project_id?: string
  title: string
  description?: string
  status: Status
  priority: Priority
  due_date?: string
  completed_at?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface Memory {
  id: string
  user_id: string
  project_id?: string
  memory_type: string
  title: string
  content: string
  summary?: string
  source?: string
  importance: number
  is_private: boolean
  linked_entities?: Array<{ type: string; id: string; name: string }>
  created_at: string
  updated_at: string
}

export interface Decision {
  id: string
  user_id: string
  project_id?: string
  title: string
  description: string
  rationale?: string
  alternatives?: string
  outcome?: string
  outcome_assessment?: string
  decided_at: string
}

export interface Failure {
  id: string
  user_id: string
  project_id?: string
  title: string
  description: string
  root_cause?: string
  fix_applied?: string
  lesson_learned?: string
  severity: string
  is_resolved: boolean
  occurred_at: string
}

export interface FileRecord {
  id: string
  filename: string
  file_type?: string
  file_size_bytes?: number
  project_id?: string
  version: number
  is_latest: boolean
  created_at: string
}

export interface AgentInfo {
  id: string
  name: string
  agent_type: string
  status: string
  performance_score: number
}

export interface AgentRun {
  id: string
  agent_id: string
  task_description: string
  status: string
  started_at?: string
  completed_at?: string
  result?: string
  error?: string
  tool_calls_count: number
}

export interface Workflow {
  id: string
  name: string
  description?: string
  trigger_type?: string
  is_active: boolean
}

export interface WorkflowRun {
  id: string
  workflow_id: string
  status: string
  current_step: number
  started_at?: string
  completed_at?: string
  error?: string
  retry_count: number
}

export interface Approval {
  id: string
  user_id: string
  action_type: string
  description: string
  payload: Record<string, unknown>
  status: string
  created_at: string
  resolved_at?: string
}

export interface Notification {
  id: string
  type: string
  title: string
  body?: string
  priority: string
  is_read: boolean
  created_at: string
}

export interface GraphNode {
  id: string
  type: NodeType
  label: string
  data: Record<string, unknown>
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label: string
  data: Record<string, unknown>
}

export interface SearchResult {
  type: string
  id: string
  title: string
  summary?: string
  status?: string
}

export interface InspectorItem {
  id: string
  nodeType: NodeType
  title: string
  status?: string
  summary?: string
  data?: Record<string, unknown>
}
