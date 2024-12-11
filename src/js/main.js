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

//    applyTemplate(templateId) {
//        if (!this.canvas) {
//            this.createNewCanvas();
//        }
//
//        // Clear existing objects
//        this.canvas.clear();
//        this.canvas.backgroundColor = 'white';
//
//        const template = this.templates[templateId];
//        const canvasWidth = this.canvas.getWidth();
//        const canvasHeight = this.canvas.getHeight();
//
//        template.layout.forEach((area) => {
//            // Calculate actual dimensions
//            console.log( typeof area.left, area.left, area.top, area.width, area.height );
//            const left = area.left <= 1 ? area.left * canvasWidth : area.left;
//            const top = area.top <= 1 ? area.top * canvasHeight : area.top;
//            const width = area.width * canvasWidth;
//            const height = area.height * canvasHeight;
//
//            // Create placeholder rectangle
//            const rect = new fabric.Rect({
//                left: left,
//                top: top,
//                width: width,
//                height: height,
//                fill: '#e0e0e0',
//                stroke: '#cccccc',
//                strokeWidth: 1,
//                selectable: false
//            });
//
//
//            // Add image area to canvas
//            this.canvas.add(rect);
//        });
//
//        this.canvas.renderAll();
//    }
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

        template.layout.forEach((area, index) => {
            // Calculate actual dimensions
            const left = area.left <= 1 ? area.left * canvasWidth : area.left;
            const top = area.top <= 1 ? area.top * canvasHeight : area.top;
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
                selectable: false,
                id: `dropzone_${index}` // Add identifier
            });

            this.canvas.add(rect);
        });

        this.setupDropZone();
        this.canvas.renderAll();
    }

    setupDropZone() {
        const canvasEl = this.canvas.getElement();
        const parent = canvasEl.parentElement;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            parent.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Handle drop event
        parent.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    this.handleImageDrop(file, e);
                }
            }
        });

        // Highlight drop zone on drag over
        parent.addEventListener('dragover', (e) => {
            parent.classList.add('drag-over');
        });

        parent.addEventListener('dragleave', (e) => {
            parent.classList.remove('drag-over');
        });
    }

    handleImageDrop(file, e) {
        const reader = new FileReader();
        const canvas = this.canvas;
        const zoom = canvas.getZoom();
        
        // Get drop coordinates relative to canvas
        const rect = canvas.getElement().getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;
    
        reader.onload = (event) => {
            fabric.Image.fromURL(event.target.result, (img) => {
                // Find the drop zone that was dropped on
                const dropZone = this.findDropZone(x, y);
                if (dropZone) {
                    // Remove existing image in this zone if any
                    this.clearDropZone(dropZone.id);
                    
                    // Create a clipping rect
                    const clipRect = new fabric.Rect({
                        left: 0,
                        top: 0,
                        width: dropZone.width,
                        height: dropZone.height,
                        absolutePositioned: true
                    });
    
                    // Fit and clip image to drop zone
                    this.fitImageToZone(img, dropZone, clipRect);
                    canvas.renderAll();
                }
            });
        };
    
        reader.readAsDataURL(file);
    }

    findDropZone(x, y) {
        const objects = this.canvas.getObjects();
        return objects.find(obj => {
            return obj.type === 'rect' && 
                   obj.id && 
                   obj.id.startsWith('dropzone_') &&
                   x >= obj.left && 
                   x <= obj.left + obj.width &&
                   y >= obj.top && 
                   y <= obj.top + obj.height;
        });
    }

    clearDropZone(dropzoneId) {
        const index = dropzoneId.split('_')[1];
        const objects = this.canvas.getObjects();

        // Remove any existing images in this zone
        objects.forEach(obj => {
            if (obj.dropzoneId === dropzoneId) {
                this.canvas.remove(obj);
            }
        });

        // Remove the placeholder text
        const text = objects.find(obj => obj.id === `droptext_${index}`);
        if (text) {
            this.canvas.remove(text);
        }
    }

    fitImageToZone(img, dropZone) {
        // Calculate scaling to fit image within drop zone
        const scaleX = dropZone.width / img.width;
        const scaleY = dropZone.height / img.height;
        const scale = Math.min(scaleX, scaleY);

        // Center image in drop zone
        img.set({
            left: dropZone.left,
            top: dropZone.top,
            scaleX: scale,
            scaleY: scale,
            dropzoneId: dropZone.id, // Mark image with its drop zone
            selectable: true,
            lockMovementX: true,
            lockMovementY: true
        });
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
                icon: './src/assets/template-icons/template-1.png',
                layout: [
                    {
                        left: 0.04,
                        top: 0.04,
                        width: 0.24,
                        height: 0.64
                    },
                    {
                        left: 0.04,
                        top: 0.72,
                        width: 0.14,
                        height: 0.26
                    },
                    {
                        left: 0.2,
                        top: 0.72,
                        width: 0.08,
                        height: 0.26
                    },
                    {
                        left: 0.32,
                        top: 0.04,
                        width: 0.64,
                        height: 0.94
                    }
                ]
            },
            t2: {
                name: 'Template 2',
                icon: './src/assets/template-icons/template-1.png',
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
