// Automation Flow Component - Manages dashboard automation workflows
class AutomationFlow {
  constructor(apiClient) {
    this.api = apiClient;
    this.workflows = [];
    this.activeAgents = [];
    this.processingQueue = 0;
    
    // Available automation workflows
    this.availableWorkflows = [
      {
        id: 'dashboard-analysis',
        name: 'Dashboard Analysis',
        description: 'Analyzes dashboard metrics and provides insights',
        agent: 'dashboard',
        status: 'active',
        lastRun: null
      },
      {
        id: 'order-processing',
        name: 'Order Processing Automation',
        description: 'Automatically processes incoming orders',
        agent: 'orders',
        status: 'active',
        lastRun: null
      },
      {
        id: 'inventory-check',
        name: 'Inventory Monitoring',
        description: 'Monitors stock levels and alerts on low stock',
        agent: 'inventory',
        status: 'active',
        lastRun: null
      },
      {
        id: 'customer-insights',
        name: 'Customer Analysis',
        description: 'Analyzes customer behavior and preferences',
        agent: 'customers',
        status: 'inactive',
        lastRun: null
      },
      {
        id: 'sales-automation',
        name: 'Sales Automation',
        description: 'Automates sales follow-ups and promotions',
        agent: 'automation',
        status: 'active',
        lastRun: null
      },
      {
        id: 'harvest-optimization',
        name: 'Harvest Optimization',
        description: 'Optimizes harvest timing based on weather data',
        agent: 'harvest',
        status: 'inactive',
        lastRun: null
      }
    ];
  }

  async init() {
    this.workflows = [...this.availableWorkflows];
    this.render();
    await this.updateStatus();
    this.startAutoUpdate();
  }

  render() {
    const automationFlowContainer = document.getElementById('automation-flow');
    if (!automationFlowContainer) return;

    automationFlowContainer.innerHTML = `
      <div class="automation-controls">
        <button id="run-automation-test" class="btn btn-primary">
          ⚡ Run Automation Test
        </button>
        <button id="run-all-workflows" class="btn btn-secondary">
          🚀 Run All Workflows
        </button>
      </div>
      <div class="automation-status">
        <div class="status-item">
          <span class="status-label">Processing Queue:</span>
          <span id="processing-queue" class="status-value">0 items</span>
        </div>
        <div class="status-item">
          <span class="status-label">Engine Status:</span>
          <span id="engine-status" class="status-value">Unknown</span>
        </div>
        <div class="status-item">
          <span class="status-label">Active Agents:</span>
          <span id="active-agents" class="status-value">0</span>
        </div>
      </div>
      <div class="workflow-list" id="workflow-list"></div>
      <div class="test-results" id="test-results"></div>
    `;

    // Add button handlers
    document.getElementById('run-automation-test')?.addEventListener('click', () => {
      this.runAutomationTest();
    });

    document.getElementById('run-all-workflows')?.addEventListener('click', () => {
      this.runAllActiveWorkflows();
    });

    this.renderWorkflows();
  }
<<<<<<< /Users/stevejohn/CascadeProjects/windsurf-project-2/bizcommerz-clone/agentic-engine/public/frontend/components/AutomationFlow.js
<<<<<<< /Users/stevejohn/CascadeProjects/windsurf-project-2/bizcommerz-clone/agentic-engine/public/frontend/components/AutomationFlow.js
<<<<<<< /Users/stevejohn/CascadeProjects/windsurf-project-2/bizcommerz-clone/agentic-engine/public/frontend/components/AutomationFlow.js
<<<<<<< /Users/stevejohn/CascadeProjects/windsurf-project-2/bizcommerz-clone/agentic-engine/public/frontend/components/AutomationFlow.js
<<<<<<< /Users/stevejohn/CascadeProjects/windsurf-project-2/bizcommerz-clone/agentic-engine/public/frontend/components/AutomationFlow.js
<<<<<<< /Users/stevejohn/CascadeProjects/windsurf-project-2/bizcommerz-clone/agentic-engine/public/frontend/components/AutomationFlow.js
<<<<<<< /Users/stevejohn/CascadeProjects/windsurf-project-2/bizcommerz-clone/agentic-engine/public/frontend/components/AutomationFlow.js
<<<<<<< /Users/stevejohn/CascadeProjects/windsurf-project-2/bizcommerz-clone/agentic-engine/public/frontend/components/AutomationFlow.js
<<<<<<< /Users/stevejohn/CascadeProjects/windsurf-project-2/bizcommerz-clone/agentic-engine/public/frontend/components/AutomationFlow.js
<<<<<<< /Users/stevejohn/CascadeProjects/windsurf-project-2/bizcommerz-clone/agentic-engine/public/frontend/components/AutomationFlow.js
=======
=======
>>>>>>> /Users/stevejohn/.windsurf/worktrees/agentic-engine/agentic-engine-e15da136/public/frontend/components/AutomationFlow.js
=======
>>>>>>> /Users/stevejohn/.windsurf/worktrees/agentic-engine/agentic-engine-e15da136/public/frontend/components/AutomationFlow.js
=======
>>>>>>> /Users/stevejohn/.windsurf/worktrees/agentic-engine/agentic-engine-e15da136/public/frontend/components/AutomationFlow.js
=======
>>>>>>> /Users/stevejohn/.windsurf/worktrees/agentic-engine/agentic-engine-e15da136/public/frontend/components/AutomationFlow.js
=======
>>>>>>> /Users/stevejohn/.windsurf/worktrees/agentic-engine/agentic-engine-e15da136/public/frontend/components/AutomationFlow.js
=======
>>>>>>> /Users/stevejohn/.windsurf/worktrees/agentic-engine/agentic-engine-e15da136/public/frontend/components/AutomationFlow.js
=======
>>>>>>> /Users/stevejohn/.windsurf/worktrees/agentic-engine/agentic-engine-e15da136/public/frontend/components/AutomationFlow.js
=======
>>>>>>> /Users/stevejohn/.windsurf/worktrees/agentic-engine/agentic-engine-e15da136/public/frontend/components/AutomationFlow.js
=======
>>>>>>> /Users/stevejohn/.windsurf/worktrees/agentic-engine/agentic-engine-e15da136/public/frontend/components/AutomationFlow.js

  renderWorkflows() {
    const workflowList = document.getElementById('workflow-list');
    if (!workflowList) return;
>>>>>>> /Users/stevejohn/.windsurf/worktrees/agentic-engine/agentic-engine-e15da136/public/frontend/components/AutomationFlow.js

    workflowList.innerHTML = this.workflows.map(workflow => `
      <div class="workflow-item" data-id="${workflow.id}">
        <div>
          <div class="workflow-name">${workflow.name}</div>
          <div class="workflow-description">${workflow.description}</div>
        </div>
        <div class="workflow-status ${workflow.status}">
          ${workflow.status}
        </div>
      </div>
    `).join('');

    // Add click handlers
    const workflowItems = workflowList.querySelectorAll('.workflow-item');
    workflowItems.forEach(item => {
      item.addEventListener('click', () => {
        const workflowId = item.dataset.id;
        this.toggleWorkflow(workflowId);
      });
    });
  }

  async toggleWorkflow(workflowId) {
    const workflow = this.workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    workflow.status = workflow.status === 'active' ? 'inactive' : 'active';
    
    if (workflow.status === 'active') {
      await this.executeWorkflow(workflow);
    }

    this.renderWorkflows();
  }

  async executeWorkflow(workflow) {
    const response = await this.api.post(`/agent/${workflow.agent}`, {
      action: 'execute',
      workflow: workflow.id
    });

    if (response.goalId) {
      workflow.lastRun = new Date().toISOString();
      this.showNotification(`${workflow.name} executed successfully`, 'success');
    } else {
      this.showNotification(`Failed to execute ${workflow.name}`, 'error');
    }
  }

  async triggerAgent(agentName) {
    this.processingQueue++;
    this.updateQueueDisplay();

    const response = await this.api.post(`/agent/${agentName}`, {
      action: 'trigger',
      timestamp: new Date().toISOString()
    });

    if (response.goalId) {
      this.showNotification(`${agentName} agent triggered successfully`, 'success');
      
      // Update workflow last run time
      const workflow = this.workflows.find(w => w.agent === agentName);
      if (workflow) {
        workflow.lastRun = new Date().toISOString();
      }
    } else {
      this.showNotification(`Failed to trigger ${agentName} agent`, 'error');
    }

    this.processingQueue--;
    this.updateQueueDisplay();
    await this.updateStatus();
  }

  async updateStatus() {
    try {
      const health = await this.api.getHealth();
      
      const engineStatus = document.getElementById('engine-status');
      const activeAgents = document.getElementById('active-agents');
      
      if (engineStatus) {
        const status = health.status || 'unknown';
        engineStatus.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        engineStatus.className = `value ${status === 'running' ? 'running' : 'stopped'}`;
      }
      
      if (activeAgents && health.agents) {
        activeAgents.textContent = `${health.agents.length} active`;
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }

  updateQueueDisplay() {
    const queueDisplay = document.getElementById('processing-queue');
    if (queueDisplay) {
      queueDisplay.textContent = `${this.processingQueue} items`;
    }
  }

  startAutoUpdate() {
    // Update status every 10 seconds
    setInterval(() => {
      this.updateStatus();
    }, 10000);
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      background: ${type === 'success' ? '#22c55e' : '#ef4444'};
      color: white;
      border-radius: 8px;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  getWorkflows() {
    return this.workflows;
  }

  getActiveWorkflows() {
    return this.workflows.filter(w => w.status === 'active');
  }

  async runAllActiveWorkflows() {
    const activeWorkflows = this.getActiveWorkflows();
    
    for (const workflow of activeWorkflows) {
      await this.executeWorkflow(workflow);
    }
  }

  async runAutomationTest() {
    const testResults = document.getElementById('test-results');
    if (!testResults) return;

    testResults.innerHTML = '<div class="test-loading">🧪 Running automation test...</div>';

    const API_BASE = 'https://bizcommerz-agentic-engine.aekbuffalo.workers.dev';
    const testOrder = {
      id: Date.now(),
      items: [
        { id: 1, name: "Heritage Mooncake", price: 180, quantity: 2 },
        { id: 2, name: "Pandan Custard Pastry", price: 45, quantity: 1 }
      ],
      total: 405,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    const results = [];
    const tests = [
      { name: 'Orders Agent', endpoint: '/agent/orders', body: { action: 'create_order', order: testOrder } },
      { name: 'Automation Agent', endpoint: '/agent/automation', body: { action: 'process_order', orderId: testOrder.id } },
      { name: 'Dashboard Agent', endpoint: '/agent/dashboard', body: { action: 'analyze_order', orderId: testOrder.id } },
      { name: 'Inventory Agent', endpoint: '/agent/inventory', body: { action: 'check_stock', orderId: testOrder.id } },
      { name: 'Insights Agent', endpoint: '/agent/insights', body: { action: 'generate_insights', orderId: testOrder.id } },
      { name: 'Customers Agent', endpoint: '/agent/customers', body: { action: 'analyze_customer', orderId: testOrder.id } }
    ];

    for (const test of tests) {
      try {
        const response = await fetch(`${API_BASE}${test.endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(test.body)
        });
        const data = await response.json();
        results.push({ agent: test.name, status: 'success', data });
      } catch (error) {
        results.push({ agent: test.name, status: 'error', error: error.message });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const totalCount = results.length;

    testResults.innerHTML = `
      <div class="test-summary">
        <h3>📊 Test Results: ${successCount}/${totalCount} passed (${((successCount/totalCount)*100).toFixed(1)}%)</h3>
      </div>
      <div class="test-details">
        ${results.map(r => `
          <div class="test-item ${r.status}">
            <span class="test-icon">${r.status === 'success' ? '✅' : '❌'}</span>
            <span class="test-name">${r.agent}</span>
            <span class="test-status">${r.status}</span>
          </div>
        `).join('')}
      </div>
    `;

    if (successCount === totalCount) {
      this.showNotification('เฉลิมฉลอง All automation tests passed!', 'success');
    } else {
      this.showNotification('⚠️ Some automation tests failed', 'error');
    }
  }
}

// Global function for HTML onclick handlers
let automationFlowInstance;

function triggerAgent(agentName) {
  if (automationFlowInstance) {
    automationFlowInstance.triggerAgent(agentName);
  }
}
