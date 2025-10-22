/**
 * BioQL Workflow Executor - Frontend
 * Manages workflow execution and communicates with backend
 */

class WorkflowExecutor {
    constructor() {
        this.apiUrl = this.detectEnvironment();
        this.currentExecution = null;
        this.executionStatus = new Map();
        console.log(`✅ Workflow Executor initialized (API: ${this.apiUrl})`);
    }

    detectEnvironment() {
        const isProduction = window.location.protocol === 'https:' &&
                            !window.location.hostname.includes('localhost');

        return isProduction
            ? 'https://api.bioql.bio/workflow'
            : 'http://127.0.0.1:5002/workflow';
    }

    async execute(workflowData) {
        console.log('🚀 Starting workflow execution:', workflowData);

        // Validate workflow
        if (!this.validateWorkflow(workflowData)) {
            this.logError('Invalid workflow structure');
            return;
        }

        // Get execution order (topological sort)
        const executionOrder = this.getExecutionOrder(workflowData);
        if (!executionOrder) {
            this.logError('Workflow contains cycles or disconnected nodes');
            return;
        }

        console.log('📋 Execution order:', executionOrder);

        // Execute nodes in order
        try {
            this.currentExecution = {
                workflowData,
                executionOrder,
                currentIndex: 0,
                results: new Map(),
                startTime: Date.now()
            };

            // Update progress
            this.updateProgress(0);

            // Execute nodes sequentially
            for (let i = 0; i < executionOrder.length; i++) {
                const nodeId = executionOrder[i];
                const node = workflowData.nodes.find(n => n.id === nodeId);

                console.log(`📌 Executing node ${i + 1}/${executionOrder.length}: ${nodeId}`);

                // Set node as executing
                if (window.workflowCanvas) {
                    window.workflowCanvas.setNodeStatus(nodeId, 'executing');
                    window.workflowCanvas.logConsole('info', `Executing ${node.type}...`);
                }

                // Highlight active connections
                this.highlightActiveConnections(nodeId, workflowData.connections);

                // Execute node
                const result = await this.executeNode(node, workflowData);

                // Store result
                this.currentExecution.results.set(nodeId, result);

                // Set node as completed or error
                if (result.success) {
                    if (window.workflowCanvas) {
                        window.workflowCanvas.setNodeStatus(nodeId, 'completed');
                        window.workflowCanvas.logConsole('success', `✓ ${node.type} completed`);
                    }

                    // Handle export nodes - auto download
                    if (node.type === 'export-json' && result.data && result.data.file_data) {
                        this.downloadFile(result.data.file_data, result.data.filename || 'workflow_export.json', 'application/json');
                        if (window.workflowCanvas) {
                            window.workflowCanvas.logConsole('success', `📥 Downloaded ${result.data.filename}`);
                        }
                    } else if (node.type === 'export-csv' && result.data && result.data.file_data) {
                        this.downloadFile(result.data.file_data, result.data.filename || 'workflow_export.csv', 'text/csv');
                        if (window.workflowCanvas) {
                            window.workflowCanvas.logConsole('success', `📥 Downloaded ${result.data.filename}`);
                        }
                    }
                } else {
                    if (window.workflowCanvas) {
                        window.workflowCanvas.setNodeStatus(nodeId, 'error');
                        window.workflowCanvas.logConsole('error', `✗ ${node.type} failed: ${result.error}`);
                    }
                    throw new Error(`Node ${nodeId} failed: ${result.error}`);
                }

                // Update progress
                const progress = ((i + 1) / executionOrder.length) * 100;
                this.updateProgress(progress);

                // Deactivate connections
                this.highlightActiveConnections(nodeId, workflowData.connections, false);
            }

            // Execution complete
            const duration = ((Date.now() - this.currentExecution.startTime) / 1000).toFixed(2);
            console.log(`✅ Workflow execution completed in ${duration}s`);

            if (window.workflowCanvas) {
                window.workflowCanvas.logConsole('success', `🎉 Workflow completed successfully in ${duration}s`);
            }

            this.updateProgress(100);

            // Hide progress after 2 seconds
            setTimeout(() => {
                this.updateProgress(0);
                document.getElementById('execution-progress').classList.remove('active');
            }, 2000);

        } catch (error) {
            console.error('❌ Workflow execution failed:', error);
            if (window.workflowCanvas) {
                window.workflowCanvas.logConsole('error', `Workflow failed: ${error.message}`);
            }

            setTimeout(() => {
                this.updateProgress(0);
                document.getElementById('execution-progress').classList.remove('active');
            }, 2000);
        }
    }

    async executeNode(node, workflowData) {
        // Get inputs from connected nodes
        const inputs = this.getNodeInputs(node.id, workflowData);

        // Merge with node's own inputs
        const allInputs = { ...node.inputs, ...inputs };

        // Call backend to execute this specific node
        try {
            const response = await fetch(`${this.apiUrl}/execute-node`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getApiKey()}`
                },
                body: JSON.stringify({
                    node_type: node.type,
                    node_id: node.id,
                    inputs: allInputs
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Node execution failed');
            }

            const result = await response.json();
            return {
                success: true,
                data: result.data,
                metadata: result.metadata
            };

        } catch (error) {
            console.error(`Error executing node ${node.id}:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    getNodeInputs(nodeId, workflowData) {
        const inputs = {};

        // Find all connections that feed into this node
        const incomingConnections = workflowData.connections.filter(conn => conn.to === nodeId);

        for (const conn of incomingConnections) {
            // Get the result from the source node
            if (this.currentExecution && this.currentExecution.results.has(conn.from)) {
                const sourceResult = this.currentExecution.results.get(conn.from);
                if (sourceResult.success) {
                    // Pass the data from source to target
                    inputs.upstream_data = sourceResult.data;
                }
            }
        }

        return inputs;
    }

    validateWorkflow(workflowData) {
        if (!workflowData.nodes || workflowData.nodes.length === 0) {
            console.error('Workflow has no nodes');
            return false;
        }

        if (!workflowData.connections) {
            workflowData.connections = [];
        }

        return true;
    }

    getExecutionOrder(workflowData) {
        const nodes = workflowData.nodes;
        const connections = workflowData.connections;

        // Build adjacency list
        const graph = new Map();
        const inDegree = new Map();

        // Initialize
        for (const node of nodes) {
            graph.set(node.id, []);
            inDegree.set(node.id, 0);
        }

        // Build graph
        for (const conn of connections) {
            graph.get(conn.from).push(conn.to);
            inDegree.set(conn.to, inDegree.get(conn.to) + 1);
        }

        // Topological sort (Kahn's algorithm)
        const queue = [];
        const result = [];

        // Find nodes with no incoming edges
        for (const [nodeId, degree] of inDegree) {
            if (degree === 0) {
                queue.push(nodeId);
            }
        }

        while (queue.length > 0) {
            const nodeId = queue.shift();
            result.push(nodeId);

            // Reduce in-degree for neighbors
            for (const neighbor of graph.get(nodeId)) {
                inDegree.set(neighbor, inDegree.get(neighbor) - 1);
                if (inDegree.get(neighbor) === 0) {
                    queue.push(neighbor);
                }
            }
        }

        // Check if all nodes are included (no cycles)
        if (result.length !== nodes.length) {
            console.error('Workflow contains cycles or disconnected components');
            return null;
        }

        return result;
    }

    highlightActiveConnections(nodeId, connections, active = true) {
        if (!window.workflowCanvas) return;

        // Highlight outgoing connections
        const outgoingConnections = connections.filter(conn => conn.from === nodeId);
        for (const conn of outgoingConnections) {
            window.workflowCanvas.setConnectionActive(conn.from, conn.to, active);
        }
    }

    updateProgress(percentage) {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
    }

    getApiKey() {
        // Get from global variable (set by workflows.html authentication)
        if (window.BIOQL_API_KEY) {
            return window.BIOQL_API_KEY;
        }
        // Fallback to localStorage
        return localStorage.getItem('bioql_api_key') || 'demo_key';
    }

    logError(message) {
        console.error(message);
        if (window.workflowCanvas) {
            window.workflowCanvas.logConsole('error', message);
        }
    }

    downloadFile(fileData, filename, mimeType) {
        try {
            // Create blob from file data
            const blob = new Blob([fileData], { type: mimeType });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;

            // Trigger download
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            console.log(`✅ Downloaded: ${filename}`);
        } catch (error) {
            console.error(`❌ Download failed: ${error.message}`);
            if (window.workflowCanvas) {
                window.workflowCanvas.logConsole('error', `Download failed: ${error.message}`);
            }
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkflowExecutor;
}
