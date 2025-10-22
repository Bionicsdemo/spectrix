/**
 * BioQL WebSocket Client
 * Real-time updates for workflow execution
 */

class WebSocketClient {
    constructor(url) {
        this.url = url;
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
        this.listeners = new Map();

        this.connect();
    }

    connect() {
        try {
            console.log(`🔌 Connecting to WebSocket: ${this.url}`);

            // Detect environment for correct WS URL
            const wsUrl = this.detectWebSocketURL();

            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log('✅ WebSocket connected');
                this.reconnectAttempts = 0;
                this.emit('connected');
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.socket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.emit('error', error);
            };

            this.socket.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                this.emit('disconnected');
                this.attemptReconnect();
            };

        } catch (error) {
            console.error('Failed to create WebSocket:', error);
        }
    }

    detectWebSocketURL() {
        const isProduction = window.location.protocol === 'https:' &&
                            !window.location.hostname.includes('localhost');

        if (isProduction) {
            return 'wss://api.bioql.bio/ws';
        } else {
            return 'ws://127.0.0.1:5002/ws';
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('❌ Max reconnection attempts reached');
        }
    }

    handleMessage(data) {
        console.log('📨 WebSocket message:', data);

        switch (data.type) {
            case 'node_started':
                this.onNodeStarted(data);
                break;

            case 'node_progress':
                this.onNodeProgress(data);
                break;

            case 'node_completed':
                this.onNodeCompleted(data);
                break;

            case 'node_error':
                this.onNodeError(data);
                break;

            case 'workflow_completed':
                this.onWorkflowCompleted(data);
                break;

            case 'workflow_error':
                this.onWorkflowError(data);
                break;

            default:
                console.warn('Unknown message type:', data.type);
        }

        // Emit to listeners
        this.emit(data.type, data);
    }

    onNodeStarted(data) {
        console.log(`📌 Node started: ${data.node_id}`);

        if (window.workflowCanvas) {
            window.workflowCanvas.setNodeStatus(data.node_id, 'executing');
            window.workflowCanvas.logConsole('info', `Executing ${data.node_type}...`);
        }
    }

    onNodeProgress(data) {
        console.log(`⏳ Node progress: ${data.node_id} - ${data.progress}%`);

        if (window.workflowCanvas) {
            window.workflowCanvas.logConsole('info', `${data.node_type}: ${data.message || data.progress + '%'}`);
        }
    }

    onNodeCompleted(data) {
        console.log(`✅ Node completed: ${data.node_id}`);

        if (window.workflowCanvas) {
            window.workflowCanvas.setNodeStatus(data.node_id, 'completed');
            window.workflowCanvas.logConsole('success', `✓ ${data.node_type} completed`);
        }
    }

    onNodeError(data) {
        console.error(`❌ Node error: ${data.node_id}`, data.error);

        if (window.workflowCanvas) {
            window.workflowCanvas.setNodeStatus(data.node_id, 'error');
            window.workflowCanvas.logConsole('error', `✗ ${data.node_type} failed: ${data.error}`);
        }
    }

    onWorkflowCompleted(data) {
        console.log(`🎉 Workflow completed: ${data.workflow_id}`);

        if (window.workflowCanvas) {
            window.workflowCanvas.logConsole('success', `🎉 Workflow completed in ${data.duration}s`);
        }

        // Hide progress bar
        setTimeout(() => {
            const progressEl = document.getElementById('execution-progress');
            if (progressEl) {
                progressEl.classList.remove('active');
            }
        }, 2000);
    }

    onWorkflowError(data) {
        console.error(`❌ Workflow error: ${data.workflow_id}`, data.error);

        if (window.workflowCanvas) {
            window.workflowCanvas.logConsole('error', `Workflow failed: ${data.error}`);
        }
    }

    send(type, data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const message = {
                type: type,
                ...data,
                timestamp: new Date().toISOString()
            };

            this.socket.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket is not connected, cannot send message');
        }
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            for (const callback of this.listeners.get(event)) {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            }
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebSocketClient;
}
