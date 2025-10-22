/**
 * BioQL Workflow Canvas Engine
 * Handles drag-and-drop, node connections, and canvas interactions
 */

class CanvasEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.connectionsSvg = document.getElementById('connections-svg');
        this.nodes = new Map();
        this.connections = [];
        this.selectedNode = null;
        this.draggedNode = null;
        this.connectionStart = null;
        this.tempConnection = null;
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.nodeIdCounter = 0;
        this.isPanning = false;
        this.panStartX = 0;
        this.panStartY = 0;
        this.clipboard = null;

        this.init();
    }

    init() {
        console.log('🎨 Initializing Canvas Engine...');

        // Setup event listeners
        this.setupDragAndDrop();
        this.setupCanvasInteraction();
        this.setupKeyboardShortcuts();
        this.setupContextMenu();
        this.setupZoomControls();
        this.setupExecutionControls();

        // Update SVG size
        this.updateSVGSize();
        window.addEventListener('resize', () => this.updateSVGSize());

        console.log('✅ Canvas Engine initialized');
    }

    // ============= DRAG AND DROP =============
    setupDragAndDrop() {
        const nodeItems = document.querySelectorAll('.node-item');

        nodeItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                const nodeType = item.dataset.nodeType;
                e.dataTransfer.setData('nodeType', nodeType);
                e.dataTransfer.effectAllowed = 'copy';
            });
        });

        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const nodeType = e.dataTransfer.getData('nodeType');
            if (nodeType) {
                const rect = this.canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left - this.panX) / this.zoom;
                const y = (e.clientY - rect.top - this.panY) / this.zoom;
                this.createNode(nodeType, x, y);
            }
        });
    }

    // ============= NODE CREATION =============
    createNode(type, x, y) {
        const nodeId = `node-${this.nodeIdCounter++}`;
        const nodeConfig = this.getNodeConfig(type);

        // Create node element
        const nodeElement = document.createElement('div');
        nodeElement.className = 'workflow-node';
        nodeElement.id = nodeId;
        nodeElement.style.left = `${x}px`;
        nodeElement.style.top = `${y}px`;
        nodeElement.style.transform = `scale(${this.zoom})`;
        nodeElement.style.transformOrigin = 'top left';

        // Node header
        const header = document.createElement('div');
        header.className = 'node-header';
        header.innerHTML = `
            <div class="node-icon ${nodeConfig.category}">
                <i class="${nodeConfig.icon}"></i>
            </div>
            <div class="node-title">${nodeConfig.name}</div>
            <div class="node-status"></div>
        `;

        // Node body with parameters
        const body = document.createElement('div');
        body.className = 'node-body';
        body.innerHTML = this.generateNodeParameters(nodeConfig);

        // Connection ports
        const inputPort = document.createElement('div');
        inputPort.className = 'node-port input';
        inputPort.dataset.nodeId = nodeId;
        inputPort.dataset.portType = 'input';

        const outputPort = document.createElement('div');
        outputPort.className = 'node-port output';
        outputPort.dataset.nodeId = nodeId;
        outputPort.dataset.portType = 'output';

        nodeElement.appendChild(header);
        nodeElement.appendChild(body);
        if (nodeConfig.hasInput) nodeElement.appendChild(inputPort);
        if (nodeConfig.hasOutput) nodeElement.appendChild(outputPort);

        this.canvas.appendChild(nodeElement);

        // Store node data
        this.nodes.set(nodeId, {
            id: nodeId,
            type: type,
            config: nodeConfig,
            element: nodeElement,
            x: x,
            y: y,
            inputs: {},
            outputs: {},
            status: 'idle'
        });

        // Setup node interactions
        this.setupNodeInteractions(nodeId);

        // Setup port interactions
        if (nodeConfig.hasInput) {
            this.setupPortInteractions(inputPort);
        }
        if (nodeConfig.hasOutput) {
            this.setupPortInteractions(outputPort);
        }

        this.logConsole('info', `Created ${nodeConfig.name} node`);

        return nodeId;
    }

    getNodeConfig(type) {
        const configs = {
            // INPUT NODES
            'upload-pdb': {
                name: 'Upload PDB',
                category: 'input',
                icon: 'fas fa-file-code',
                hasInput: false,
                hasOutput: true,
                parameters: [
                    { name: 'file', label: 'PDB File', type: 'file', accept: '.pdb' },
                    { name: 'protein_name', label: 'Protein Name', type: 'text' }
                ]
            },
            'upload-molecule': {
                name: 'Upload Molecule',
                category: 'input',
                icon: 'fas fa-flask',
                hasInput: false,
                hasOutput: true,
                parameters: [
                    { name: 'file', label: 'Molecule File', type: 'file', accept: '.mol2,.sdf,.pdb' },
                    { name: 'smiles', label: 'Or SMILES', type: 'text', placeholder: 'CCO' }
                ]
            },
            'text-input': {
                name: 'Text Input',
                category: 'input',
                icon: 'fas fa-keyboard',
                hasInput: false,
                hasOutput: true,
                parameters: [
                    { name: 'text', label: 'Text', type: 'textarea', placeholder: 'Enter text...' }
                ]
            },

            // QUANTUM NODES
            'vina-docking': {
                name: 'Vina Docking',
                category: 'quantum',
                icon: 'fas fa-magnet',
                hasInput: true,
                hasOutput: true,
                parameters: [
                    { name: 'backend', label: 'Backend', type: 'select', options: ['ibm_torino', 'ibm_kyoto', 'ionq', 'simulator'], default: 'simulator' },
                    { name: 'shots', label: 'Shots', type: 'number', default: 100, min: 10, max: 10000 },
                    { name: 'exhaustiveness', label: 'Exhaustiveness', type: 'number', default: 8, min: 1, max: 32 },
                    { name: 'num_modes', label: 'Number of Modes', type: 'number', default: 10, min: 1, max: 20 }
                ]
            },
            'adme-prediction': {
                name: 'ADME Prediction',
                category: 'quantum',
                icon: 'fas fa-pills',
                hasInput: true,
                hasOutput: true,
                parameters: [
                    { name: 'backend', label: 'Backend', type: 'select', options: ['ibm_torino', 'ionq', 'simulator'], default: 'simulator' },
                    { name: 'shots', label: 'Shots', type: 'number', default: 100 },
                    { name: 'properties', label: 'Properties', type: 'multi-select', options: ['absorption', 'distribution', 'metabolism', 'excretion'], default: ['absorption', 'distribution'] }
                ]
            },
            'toxicity-prediction': {
                name: 'Toxicity Prediction',
                category: 'quantum',
                icon: 'fas fa-skull-crossbones',
                hasInput: true,
                hasOutput: true,
                parameters: [
                    { name: 'backend', label: 'Backend', type: 'select', options: ['ibm_torino', 'simulator'], default: 'simulator' },
                    { name: 'shots', label: 'Shots', type: 'number', default: 100 }
                ]
            },
            'crispr-design': {
                name: 'CRISPR Design',
                category: 'quantum',
                icon: 'fas fa-dna',
                hasInput: true,
                hasOutput: true,
                parameters: [
                    { name: 'backend', label: 'Backend', type: 'select', options: ['ibm_torino', 'simulator'], default: 'simulator' },
                    { name: 'shots', label: 'Shots', type: 'number', default: 100 },
                    { name: 'target_gene', label: 'Target Gene', type: 'text' },
                    { name: 'num_guides', label: 'Number of Guides', type: 'number', default: 10 }
                ]
            },
            'denovo-designer': {
                name: 'De Novo Designer',
                category: 'quantum',
                icon: 'fas fa-wand-magic-sparkles',
                hasInput: true,
                hasOutput: true,
                parameters: [
                    { name: 'backend', label: 'Backend', type: 'select', options: ['ibm_torino', 'simulator'], default: 'simulator' },
                    { name: 'shots', label: 'Shots', type: 'number', default: 200 },
                    { name: 'target_protein', label: 'Target Protein', type: 'text' },
                    { name: 'num_molecules', label: 'Generate Count', type: 'number', default: 20 },
                    { name: 'optimization', label: 'Optimization', type: 'select', options: ['binding', 'druglikeness', 'synthesis'], default: 'binding' }
                ]
            },
            'virtual-screening': {
                name: 'Virtual Screening',
                category: 'quantum',
                icon: 'fas fa-filter',
                hasInput: true,
                hasOutput: true,
                parameters: [
                    { name: 'backend', label: 'Backend', type: 'select', options: ['ibm_torino', 'simulator'], default: 'simulator' },
                    { name: 'shots', label: 'Shots', type: 'number', default: 100 },
                    { name: 'library_size', label: 'Library Size', type: 'number', default: 10000 },
                    { name: 'top_n', label: 'Top N Results', type: 'number', default: 100 }
                ]
            },
            'binding-affinity': {
                name: 'Binding Affinity',
                category: 'quantum',
                icon: 'fas fa-link',
                hasInput: true,
                hasOutput: true,
                parameters: [
                    { name: 'backend', label: 'Backend', type: 'select', options: ['ibm_torino', 'simulator'], default: 'simulator' },
                    { name: 'shots', label: 'Shots', type: 'number', default: 100 }
                ]
            },

            // DATA PROCESSING
            'filter': {
                name: 'Filter',
                category: 'tools',
                icon: 'fas fa-filter',
                hasInput: true,
                hasOutput: true,
                parameters: [
                    { name: 'field', label: 'Filter Field', type: 'text', placeholder: 'binding_affinity' },
                    { name: 'operator', label: 'Operator', type: 'select', options: ['>', '<', '>=', '<=', '==', '!='], default: '>' },
                    { name: 'value', label: 'Value', type: 'number', default: 0 }
                ]
            },
            'sort': {
                name: 'Sort',
                category: 'tools',
                icon: 'fas fa-sort',
                hasInput: true,
                hasOutput: true,
                parameters: [
                    { name: 'field', label: 'Sort Field', type: 'text', placeholder: 'binding_affinity' },
                    { name: 'order', label: 'Order', type: 'select', options: ['ascending', 'descending'], default: 'descending' }
                ]
            },
            'if-then': {
                name: 'If/Then',
                category: 'tools',
                icon: 'fas fa-code-branch',
                hasInput: true,
                hasOutput: true,
                parameters: [
                    { name: 'condition', label: 'Condition', type: 'text', placeholder: 'value > 0.5' },
                    { name: 'then_action', label: 'Then Action', type: 'select', options: ['pass', 'block', 'transform'], default: 'pass' }
                ]
            },

            // OUTPUT NODES
            'export-csv': {
                name: 'Export CSV',
                category: 'output',
                icon: 'fas fa-file-csv',
                hasInput: true,
                hasOutput: false,
                parameters: [
                    { name: 'filename', label: 'Filename', type: 'text', default: 'results.csv' },
                    { name: 'fields', label: 'Fields', type: 'text', placeholder: 'field1,field2,field3' }
                ]
            },
            'export-json': {
                name: 'Export JSON',
                category: 'output',
                icon: 'fas fa-file-code',
                hasInput: true,
                hasOutput: false,
                parameters: [
                    { name: 'filename', label: 'Filename', type: 'text', default: 'results.json' },
                    { name: 'pretty', label: 'Pretty Print', type: 'checkbox', default: true }
                ]
            },
            'visualize': {
                name: 'Visualize',
                category: 'output',
                icon: 'fas fa-eye',
                hasInput: true,
                hasOutput: false,
                parameters: [
                    { name: 'view_type', label: 'View Type', type: 'select', options: ['3d-molecule', 'chart', 'table'], default: '3d-molecule' }
                ]
            }
        };

        return configs[type] || configs['text-input'];
    }

    generateNodeParameters(config) {
        let html = '';

        for (const param of config.parameters) {
            html += `<div class="node-param">`;
            html += `<div class="param-label">${param.label}</div>`;

            switch (param.type) {
                case 'text':
                    html += `<input type="text" class="param-input" data-param="${param.name}" placeholder="${param.placeholder || ''}" value="${param.default || ''}">`;
                    break;
                case 'number':
                    html += `<input type="number" class="param-input" data-param="${param.name}" value="${param.default || 0}" min="${param.min || 0}" max="${param.max || 99999}">`;
                    break;
                case 'textarea':
                    html += `<textarea class="param-input" data-param="${param.name}" placeholder="${param.placeholder || ''}" rows="3"></textarea>`;
                    break;
                case 'select':
                    html += `<select class="param-input" data-param="${param.name}">`;
                    for (const option of param.options) {
                        html += `<option value="${option}" ${option === param.default ? 'selected' : ''}>${option}</option>`;
                    }
                    html += `</select>`;
                    break;
                case 'checkbox':
                    html += `<input type="checkbox" class="param-input" data-param="${param.name}" ${param.default ? 'checked' : ''}>`;
                    break;
                case 'file':
                    html += `<input type="file" class="param-input" data-param="${param.name}" accept="${param.accept || '*'}">`;
                    break;
            }

            html += `</div>`;
        }

        return html;
    }

    // ============= NODE INTERACTIONS =============
    setupNodeInteractions(nodeId) {
        const node = this.nodes.get(nodeId);
        const element = node.element;
        const header = element.querySelector('.node-header');

        let isDragging = false;
        let startX, startY, initialX, initialY;

        header.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Only left click
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = node.x;
            initialY = node.y;
            element.style.cursor = 'grabbing';
            this.selectNode(nodeId);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = (e.clientX - startX) / this.zoom;
            const dy = (e.clientY - startY) / this.zoom;
            node.x = initialX + dx;
            node.y = initialY + dy;
            element.style.left = `${node.x}px`;
            element.style.top = `${node.y}px`;
            this.updateConnections();
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.cursor = 'move';
            }
        });

        // Click to select
        element.addEventListener('click', (e) => {
            if (!isDragging) {
                this.selectNode(nodeId);
            }
        });

        // Double click to edit
        element.addEventListener('dblclick', () => {
            this.editNode(nodeId);
        });
    }

    selectNode(nodeId) {
        // Deselect previous
        if (this.selectedNode) {
            const prevNode = this.nodes.get(this.selectedNode);
            if (prevNode) {
                prevNode.element.classList.remove('selected');
            }
        }

        // Select new
        this.selectedNode = nodeId;
        const node = this.nodes.get(nodeId);
        node.element.classList.add('selected');

        // Show properties
        this.showNodeProperties(nodeId);
    }

    showNodeProperties(nodeId) {
        const node = this.nodes.get(nodeId);
        const panel = document.getElementById('properties-content');

        let html = `
            <div class="property-group">
                <div class="property-group-title">Node Information</div>
                <div class="node-param">
                    <div class="param-label">Node Type</div>
                    <input type="text" class="param-input" value="${node.config.name}" disabled>
                </div>
                <div class="node-param">
                    <div class="param-label">Node ID</div>
                    <input type="text" class="param-input" value="${nodeId}" disabled>
                </div>
                <div class="node-param">
                    <div class="param-label">Status</div>
                    <input type="text" class="param-input" value="${node.status}" disabled>
                </div>
            </div>
            <div class="property-group">
                <div class="property-group-title">Parameters</div>
        `;

        // Add parameter controls
        for (const param of node.config.parameters) {
            html += `<div class="node-param">`;
            html += `<div class="param-label">${param.label}</div>`;

            switch (param.type) {
                case 'text':
                    html += `<input type="text" class="param-input" data-node="${nodeId}" data-param="${param.name}" placeholder="${param.placeholder || ''}" value="${param.default || ''}">`;
                    break;
                case 'number':
                    html += `<input type="number" class="param-input" data-node="${nodeId}" data-param="${param.name}" value="${param.default || 0}">`;
                    break;
                case 'select':
                    html += `<select class="param-input" data-node="${nodeId}" data-param="${param.name}">`;
                    for (const option of param.options) {
                        html += `<option value="${option}">${option}</option>`;
                    }
                    html += `</select>`;
                    break;
            }

            html += `</div>`;
        }

        html += `</div>`;
        panel.innerHTML = html;

        // Add event listeners to update node inputs
        panel.querySelectorAll('.param-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const nodeId = e.target.dataset.node;
                const paramName = e.target.dataset.param;
                const node = this.nodes.get(nodeId);
                node.inputs[paramName] = e.target.value;
            });
        });
    }

    deleteNode(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node) return;

        // Remove connections
        this.connections = this.connections.filter(conn =>
            conn.from !== nodeId && conn.to !== nodeId
        );

        // Remove element
        node.element.remove();

        // Remove from map
        this.nodes.delete(nodeId);

        // Deselect if selected
        if (this.selectedNode === nodeId) {
            this.selectedNode = null;
            document.getElementById('properties-content').innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--color-text-secondary);">
                    <i class="fas fa-hand-pointer" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                    <p>Select a node to view its properties</p>
                </div>
            `;
        }

        this.updateConnections();
        this.logConsole('info', `Deleted ${node.config.name} node`);
    }

    // ============= CONNECTION MANAGEMENT =============
    setupPortInteractions(port) {
        port.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            const nodeId = port.dataset.nodeId;
            const portType = port.dataset.portType;

            if (portType === 'output') {
                this.connectionStart = { nodeId, port };
                this.startTempConnection(e);
            }
        });

        port.addEventListener('mouseup', (e) => {
            e.stopPropagation();
            if (this.connectionStart) {
                const nodeId = port.dataset.nodeId;
                const portType = port.dataset.portType;

                if (portType === 'input' && this.connectionStart.nodeId !== nodeId) {
                    this.createConnection(this.connectionStart.nodeId, nodeId);
                }
            }
            this.endTempConnection();
        });
    }

    startTempConnection(e) {
        const svg = this.connectionsSvg;
        this.tempConnection = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.tempConnection.setAttribute('class', 'connection-line');
        this.tempConnection.setAttribute('stroke-dasharray', '5,5');
        svg.appendChild(this.tempConnection);

        const moveHandler = (e) => {
            if (this.tempConnection) {
                const rect = this.canvas.getBoundingClientRect();
                const endX = e.clientX - rect.left;
                const endY = e.clientY - rect.top;

                const startPort = this.connectionStart.port;
                const startRect = startPort.getBoundingClientRect();
                const startX = startRect.left + startRect.width / 2 - rect.left;
                const startY = startRect.top + startRect.height / 2 - rect.top;

                const path = this.createBezierPath(startX, startY, endX, endY);
                this.tempConnection.setAttribute('d', path);
            }
        };

        const upHandler = (e) => {
            // Find if mouse is over a port when released
            const elements = document.elementsFromPoint(e.clientX, e.clientY);
            const targetPort = elements.find(el => el.classList.contains('node-port'));

            if (targetPort && this.connectionStart) {
                const nodeId = targetPort.dataset.nodeId;
                const portType = targetPort.dataset.portType;

                // Only connect if it's an input port and different node
                if (portType === 'input' && this.connectionStart.nodeId !== nodeId) {
                    this.createConnection(this.connectionStart.nodeId, nodeId);
                }
            }

            this.endTempConnection();
            document.removeEventListener('mouseup', upHandler);
        };

        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
        this.tempConnectionMoveHandler = moveHandler;
    }

    endTempConnection() {
        if (this.tempConnection) {
            this.tempConnection.remove();
            this.tempConnection = null;
        }
        if (this.tempConnectionMoveHandler) {
            document.removeEventListener('mousemove', this.tempConnectionMoveHandler);
            this.tempConnectionMoveHandler = null;
        }
        this.connectionStart = null;
    }

    createConnection(fromNodeId, toNodeId) {
        // Check if connection already exists
        const exists = this.connections.some(conn =>
            conn.from === fromNodeId && conn.to === toNodeId
        );

        if (exists) {
            this.logConsole('warning', 'Connection already exists');
            return;
        }

        const connection = {
            id: `conn-${this.connections.length}`,
            from: fromNodeId,
            to: toNodeId,
            element: null
        };

        this.connections.push(connection);
        this.updateConnections();

        const fromNode = this.nodes.get(fromNodeId);
        const toNode = this.nodes.get(toNodeId);
        this.logConsole('success', `Connected ${fromNode.config.name} → ${toNode.config.name}`);
    }

    updateConnections() {
        const svg = this.connectionsSvg;
        const rect = this.canvas.getBoundingClientRect();

        // Clear existing paths
        svg.querySelectorAll('.connection-line').forEach(path => path.remove());

        // Redraw all connections
        for (const conn of this.connections) {
            const fromNode = this.nodes.get(conn.from);
            const toNode = this.nodes.get(conn.to);

            if (!fromNode || !toNode) continue;

            const fromPort = fromNode.element.querySelector('.node-port.output');
            const toPort = toNode.element.querySelector('.node-port.input');

            if (!fromPort || !toPort) continue;

            const fromRect = fromPort.getBoundingClientRect();
            const toRect = toPort.getBoundingClientRect();

            const startX = fromRect.left + fromRect.width / 2 - rect.left;
            const startY = fromRect.top + fromRect.height / 2 - rect.top;
            const endX = toRect.left + toRect.width / 2 - rect.left;
            const endY = toRect.top + toRect.height / 2 - rect.top;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('class', 'connection-line');
            path.setAttribute('d', this.createBezierPath(startX, startY, endX, endY));
            path.dataset.connectionId = conn.id;

            // Click to delete connection
            path.style.pointerEvents = 'stroke';
            path.addEventListener('click', () => {
                this.deleteConnection(conn.id);
            });

            svg.appendChild(path);
            conn.element = path;
        }
    }

    createBezierPath(x1, y1, x2, y2) {
        const dx = Math.abs(x2 - x1);
        const controlPointOffset = Math.min(dx * 0.5, 100);

        return `M ${x1} ${y1} C ${x1 + controlPointOffset} ${y1}, ${x2 - controlPointOffset} ${y2}, ${x2} ${y2}`;
    }

    deleteConnection(connectionId) {
        this.connections = this.connections.filter(conn => conn.id !== connectionId);
        this.updateConnections();
        this.logConsole('info', 'Connection deleted');
    }

    // ============= CANVAS INTERACTIONS =============
    setupCanvasInteraction() {
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.target === this.canvas && e.button === 0) {
                this.isPanning = true;
                this.panStartX = e.clientX - this.panX;
                this.panStartY = e.clientY - this.panY;
                this.canvas.style.cursor = 'grabbing';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                this.panX = e.clientX - this.panStartX;
                this.panY = e.clientY - this.panStartY;
                this.canvas.style.transform = `translate(${this.panX}px, ${this.panY}px)`;
                this.updateConnections();
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isPanning) {
                this.isPanning = false;
                this.canvas.style.cursor = 'grab';
            }
        });

        // Zoom with mouse wheel
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.setZoom(this.zoom + delta);
        });
    }

    setZoom(newZoom) {
        this.zoom = Math.max(0.25, Math.min(2, newZoom));
        document.getElementById('zoom-level').textContent = `${Math.round(this.zoom * 100)}%`;

        // Update all nodes
        this.nodes.forEach(node => {
            node.element.style.transform = `scale(${this.zoom})`;
        });

        this.updateConnections();
    }

    setupZoomControls() {
        document.getElementById('zoom-in').addEventListener('click', () => {
            this.setZoom(this.zoom + 0.1);
        });

        document.getElementById('zoom-out').addEventListener('click', () => {
            this.setZoom(this.zoom - 0.1);
        });

        document.getElementById('zoom-reset').addEventListener('click', () => {
            this.setZoom(1);
            this.panX = 0;
            this.panY = 0;
            this.canvas.style.transform = 'translate(0, 0)';
            this.updateConnections();
        });
    }

    // ============= KEYBOARD SHORTCUTS =============
    // Helper function to check if user is typing in an input field
    isUserTyping() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable
        );
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Delete node - BUT NOT when typing in an input/textarea
            if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedNode) {
                // Only delete node if NOT typing
                if (!this.isUserTyping()) {
                    e.preventDefault();
                    this.deleteNode(this.selectedNode);
                }
            }

            // Copy (Ctrl/Cmd + C) - NOT when typing
            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && this.selectedNode) {
                if (!this.isUserTyping()) {
                    e.preventDefault();
                    this.copyNode();
                }
            }

            // Paste (Ctrl/Cmd + V) - NOT when typing
            if ((e.ctrlKey || e.metaKey) && e.key === 'v' && this.clipboard) {
                if (!this.isUserTyping()) {
                    e.preventDefault();
                    this.pasteNode();
                }
            }

            // Save (Ctrl/Cmd + S) - Allow even when typing (always want to save)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveWorkflow();
            }

            // Select All (Ctrl/Cmd + A) - NOT when typing
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                if (!this.isUserTyping()) {
                    e.preventDefault();
                    // TODO: Select all nodes
                }
            }
        });
    }

    copyNode() {
        if (!this.selectedNode) return;
        const node = this.nodes.get(this.selectedNode);
        this.clipboard = {
            type: node.type,
            inputs: { ...node.inputs }
        };
        this.logConsole('info', 'Node copied to clipboard');
    }

    pasteNode() {
        if (!this.clipboard) return;
        const x = 100 + Math.random() * 100;
        const y = 100 + Math.random() * 100;
        const newNodeId = this.createNode(this.clipboard.type, x, y);
        const newNode = this.nodes.get(newNodeId);
        newNode.inputs = { ...this.clipboard.inputs };
        this.logConsole('info', 'Node pasted');
    }

    // ============= CONTEXT MENU =============
    setupContextMenu() {
        const menu = document.getElementById('context-menu');

        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();

            // Check if right-clicked on a node
            const nodeElement = e.target.closest('.workflow-node');
            if (nodeElement) {
                this.selectNode(nodeElement.id);
                menu.style.left = `${e.clientX}px`;
                menu.style.top = `${e.clientY}px`;
                menu.classList.add('active');
            }
        });

        // Close menu on click outside
        document.addEventListener('click', () => {
            menu.classList.remove('active');
        });

        // Menu actions
        menu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleContextMenuAction(action);
                menu.classList.remove('active');
            });
        });
    }

    handleContextMenuAction(action) {
        switch (action) {
            case 'copy':
                this.copyNode();
                break;
            case 'paste':
                this.pasteNode();
                break;
            case 'duplicate':
                this.copyNode();
                this.pasteNode();
                break;
            case 'delete':
                if (this.selectedNode) {
                    this.deleteNode(this.selectedNode);
                }
                break;
        }
    }

    // ============= EXECUTION CONTROLS =============
    setupExecutionControls() {
        document.getElementById('execute-btn').addEventListener('click', () => {
            this.executeWorkflow();
        });

        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveWorkflow();
        });

        document.getElementById('load-btn').addEventListener('click', () => {
            this.loadWorkflow();
        });

        document.getElementById('clear-btn').addEventListener('click', () => {
            if (confirm('Clear entire workflow?')) {
                this.clearWorkflow();
            }
        });

        // Console controls
        document.getElementById('console-close').addEventListener('click', () => {
            document.getElementById('execution-console').classList.remove('open');
        });
    }

    executeWorkflow() {
        this.logConsole('info', '🚀 Starting workflow execution...');
        document.getElementById('execution-console').classList.add('open');
        document.getElementById('execution-progress').classList.add('active');

        if (typeof window.workflowExecutor !== 'undefined') {
            const workflowData = this.serializeWorkflow();
            window.workflowExecutor.execute(workflowData);
        } else {
            this.logConsole('error', 'Workflow executor not found');
        }
    }

    saveWorkflow() {
        const workflow = this.serializeWorkflow();
        const workflowName = document.getElementById('workflow-name').value;
        workflow.name = workflowName;

        const json = JSON.stringify(workflow, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${workflowName.replace(/\s+/g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.logConsole('success', `Workflow "${workflowName}" saved`);
    }

    loadWorkflow() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const workflow = JSON.parse(e.target.result);
                    this.deserializeWorkflow(workflow);
                    this.logConsole('success', `Workflow "${workflow.name}" loaded`);
                } catch (error) {
                    this.logConsole('error', `Failed to load workflow: ${error.message}`);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    clearWorkflow() {
        this.nodes.forEach((node, id) => {
            node.element.remove();
        });
        this.nodes.clear();
        this.connections = [];
        this.updateConnections();
        this.selectedNode = null;
        this.nodeIdCounter = 0;
        this.logConsole('info', 'Workflow cleared');
    }

    serializeWorkflow() {
        const nodes = [];
        this.nodes.forEach((node, id) => {
            nodes.push({
                id: node.id,
                type: node.type,
                x: node.x,
                y: node.y,
                inputs: node.inputs
            });
        });

        return {
            name: document.getElementById('workflow-name').value,
            nodes: nodes,
            connections: this.connections.map(conn => ({
                from: conn.from,
                to: conn.to
            })),
            version: '1.0.0'
        };
    }

    deserializeWorkflow(workflow) {
        this.clearWorkflow();

        if (workflow.name) {
            document.getElementById('workflow-name').value = workflow.name;
        }

        // Create nodes
        const nodeIdMap = new Map();
        for (const nodeData of workflow.nodes) {
            const newId = this.createNode(nodeData.type, nodeData.x, nodeData.y);
            nodeIdMap.set(nodeData.id, newId);
            const node = this.nodes.get(newId);
            node.inputs = nodeData.inputs || {};
        }

        // Create connections
        for (const conn of workflow.connections) {
            const fromId = nodeIdMap.get(conn.from);
            const toId = nodeIdMap.get(conn.to);
            if (fromId && toId) {
                this.createConnection(fromId, toId);
            }
        }

        this.updateConnections();
    }

    // ============= UTILITIES =============
    updateSVGSize() {
        const rect = this.canvas.getBoundingClientRect();
        this.connectionsSvg.setAttribute('width', rect.width);
        this.connectionsSvg.setAttribute('height', rect.height);
        this.updateConnections();
    }

    logConsole(level, message) {
        const console = document.getElementById('console-body');
        const time = new Date().toLocaleTimeString();
        const log = document.createElement('div');
        log.className = 'console-log';
        log.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="log-level ${level}">[${level.toUpperCase()}]</span>
            <span class="log-message">${message}</span>
        `;
        console.appendChild(log);
        console.scrollTop = console.scrollHeight;
    }

    setNodeStatus(nodeId, status) {
        const node = this.nodes.get(nodeId);
        if (!node) return;

        node.status = status;
        const element = node.element;
        const statusDot = element.querySelector('.node-status');

        // Remove all status classes
        element.classList.remove('executing', 'completed', 'error');
        statusDot.classList.remove('executing', 'completed', 'error');

        // Add new status
        if (status === 'executing' || status === 'completed' || status === 'error') {
            element.classList.add(status);
            statusDot.classList.add(status);
        }
    }

    setConnectionActive(fromId, toId, active) {
        const conn = this.connections.find(c => c.from === fromId && c.to === toId);
        if (conn && conn.element) {
            if (active) {
                conn.element.classList.add('active');
            } else {
                conn.element.classList.remove('active');
            }
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CanvasEngine;
}
