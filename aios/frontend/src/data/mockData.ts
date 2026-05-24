import type { Project, Task, Decision, Failure, FileRecord, AgentInfo, AgentRun, WorkflowRun, Notification, GraphNode, GraphEdge } from '@/types'

export const DEMO_USER_ID = 'demo-user-id'

export const mockProjects: Project[] = [
  { id: 'p1', name: 'Garden Guardian', type: 'engineering', status: 'active', phase: 'Prototype v2', description: 'Automated plant irrigation using Arduino + soil sensors', summary: 'Arduino-based irrigation system with I2C soil sensors, PWM motor control, and mobile monitoring.', goal: 'Fully automated garden irrigation with remote monitoring', color: '#22c55e', user_id: DEMO_USER_ID, created_at: '2025-01-10T10:00:00Z', updated_at: '2025-05-20T14:30:00Z' },
  { id: 'p2', name: 'Thermodynamics Assignment', type: 'course', status: 'active', phase: 'Report Writing', description: 'Heat transfer analysis of a shell-and-tube heat exchanger', summary: 'MECH301 assignment on thermal analysis. Report due today.', goal: 'Submit complete thermodynamic analysis report', color: '#f59e0b', user_id: DEMO_USER_ID, created_at: '2025-05-01T08:00:00Z', updated_at: '2025-05-22T20:00:00Z' },
  { id: 'p3', name: 'Job Search — Mechanical Engineering', type: 'job_application', status: 'active', phase: 'Active Applications', description: 'Tracking engineering job applications', summary: '6 active applications. 2 awaiting response, 1 interview scheduled.', goal: 'Secure a graduate engineering position by Q3', color: '#3b82f6', user_id: DEMO_USER_ID, created_at: '2025-03-01T09:00:00Z', updated_at: '2025-05-21T11:00:00Z' },
  { id: 'p4', name: 'Irrigation Controller v3', type: 'engineering', status: 'paused', phase: 'Design', description: 'Next generation irrigation controller with ESP32 and cloud sync', summary: 'Paused — focusing on Garden Guardian v2 first.', goal: 'Cloud-connected irrigation with API', color: '#06b6d4', user_id: DEMO_USER_ID, created_at: '2025-04-15T10:00:00Z', updated_at: '2025-04-28T09:00:00Z' },
]

export const mockTasks: Task[] = [
  { id: 't1', user_id: DEMO_USER_ID, project_id: 'p2', title: 'Submit thermodynamics lab report', description: 'Final report for MECH301 heat exchanger analysis', status: 'in_progress', priority: 'urgent', due_date: new Date(Date.now() + 3 * 3600000).toISOString(), tags: ['deadline', 'report'], created_at: '2025-05-20T09:00:00Z', updated_at: '2025-05-22T08:00:00Z' },
  { id: 't2', user_id: DEMO_USER_ID, project_id: 'p1', title: 'Review PCB schematic v2', description: 'Check H-bridge thermal protection added after motor overheat incident', status: 'pending', priority: 'high', due_date: new Date(Date.now() + 86400000).toISOString(), tags: ['review', 'hardware'], created_at: '2025-05-18T10:00:00Z', updated_at: '2025-05-20T14:00:00Z' },
  { id: 't3', user_id: DEMO_USER_ID, project_id: 'p3', title: 'Send follow-up to NovaTech HR', description: 'Applied 2 weeks ago, no response yet', status: 'pending', priority: 'high', due_date: new Date(Date.now() - 86400000).toISOString(), tags: ['follow-up', 'email'], created_at: '2025-05-10T11:00:00Z', updated_at: '2025-05-10T11:00:00Z' },
  { id: 't4', user_id: DEMO_USER_ID, project_id: 'p3', title: 'Update resume — add Garden Guardian project', description: 'Add v2 prototype work and test results', status: 'pending', priority: 'medium', due_date: new Date(Date.now() + 2 * 86400000).toISOString(), tags: ['resume'], created_at: '2025-05-15T14:00:00Z', updated_at: '2025-05-15T14:00:00Z' },
  { id: 't5', user_id: DEMO_USER_ID, project_id: 'p1', title: 'Upload motor test results CSV', description: 'Log from 3-hour endurance test', status: 'blocked', priority: 'medium', due_date: undefined, tags: ['data', 'testing'], created_at: '2025-05-19T10:00:00Z', updated_at: '2025-05-21T09:00:00Z' },
  { id: 't6', user_id: DEMO_USER_ID, project_id: 'p2', title: 'Generate LaTeX report from calculations', description: 'Format thermal efficiency calculations into IEEE report template', status: 'pending', priority: 'urgent', due_date: new Date(Date.now() + 4 * 3600000).toISOString(), tags: ['latex', 'report'], created_at: '2025-05-22T07:00:00Z', updated_at: '2025-05-22T07:00:00Z' },
]

export const mockDecisions: Decision[] = [
  { id: 'd1', user_id: DEMO_USER_ID, project_id: 'p1', title: 'Use I2C over SPI for sensor bus', description: 'Chose I2C protocol for connecting soil moisture sensors to Arduino', rationale: 'I2C requires fewer wires (2 vs 4) and supports multi-device on same bus. SPI faster but unnecessary at our sensor polling rate of 1Hz.', alternatives: 'SPI (faster but more wires), UART (point-to-point only), analog ADC (noise issues)', outcome: 'Working well. 4 sensors on same bus, no conflicts.', outcome_assessment: 'good', decided_at: '2025-02-15T10:00:00Z' },
  { id: 'd2', user_id: DEMO_USER_ID, project_id: 'p1', title: 'Reduce motor max duty cycle to 70%', description: 'Hard-limit PWM duty cycle after overheating incident', rationale: 'Motor reached 85°C at 100% duty. 70% cap maintains 52°C max under load. Flow rate still meets requirements.', alternatives: 'Active cooling fan, different motor with higher thermal rating', outcome: 'Thermal issue resolved. No recurrence in 3-week testing.', outcome_assessment: 'good', decided_at: '2025-03-20T14:00:00Z' },
  { id: 'd3', user_id: DEMO_USER_ID, project_id: 'p3', title: 'Target SME sector over large corporations', description: 'Focus job applications on companies with 50-500 employees', rationale: 'More hands-on engineering work, less bureaucracy, faster career progression visible. Large corps had poor feedback response rate.', alternatives: 'Multinationals, startups (<20 employees), consultancies', outcome: undefined, outcome_assessment: undefined, decided_at: '2025-04-01T09:00:00Z' },
]

export const mockFailures: Failure[] = [
  { id: 'f1', user_id: DEMO_USER_ID, project_id: 'p1', title: 'Motor Overheating at 100% PWM', description: 'Motor controller ran at full duty cycle during 40min test. Motor reached 85°C, triggering thermal cutoff and stopping pump.', root_cause: 'No thermal protection in firmware. H-bridge driver has no hardware thermal limit set.', fix_applied: 'Added thermal shutdown in software at 70°C. Reduced max duty cycle to 70%. Added NTC thermistor to motor housing.', lesson_learned: 'Always include thermal monitoring in H-bridge motor control designs. Never run DC motors at 100% without thermal checks.', severity: 'high', is_resolved: true, occurred_at: '2025-03-18T15:30:00Z' },
  { id: 'f2', user_id: DEMO_USER_ID, project_id: 'p1', title: 'I2C Bus Lockup Under Sensor Noise', description: 'Soil sensors triggered I2C bus lockup when plant was watered — electromagnetic noise from pump corrupted data.', root_cause: 'I2C lines unshielded, running parallel to motor power lines. Common ground not properly decoupled.', fix_applied: 'Added 100nF decoupling capacitors at each sensor. Separated signal and power cable routing. Added ferrite beads.', lesson_learned: 'Route I2C and motor power lines separately. Always add decoupling caps near sensor power pins.', severity: 'medium', is_resolved: true, occurred_at: '2025-02-28T11:00:00Z' },
]

export const mockFiles: FileRecord[] = [
  { id: 'fi1', filename: 'sensor_main.ino', file_type: 'code', file_size_bytes: 12400, project_id: 'p1', version: 3, is_latest: true, created_at: '2025-05-20T14:00:00Z' },
  { id: 'fi2', filename: 'schematic_v2.pdf', file_type: 'pdf', file_size_bytes: 845000, project_id: 'p1', version: 2, is_latest: true, created_at: '2025-05-15T10:00:00Z' },
  { id: 'fi3', filename: 'BOM_rev3.xlsx', file_type: 'spreadsheet', file_size_bytes: 34000, project_id: 'p1', version: 3, is_latest: true, created_at: '2025-05-10T09:00:00Z' },
  { id: 'fi4', filename: 'thermo_calcs.pdf', file_type: 'pdf', file_size_bytes: 1200000, project_id: 'p2', version: 1, is_latest: true, created_at: '2025-05-20T20:00:00Z' },
  { id: 'fi5', filename: 'lab_report_draft.docx', file_type: 'docx', file_size_bytes: 89000, project_id: 'p2', version: 2, is_latest: true, created_at: '2025-05-22T07:00:00Z' },
  { id: 'fi6', filename: 'CV_MechEng_v4.pdf', file_type: 'pdf', file_size_bytes: 245000, project_id: 'p3', version: 4, is_latest: true, created_at: '2025-05-08T11:00:00Z' },
]

export const mockAgents: AgentInfo[] = [
  { id: 'a1', name: 'Memory Agent', agent_type: 'memory', status: 'running', performance_score: 0.94 },
  { id: 'a2', name: 'Daily Planner', agent_type: 'planning', status: 'idle', performance_score: 0.88 },
  { id: 'a3', name: 'Engineering Agent', agent_type: 'engineering', status: 'idle', performance_score: 0.91 },
  { id: 'a4', name: 'Research Agent', agent_type: 'research', status: 'idle', performance_score: 0.85 },
  { id: 'a5', name: 'Outreach Agent', agent_type: 'outreach', status: 'waiting_approval', performance_score: 0.79 },
  { id: 'a6', name: 'File Organizer', agent_type: 'file_organizer', status: 'idle', performance_score: 0.92 },
]

export const mockAgentRuns: AgentRun[] = [
  { id: 'ar1', agent_id: 'a1', task_description: 'Index Garden Guardian project files and update memory graph', status: 'running', started_at: new Date(Date.now() - 180000).toISOString(), tool_calls_count: 7 },
  { id: 'ar2', agent_id: 'a5', task_description: 'Draft follow-up email to NovaTech HR contact', status: 'waiting_approval', started_at: new Date(Date.now() - 600000).toISOString(), completed_at: new Date(Date.now() - 120000).toISOString(), result: 'Email draft ready. Subject: Following up on Mechanical Engineer application', tool_calls_count: 3 },
  { id: 'ar3', agent_id: 'a2', task_description: 'Generate morning briefing for today', status: 'completed', started_at: new Date(Date.now() - 3600000 * 6).toISOString(), completed_at: new Date(Date.now() - 3600000 * 5.9).toISOString(), result: 'Briefing generated: 6 tasks due today, 1 overdue follow-up, thermodynamics deadline in 6h', tool_calls_count: 5 },
]

export const mockWorkflowRuns: WorkflowRun[] = [
  { id: 'wr1', workflow_id: 'wf1', status: 'running', current_step: 3, started_at: new Date(Date.now() - 300000).toISOString(), retry_count: 0 },
  { id: 'wr2', workflow_id: 'wf2', status: 'waiting_approval', current_step: 2, started_at: new Date(Date.now() - 900000).toISOString(), retry_count: 0 },
  { id: 'wr3', workflow_id: 'wf3', status: 'completed', current_step: 5, started_at: new Date(Date.now() - 86400000).toISOString(), completed_at: new Date(Date.now() - 86100000).toISOString(), retry_count: 0 },
]

export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'deadline', title: 'Thermodynamics report due in 6 hours', body: 'MECH301 lab report must be submitted by 16:30 today.', priority: 'urgent', is_read: false, created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 'n2', type: 'approval_needed', title: 'Outreach Agent needs approval', body: 'Draft follow-up email to NovaTech ready for review.', priority: 'high', is_read: false, created_at: new Date(Date.now() - 600000).toISOString() },
  { id: 'n3', type: 'agent_done', title: 'Memory Agent completed indexing', body: 'Linked sensor_main.ino to motor overheat failure with 0.87 confidence.', priority: 'low', is_read: false, created_at: new Date(Date.now() - 1200000).toISOString() },
]

// Graph data built from the above entities
export const mockGraphNodes: GraphNode[] = [
  { id: 'p1', type: 'project', label: 'Garden Guardian', data: { status: 'active', phase: 'Prototype v2', color: '#22c55e' } },
  { id: 'p2', type: 'project', label: 'Thermodynamics', data: { status: 'active', phase: 'Report Writing', color: '#f59e0b' } },
  { id: 'p3', type: 'project', label: 'Job Search', data: { status: 'active', color: '#3b82f6' } },
  { id: 't1', type: 'task', label: 'Submit lab report', data: { status: 'in_progress', priority: 'urgent' } },
  { id: 't2', type: 'task', label: 'Review PCB schematic', data: { status: 'pending', priority: 'high' } },
  { id: 't3', type: 'task', label: 'Follow-up NovaTech', data: { status: 'pending', priority: 'high' } },
  { id: 't5', type: 'task', label: 'Upload test results', data: { status: 'blocked', priority: 'medium' } },
  { id: 'd1', type: 'decision', label: 'I2C over SPI', data: { outcome_assessment: 'good' } },
  { id: 'd2', type: 'decision', label: '70% duty cycle cap', data: { outcome_assessment: 'good' } },
  { id: 'f1', type: 'failure', label: 'Motor Overheating', data: { severity: 'high', is_resolved: true } },
  { id: 'f2', type: 'failure', label: 'I2C Bus Lockup', data: { severity: 'medium', is_resolved: true } },
  { id: 'fi1', type: 'file', label: 'sensor_main.ino', data: { file_type: 'code' } },
  { id: 'fi2', type: 'file', label: 'schematic_v2.pdf', data: { file_type: 'pdf' } },
  { id: 'fi6', type: 'file', label: 'CV_MechEng_v4.pdf', data: { file_type: 'pdf' } },
]

export const mockGraphEdges: GraphEdge[] = [
  { id: 'e1', source: 'p1', target: 't2', label: 'has_task', data: { confidence: 1.0 } },
  { id: 'e2', source: 'p1', target: 't5', label: 'has_task', data: { confidence: 1.0 } },
  { id: 'e3', source: 'p1', target: 'd1', label: 'has_decision', data: { confidence: 1.0 } },
  { id: 'e4', source: 'p1', target: 'd2', label: 'has_decision', data: { confidence: 1.0 } },
  { id: 'e5', source: 'p1', target: 'f1', label: 'has_failure', data: { confidence: 1.0 } },
  { id: 'e6', source: 'p1', target: 'f2', label: 'has_failure', data: { confidence: 1.0 } },
  { id: 'e7', source: 'f1', target: 'd2', label: 'caused', data: { confidence: 0.95 } },
  { id: 'e8', source: 'fi1', target: 'p1', label: 'belongs_to', data: { confidence: 1.0 } },
  { id: 'e9', source: 'fi1', target: 'f1', label: 'related_to', data: { confidence: 0.87 } },
  { id: 'e10', source: 'fi2', target: 'p1', label: 'belongs_to', data: { confidence: 1.0 } },
  { id: 'e11', source: 'fi2', target: 'd2', label: 'documents', data: { confidence: 0.92 } },
  { id: 'e12', source: 'p2', target: 't1', label: 'has_task', data: { confidence: 1.0 } },
  { id: 'e13', source: 'p3', target: 't3', label: 'has_task', data: { confidence: 1.0 } },
  { id: 'e14', source: 'p3', target: 'fi6', label: 'uses_file', data: { confidence: 1.0 } },
  { id: 'e15', source: 't5', target: 't2', label: 'blocked_by', data: { confidence: 1.0 } },
]
