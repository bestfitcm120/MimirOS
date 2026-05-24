import { useState } from 'react'
import { motion } from 'framer-motion'
import { GitBranch, CheckCircle, XCircle, Clock, AlertTriangle, Play, Plus, ChevronRight, RefreshCw } from 'lucide-react'
import { mockWorkflowRuns } from '@/data/mockData'

interface WorkflowDef {
  id: string
  name: string
  description: string
  trigger: string
  steps: { label: string; type: 'action' | 'approval' | 'condition' | 'delay' }[]
  lastRun?: string
  successRate: number
}

const WORKFLOWS: WorkflowDef[] = [
  {
    id: 'wf1',
    name: 'File Ingestion',
    description: 'Auto-process uploaded files: extract, chunk, embed, link to project',
    trigger: 'On file upload',
    steps: [
      { label: 'Extract text content', type: 'action' },
      { label: 'Classify file type', type: 'action' },
      { label: 'Generate summary', type: 'action' },
      { label: 'Chunk + embed', type: 'action' },
      { label: 'Link to project', type: 'action' },
      { label: 'Update memory graph', type: 'action' },
    ],
    lastRun: new Date(Date.now() - 300000).toISOString(),
    successRate: 0.97,
  },
  {
    id: 'wf2',
    name: 'Follow-up Sequence',
    description: 'Draft and send follow-up emails with approval gate and response tracking',
    trigger: 'On follow-up task due',
    steps: [
      { label: 'Read person context', type: 'action' },
      { label: 'Draft message', type: 'action' },
      { label: 'Human approval', type: 'approval' },
      { label: 'Send message', type: 'action' },
      { label: 'Wait 72 hours', type: 'delay' },
      { label: 'Check response', type: 'condition' },
      { label: 'Update status', type: 'action' },
    ],
    lastRun: new Date(Date.now() - 900000).toISOString(),
    successRate: 0.85,
  },
  {
    id: 'wf3',
    name: 'Daily Briefing',
    description: 'Every morning: compile tasks, deadlines, and generate AI briefing',
    trigger: 'Daily at 06:00',
    steps: [
      { label: 'Fetch tasks + deadlines', type: 'action' },
      { label: 'Fetch calendar events', type: 'action' },
      { label: 'Fetch agent activity', type: 'action' },
      { label: 'Generate briefing', type: 'action' },
      { label: 'Push notification', type: 'action' },
    ],
    lastRun: new Date(Date.now() - 3600000 * 6).toISOString(),
    successRate: 1.0,
  },
  {
    id: 'wf4',
    name: 'Engineering Report',
    description: 'Collect project files, draft LaTeX report, request review, export PDF',
    trigger: 'Manual trigger',
    steps: [
      { label: 'Collect project files', type: 'action' },
      { label: 'Summarize requirements', type: 'action' },
      { label: 'Identify missing sections', type: 'action' },
      { label: 'Draft report sections', type: 'action' },
      { label: 'Human review', type: 'approval' },
      { label: 'Compile LaTeX PDF', type: 'action' },
      { label: 'Store in project files', type: 'action' },
    ],
    successRate: 0.78,
  },
]

const STEP_COLORS = {
  action: 'bg-info/10 border-info/30 text-info',
  approval: 'bg-warning/10 border-warning/30 text-warning',
  condition: 'bg-agent/10 border-agent/30 text-agent',
  delay: 'bg-text-dim/10 border-border text-text-dim',
}

function WorkflowCard({ wf, run, onSelect, selected }: {
  wf: WorkflowDef
  run?: typeof mockWorkflowRuns[0]
  onSelect: () => void
  selected: boolean
}) {
  const statusColor = run?.status === 'running' ? 'border-success/30' : run?.status === 'waiting_approval' ? 'border-warning/30' : run?.status === 'failed' ? 'border-danger/30' : 'border-border'

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left panel p-3 hover:border-border-bright transition-all ${selected ? 'border-accent/40 bg-accent/5' : statusColor}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <GitBranch size={14} className={selected ? 'text-accent' : 'text-text-dim'} />
          <div>
            <p className="text-sm font-medium text-text-primary">{wf.name}</p>
            <p className="text-2xs text-text-dim mt-0.5">{wf.trigger}</p>
          </div>
        </div>
        {run && (
          <span className={`tag border text-2xs flex-shrink-0 ${
            run.status === 'running' ? 'text-success bg-success/10 border-success/20' :
            run.status === 'waiting_approval' ? 'text-warning bg-warning/10 border-warning/20' :
            run.status === 'completed' ? 'text-text-dim bg-elevated border-border' :
            'text-danger bg-danger/10 border-danger/20'
          }`}>
            {run.status.replace('_', ' ')}
          </span>
        )}
      </div>

      {run && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-2xs text-text-dim mb-1">
            <span>Step {run.current_step}/{wf.steps.length}</span>
            <span>{wf.steps[run.current_step]?.label}</span>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(run.current_step / wf.steps.length) * 100}%` }}
              className={`h-full rounded-full ${run.status === 'waiting_approval' ? 'bg-warning' : 'bg-success'}`}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mt-2 text-2xs text-text-dim">
        <span>{wf.steps.length} steps</span>
        <span>{Math.round(wf.successRate * 100)}% success</span>
        {wf.lastRun && <span>Last: {new Date(wf.lastRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
      </div>
    </button>
  )
}

export default function WorkflowView() {
  const [selectedWf, setSelectedWf] = useState<WorkflowDef>(WORKFLOWS[0])

  const getRunForWf = (wfId: string) => mockWorkflowRuns.find(r => r.workflow_id === wfId)

  return (
    <div className="h-full flex">
      {/* Left — workflow list */}
      <div className="w-72 flex-shrink-0 border-r border-border bg-surface overflow-y-auto scrollbar-thin p-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-text-primary">Workflows</h2>
          <button className="btn-primary text-xs px-2 py-1">
            <Plus size={12} /> New
          </button>
        </div>
        <div className="space-y-2">
          {WORKFLOWS.map(wf => (
            <WorkflowCard
              key={wf.id}
              wf={wf}
              run={getRunForWf(wf.id)}
              onSelect={() => setSelectedWf(wf)}
              selected={selectedWf.id === wf.id}
            />
          ))}
        </div>
      </div>

      {/* Right — workflow detail */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-base font-semibold text-text-primary">{selectedWf.name}</h2>
            <p className="text-xs text-text-secondary mt-0.5">{selectedWf.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost text-xs"><RefreshCw size={12} /> Reset</button>
            <button className="btn-primary text-xs"><Play size={12} /> Run Now</button>
          </div>
        </div>

        {/* Step visualizer */}
        <div className="panel p-4 mb-4">
          <h3 className="text-xs font-semibold text-text-secondary mb-3">Steps</h3>
          <div className="space-y-2">
            {selectedWf.steps.map((step, i) => {
              const run = getRunForWf(selectedWf.id)
              const isDone = run && i < run.current_step
              const isCurrent = run && i === run.current_step
              const isApprovalWaiting = isCurrent && run.status === 'waiting_approval'

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 border ${
                    isDone ? 'bg-success/10 border-success/30 text-success' :
                    isApprovalWaiting ? 'bg-warning/10 border-warning/30 text-warning' :
                    isCurrent ? 'bg-info/10 border-info/30 text-info' :
                    'bg-elevated border-border text-text-dim'
                  }`}>
                    {isDone ? <CheckCircle size={12} /> : isCurrent ? <Clock size={12} className="animate-spin" style={{ animationDuration: '2s' }} /> : i + 1}
                  </div>

                  <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${
                    isDone ? 'border-success/20 bg-success/5 text-success' :
                    isApprovalWaiting ? 'border-warning/20 bg-warning/5 text-warning' :
                    isCurrent ? 'border-info/20 bg-info/5 text-info' :
                    `${STEP_COLORS[step.type]} border`
                  }`}>
                    <span className="font-medium">{step.label}</span>
                    <span className={`ml-auto text-2xs px-1.5 py-0.5 rounded ${STEP_COLORS[step.type]} border`}>
                      {step.type}
                    </span>
                  </div>

                  {i < selectedWf.steps.length - 1 && (
                    <ChevronRight size={12} className="text-border flex-shrink-0" />
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Approval gate (if waiting) */}
        {getRunForWf(selectedWf.id)?.status === 'waiting_approval' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel border-warning/30 p-4 mb-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-warning" />
              <h3 className="text-sm font-semibold text-warning">Approval Required</h3>
            </div>
            <p className="text-xs text-text-secondary mb-3">
              The workflow is waiting for your approval to proceed to the next step: <strong>Send message</strong>
            </p>
            <div className="p-3 bg-base/50 rounded border border-border text-xs text-text-secondary font-mono mb-3">
              To: hr@novatech.com<br />
              Subject: Following up on Mechanical Engineer application<br />
              <br />
              Dear Hiring Team, I wanted to follow up on my application submitted 2 weeks ago...
            </div>
            <div className="flex gap-2">
              <button className="btn-primary flex-1 justify-center text-xs">
                <CheckCircle size={12} /> Approve & Send
              </button>
              <button className="btn-danger flex-1 justify-center text-xs">
                <XCircle size={12} /> Reject
              </button>
            </div>
          </motion.div>
        )}

        {/* Run history */}
        <div className="panel p-4">
          <h3 className="text-xs font-semibold text-text-secondary mb-3">Run History</h3>
          {mockWorkflowRuns.filter(r => r.workflow_id === selectedWf.id).length > 0 ? (
            mockWorkflowRuns.filter(r => r.workflow_id === selectedWf.id).map(r => (
              <div key={r.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                <div className={`status-dot ${r.status === 'completed' ? 'bg-success' : r.status === 'failed' ? 'bg-danger' : 'bg-warning'}`} />
                <span className="text-xs text-text-secondary">{r.status.replace('_', ' ')}</span>
                <span className="text-2xs text-text-dim ml-auto">Step {r.current_step}/{selectedWf.steps.length}</span>
                {r.started_at && <span className="text-2xs text-text-dim">{new Date(r.started_at).toLocaleTimeString()}</span>}
              </div>
            ))
          ) : (
            <p className="text-sm text-text-dim">No runs yet. Click Run Now to start.</p>
          )}
        </div>
      </div>
    </div>
  )
}
