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
            preserveObjectStacking: true,
            width: widthPx,
            height: heightPx
        });

        // Make canvas responsive
        this.makeCanvasResponsive();
        
        this.afterCanvasInit();
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

//    handleImageDrop(file, e) {
//        const reader = new FileReader();
//        const canvas = this.canvas;
//        const zoom = canvas.getZoom();
//
//        // Get drop coordinates relative to canvas
//        const rect = canvas.getElement().getBoundingClientRect();
//        const x = (e.clientX - rect.left) / zoom;
//        const y = (e.clientY - rect.top) / zoom;
//
//        reader.onload = (event) => {
//            // Find the drop zone that was dropped on
//            const dropZone = this.findDropZone(x, y);
//            if (dropZone) {
//                // Remove existing image in this zone if any
//                this.clearDropZone(dropZone.id);
//
//                // Create new image
//                fabric.Image.fromURL(event.target.result, (img) => {
//                    // Create a clipping rect
//                    const clipRect = new fabric.Rect({
//                        left: dropZone.left,
//                        top: dropZone.top,
//                        width: dropZone.width,
//                        height: dropZone.height,
//                        absolutePositioned: true
//                    });
//
//                    // Calculate scaling to fit image within drop zone
//                    const scaleX = dropZone.width / img.width;
//                    const scaleY = dropZone.height / img.height;
//                    const scale = Math.max(scaleX, scaleY); // Use max to cover the area
//
//                    // Set image properties
//                    img.set({
//                        left: dropZone.left,
//                        top: dropZone.top,
//                        scaleX: scale,
//                        scaleY: scale,
//                        clipPath: clipRect,
//                        dropzoneId: dropZone.id,
//                        selectable: true
//                    });
//
//                    // Center the image within the clip area
//                    const scaledWidth = img.width * scale;
//                    const scaledHeight = img.height * scale;
//
//                    img.set({
//                        left: dropZone.left + (dropZone.width - scaledWidth) / 2,
//                        top: dropZone.top + (dropZone.height - scaledHeight) / 2
//                    });
//
//                    // Add movement constraints
//                    img.on('moving', function(e) {
//                        const currentLeft = this.left;
//                        const currentTop = this.top;
//                        const maxLeft = dropZone.left;
//                        const maxTop = dropZone.top;
//                        const minLeft = dropZone.left - (scaledWidth - dropZone.width);
//                        const minTop = dropZone.top - (scaledHeight - dropZone.height);
//
//                        // Constrain horizontal movement
//                        if (currentLeft > maxLeft) this.set('left', maxLeft);
//                        if (currentLeft < minLeft) this.set('left', minLeft);
//
//                        // Constrain vertical movement
//                        if (currentTop > maxTop) this.set('top', maxTop);
//                        if (currentTop < minTop) this.set('top', minTop);
//                    });
//
//                    // Add the image to canvas
//                    canvas.add(img);
//                    canvas.renderAll();
//
//                    // Remove the placeholder text
//                    const text = canvas.getObjects().find(obj => 
//                        obj.id === `droptext_${dropZone.id.split('_')[1]}`
//                    );
//                    if (text) {
//                        canvas.remove(text);
//                    }
//                });
//            }
//        };
//
//        reader.readAsDataURL(file);
//    }

    handleImageDrop(file, e) {
        const reader = new FileReader();
        const canvas = this.canvas;
        const zoom = canvas.getZoom();

        const rect = canvas.getElement().getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;

        reader.onload = (event) => {
            const dropZone = this.findDropZone(x, y);
            if (dropZone) {
                this.clearDropZone(dropZone.id);

                fabric.Image.fromURL(event.target.result, (img) => {
                    // Create a clipping rect
                    const clipRect = new fabric.Rect({
                        left: dropZone.left,
                        top: dropZone.top,
                        width: dropZone.getScaledWidth(),
                        height: dropZone.getScaledHeight(),
                        absolutePositioned: true
                    });

                    // Calculate scaling to fit image within drop zone
                    const scaleX = dropZone.getScaledWidth() / img.width;
                    const scaleY = dropZone.getScaledHeight() / img.height;
                    const scale = Math.max(scaleX, scaleY);

                    // Set image properties
                    img.set({
                        left: dropZone.left,
                        top: dropZone.top,
                        scaleX: scale,
                        scaleY: scale,
                        clipPath: clipRect,
                        dropzoneId: dropZone.id,
                        selectable: false // Initially not selectable
                    });

                    // Center the image
                    const scaledWidth = img.width * scale;
                    const scaledHeight = img.height * scale;

                    img.set({
                        left: dropZone.left + (dropZone.width - scaledWidth) / 2,
                        top: dropZone.top + (dropZone.height - scaledHeight) / 2
                    });

                    // Add the image to canvas
                    canvas.add(img);

                    // Update dropzone properties
                    dropZone.set({
                        fill: 'transparent',
                        stroke: '#cccccc',
                        strokeWidth: 1,
                        selectable: true,
                        hasControls: true,
                        hasBorders: true,
                        lockRotation: true,
                        hoverCursor: 'pointer'
                    });

                    // Keep dropzone above image
//                    canvas.bringToFront(dropZone);

                    // Add double click handler to dropzone
//                    dropZone.on('mousedblclick', function() {
//                        const image = canvas.getObjects().find(obj => 
//                            obj.dropzoneId === this.id && obj.type === 'image'
//                        );
//
//                        if (image) {
//                            // Toggle image selectability
//                            const isSelectable = !image.selectable;
//                            image.set({
//                                selectable: isSelectable,
//                                hoverCursor: isSelectable ? 'move' : 'default'
//                            });
//
//                            // Add movement constraints when image is selectable
//                            if (isSelectable) {
//                                image.on('moving', function(e) {
//                                    const currentLeft = this.left;
//                                    const currentTop = this.top;
//                                    const dropZone = canvas.getObjects().find(obj => 
//                                        obj.id === this.dropzoneId
//                                    );
//
//                                    if (dropZone) {
//                                        const maxLeft = dropZone.left;
//                                        const maxTop = dropZone.top;
//                                        const minLeft = dropZone.left - (scaledWidth - dropZone.width);
//                                        const minTop = dropZone.top - (scaledHeight - dropZone.height);
//
//                                        // Constrain horizontal movement
//                                        if (currentLeft > maxLeft) this.set('left', maxLeft);
//                                        if (currentLeft < minLeft) this.set('left', minLeft);
//
//                                        // Constrain vertical movement
//                                        if (currentTop > maxTop) this.set('top', maxTop);
//                                        if (currentTop < minTop) this.set('top', minTop);
//                                    }
//                                });
//                            }
//
//                            canvas.renderAll();
//                        }
//                    });

                    // Add scaling handler to dropzone
//                    dropZone.on('scaling', function() {
//                        const image = canvas.getObjects().find(obj => 
//                            obj.dropzoneId === this.id && obj.type === 'image'
//                        );
//
//                        if (image && image.clipPath) {
//                            // Update clip path dimensions
//                            image.clipPath.set({
//                                width: this.getScaledWidth(),
//                                height: this.getScaledHeight(),
//                                left: this.left,
//                                top: this.top
//                            });
//
//                            // Recalculate image scale
//                            const newScaleX = this.getScaledWidth() / image.width;
//                            const newScaleY = this.getScaledHeight() / image.height;
//                            const newScale = Math.max(newScaleX, newScaleY);
//
//                            // Update image position and scale
//                            image.set({
//                                scaleX: newScale,
//                                scaleY: newScale,
//                                left: this.left + (this.getScaledWidth() - (image.width * newScale)) / 2,
//                                top: this.top + (this.getScaledHeight() - (image.height * newScale)) / 2
//                            });
//                        }
//                    });

                    // Add moving handler to dropzone
//                    dropZone.on('moving', function() {
//                        const image = canvas.getObjects().find(obj => 
//                            obj.dropzoneId === this.id && obj.type === 'image'
//                        );
//
//                        if (image && image.clipPath) {
//                            // Update clip path position
//                            image.clipPath.set({
//                                left: this.left,
//                                top: this.top
//                            });
//
//                            // Move image with dropzone
//                            const offsetX = image.left - (image.clipPath.left + (image.clipPath.width - image.width * image.scaleX) / 2);
//                            const offsetY = image.top - (image.clipPath.top + (image.clipPath.height - image.height * image.scaleY) / 2);
//
//                            image.set({
//                                left: this.left + offsetX,
//                                top: this.top + offsetY
//                            });
//                        }
//                    });

                    canvas.renderAll();

                    // Remove placeholder text if it exists
//                    const text = canvas.getObjects().find(obj => 
//                        obj.id === `droptext_${dropZone.id.split('_')[1]}`
//                    );
//                    if (text) {
//                        canvas.remove(text);
//                    }
                });
            }
        };

        reader.readAsDataURL(file);
    }


    addImageLayer() {
        
         // Check if canvas exists and is initialized
        if (!this.canvas || !this.canvas.getElement()) {
            alert('Please create a canvas first');
            return;
        }
        
        const canvasCenter = this.canvas.getCenter();
        const size = 200;

        // Find the highest existing index
        const objects = this.canvas.getObjects();
        let maxIndex = 0;
        objects.forEach(obj => {
            if (obj.id && obj.id.startsWith('dropzone_')) {
                const index = parseInt(obj.id.split('_')[1]);
                if (!isNaN(index) && index > maxIndex) {
                    maxIndex = index;
                }
            }
        });
        const newIndex = maxIndex + 1;

        const imageLayer = new fabric.Rect({
            left: canvasCenter.left - size/2,
            top: canvasCenter.top - size/2,
            width: size,
            height: size,
            fill: '#e0e0e0',
            stroke: '#cccccc',
            strokeWidth: 1,
            strokeDashArray: [5, 5],
            selectable: true,
            hasControls: true,
            hasBorders: true,
            lockRotation: true,
            transparentCorners: false,
            cornerColor: '#333333',
            cornerSize: 10,
            cornerStyle: 'circle',
            // Add these properties to make it work as a drop zone
            id: `dropzone_${newIndex}`, // Index-based ID
            type: 'rect'
        });

        imageLayer.set( 'top', canvasCenter.top - imageLayer.height/2 );
        this.canvas.add(imageLayer);
        this.canvas.setActiveObject(imageLayer);
        this.canvas.renderAll();

        // Log to verify the object is created correctly
        console.log('Added new drop zone:', imageLayer);
    }
    
    addTextLayer() {
        if (!this.canvas || !this.canvas.getElement()) {
            alert('Please create a canvas first');
            return;
        }
        const canvasCenter = this.canvas.getCenter();
        const size = 200;
        const textLayer = new fabric.Textbox('Double click to edit', {
            left: canvasCenter.left - size/2,
            top: canvasCenter.top - size/2,
            width: size,
            fontSize: 20,
            fontFamily: 'Arial',
            fill: '#000000',
            padding: 10,
            borderColor: '#000000',
            cornerColor: '#000000',
            cornerSize: 6,
            transparentCorners: false,
            hasControls: true,
            hasBorders: true,
            selectable: true,
            textAlign:'center'
        });
        textLayer.set( 'top', canvasCenter.top - textLayer.height/2 );
        this.canvas.add(textLayer);
        this.canvas.setActiveObject(textLayer);
        this.canvas.renderAll();
    }
    
    findDropZone(x, y) {
        const objects = this.canvas.getObjects();
        return objects.find(obj => {
            if (obj.type === 'rect' && obj.id && obj.id.startsWith('dropzone_')) {
                console.log( 'obj:', obj );
                // Get the object's current dimensions and position
                const objWidth = obj.getScaledWidth();
                const objHeight = obj.getScaledHeight();
                const objLeft = obj.left;
                const objTop = obj.top;
    
                // Check if the point is within the object's bounds
                return x >= objLeft && 
                       x <= objLeft + objWidth && 
                       y >= objTop && 
                       y <= objTop + objHeight;
            }
            return false;
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
        this.setupSelectionInfo();
    }

    afterCanvasInit() {
        // Disable rotation for all objects
        fabric.Object.prototype.lockRotation = true;

        // Remove the rotation control (mtr) for all objects
        fabric.Object.prototype.controls = {
            ...fabric.Object.prototype.controls,
            mtr: new fabric.Control({ visible: false })
        };

        // If you want to specifically apply to text objects
        fabric.Textbox.prototype.controls = {
            ...fabric.Textbox.prototype.controls,
            mtr: new fabric.Control({ visible: false })
        };

        // For images, you might want to add this as well
        fabric.Image.prototype.controls = {
            ...fabric.Image.prototype.controls,
            mtr: new fabric.Control({ visible: false })
        };

    }

    setupSelectionInfo() {
        // Get references to input fields
        const layerXInput = document.getElementById('layer-x');
        const layerYInput = document.getElementById('layer-y');
        const layerWInput = document.getElementById('layer-w');
        const layerHInput = document.getElementById('layer-h');

        // Add input event listeners to update object when values change
        [layerXInput, layerYInput, layerWInput, layerHInput].forEach(input => {
            input.addEventListener('change', () => {
                const activeObject = this.canvas.getActiveObject();
                if (activeObject) {
                    const newX = parseFloat(layerXInput.value);
                    const newY = parseFloat(layerYInput.value);
                    const newW = parseFloat(layerWInput.value);
                    const newH = parseFloat(layerHInput.value);

                    // Update object properties
                    activeObject.set({
                        left: newX,
                        top: newY,
                        scaleX: newW / activeObject.width,
                        scaleY: newH / activeObject.height
                    });

                    // If there's a clipPath, update it too
                    if (activeObject.clipPath) {
                        activeObject.clipPath.set({
                            left: newX,
                            top: newY,
                            width: newW,
                            height: newH
                        });
                    }

                    this.canvas.renderAll();
                }
            });
        });

        // Update input fields when selection changes
        this.canvas.on('selection:created', this.updateSelectionInfo.bind(this));
        this.canvas.on('selection:updated', this.updateSelectionInfo.bind(this));
        this.canvas.on('selection:cleared', () => {
            // Clear inputs when nothing is selected
            layerXInput.value = '';
            layerYInput.value = '';
            layerWInput.value = '';
            layerHInput.value = '';
        });

        // Update during object modification
        this.canvas.on('object:moving', this.updateSelectionInfo.bind(this));
        this.canvas.on('object:scaling', this.updateSelectionInfo.bind(this));
    }

    updateSelectionInfo() {
        const selectedObject = this.canvas.getActiveObject();
        console.info(selectedObject);
        if (selectedObject) {
            // Get references to input fields
            const layerXInput = document.getElementById('layer-x');
            const layerYInput = document.getElementById('layer-y');
            const layerWInput = document.getElementById('layer-w');
            const layerHInput = document.getElementById('layer-h');

            // Update input values
            layerXInput.value = Math.round(selectedObject.left);
            layerYInput.value = Math.round(selectedObject.top);
            layerWInput.value = Math.round(selectedObject.getScaledWidth());
            layerHInput.value = Math.round(selectedObject.getScaledHeight());
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
    window.app = new PhotoLab();
});
