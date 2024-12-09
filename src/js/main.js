class PhotoLab {
    constructor() {
        this.canvas = null;
        this.DPI = 96;
        this.templates = this.defineTemplates(); // Add this line
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.widthInput = document.getElementById('canvasWidth');
        this.heightInput = document.getElementById('canvasHeight');
        this.createButton = document.getElementById('createCanvas');
        this.templateList = document.querySelector('.template-list');
        this.initializeTemplateList();
    }

    initializeTemplateList() {
        Object.entries(this.templates).forEach(([id, template]) => {
            const button = document.createElement('button');
            button.className = 'template-button';
            button.setAttribute('data-template', id);

            // Create icon container
            const iconContainer = document.createElement('div');
            iconContainer.className = 'template-icon';

            // Add template icon image
            const icon = document.createElement('img');
            icon.src = template.icon;
            icon.alt = template.name;
            iconContainer.appendChild(icon);

            // Add template name below icon
            const nameSpan = document.createElement('span');
            nameSpan.className = 'template-name';
            nameSpan.textContent = template.name;

            button.appendChild(iconContainer);
            button.appendChild(nameSpan);

            this.templateList.appendChild(button);
        });
    }

    setupEventListeners() {
        this.createButton.addEventListener('click', () => this.createNewCanvas());
        
        this.templateList.addEventListener('click', (e) => {
            if (e.target.classList.contains('template-button')) {
                const templateId = e.target.getAttribute('data-template');
                this.applyTemplate(templateId);
                
                // Update active state
                document.querySelectorAll('.template-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
            }
        });
    }
    
    createNewCanvas() {
        // Convert inches to pixels (1 inch = 96 pixels)
        const widthInches = parseFloat(this.widthInput.value);
        const heightInches = parseFloat(this.heightInput.value);
        
        const widthPx = Math.round(widthInches * this.DPI);
        const heightPx = Math.round(heightInches * this.DPI);

        // Dispose of existing canvas if it exists
        if (this.canvas) {
            this.canvas.dispose();
        }

        // Create new canvas
        this.canvas = new fabric.Canvas('photo-canvas', {
            backgroundColor: 'white',
            width: widthPx,
            height: heightPx
        });

        // Make canvas responsive
        this.makeCanvasResponsive();
    }

    applyTemplate(templateId) {
        if (!this.canvas) {
            this.createNewCanvas();
        }

        // Clear existing objects
        this.canvas.clear();
        this.canvas.backgroundColor = 'white';

        const template = this.templates[templateId];
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();

        template.layout.forEach((area) => {
            // Calculate actual dimensions
            const left = typeof area.left === 'number' ? area.left : area.left * canvasWidth;
            const top = typeof area.top === 'number' ? area.top : area.top * canvasHeight;
            const width = area.width * canvasWidth;
            const height = area.height * canvasHeight;

            // Create placeholder rectangle
            const rect = new fabric.Rect({
                left: left,
                top: top,
                width: width,
                height: height,
                fill: '#e0e0e0',
                stroke: '#cccccc',
                strokeWidth: 1,
                selectable: false
            });


            // Add image area to canvas
            this.canvas.add(rect);
        });

        this.canvas.renderAll();
    }

    makeCanvasResponsive() {
        const container = document.querySelector('.canvas-container');
        const containerWidth = container.offsetWidth - 40; // Subtract padding
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();

        if (canvasWidth > containerWidth) {
            const scale = containerWidth / canvasWidth;
            this.canvas.setZoom(scale);
            this.canvas.setDimensions({
                width: canvasWidth * scale,
                height: canvasHeight * scale
            });
        }
    }
    
    defineTemplates() {
        return {
            t1: {
                name: 'Template 1',
                icon: './assets/template-icons/template-1.png',
                layout: [
                    { left: .04, top: 10, width: 0.24, height: 0.64 },
                    { left: .32, top: 10, width: 0.64, height: 0.94 },
                    { left: 10, top: 10, width: 0.14, height: 0.3 },
                    { left: 10, top: 10, width: 0.1, height: 0.3 }
                ]
            },
            t2: {
                name: 'Template 2',
                icon: './assets/template-icons/template-1.png',
                layout: [
                    { left: 10, top: 10, width: 0.47, height: 0.95 },
                    { left: 0.52, top: 10, width: 0.47, height: 0.95 }
                ]
            }
        };
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new PhotoLab();
});
