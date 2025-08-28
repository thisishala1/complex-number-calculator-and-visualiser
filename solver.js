// Enhanced Complex Number Visualizer with Mobile Support
class ComplexVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.scale = 30;
        this.complexNumbers = [];
        this.animationId = null;
        this.showGrid = true;
        this.showPolar = false;
        this.showTrail = false;
        this.trail = [];
        
        // Touch and mobile support
        this.lastTouchDistance = 0;
        this.isTouch = false;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.drawComplexPlane();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.drawComplexPlane();
            this.plotAllNumbers();
        });
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = Math.min(containerWidth * 0.75, window.innerHeight * 0.6);
        
        // Set canvas size based on device pixel ratio for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = containerWidth * dpr;
        this.canvas.height = containerHeight * dpr;
        
        // Scale the canvas back down using CSS
        this.canvas.style.width = containerWidth + 'px';
        this.canvas.style.height = containerHeight + 'px';
        
        // Scale the drawing context so everything draws at the higher resolution
        this.ctx.scale(dpr, dpr);
        
        // Update center coordinates
        this.centerX = containerWidth / 2;
        this.centerY = containerHeight / 2;
        
        // Adjust scale based on canvas size
        this.scale = Math.min(containerWidth, containerHeight) / 20;
    }

    setupEventListeners() {
        // Mouse interaction for adding points
        this.canvas.addEventListener("click", (e) => {
            if (!this.isTouch) {
                this.handlePointAdd(e);
            }
        });

        // Touch events for mobile
        this.canvas.addEventListener("touchstart", (e) => {
            e.preventDefault();
            this.isTouch = true;
            
            if (e.touches.length === 1) {
                // Single touch - add point after a delay to distinguish from scroll
                this.touchTimeout = setTimeout(() => {
                    this.handlePointAdd(e.touches[0]);
                }, 200);
            } else if (e.touches.length === 2) {
                // Two finger touch - prepare for zoom
                clearTimeout(this.touchTimeout);
                this.lastTouchDistance = this.getTouchDistance(e.touches);
            }
        });

        this.canvas.addEventListener("touchmove", (e) => {
            e.preventDefault();
            
            if (e.touches.length === 2) {
                // Pinch to zoom
                clearTimeout(this.touchTimeout);
                const currentDistance = this.getTouchDistance(e.touches);
                const zoomFactor = currentDistance / this.lastTouchDistance;
                
                this.scale *= zoomFactor;
                this.scale = Math.max(5, Math.min(100, this.scale));
                this.lastTouchDistance = currentDistance;
                
                this.drawComplexPlane();
                this.plotAllNumbers();
            }
        });

        this.canvas.addEventListener("touchend", (e) => {
            e.preventDefault();
            clearTimeout(this.touchTimeout);
            
            // Reset touch state after a delay
            setTimeout(() => {
                this.isTouch = false;
            }, 300);
        });

        // Mouse wheel zoom
        this.canvas.addEventListener("wheel", (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.scale *= zoomFactor;
            this.scale = Math.max(5, Math.min(100, this.scale));
            this.drawComplexPlane();
            this.plotAllNumbers();
        });

        // Prevent context menu on long press
        this.canvas.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
    }

    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    handlePointAdd(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (event.clientX || event.pageX) - rect.left;
        const y = (event.clientY || event.pageY) - rect.top;
        
        const real = (x - this.centerX) / this.scale;
        const imag = -(y - this.centerY) / this.scale;
        
        this.addComplexNumber(real, imag);
        this.updateInputFields(real, imag);
        this.updateResults(real, imag);
    }

    drawComplexPlane() {
        const canvasWidth = this.canvas.style.width ? parseInt(this.canvas.style.width) : this.canvas.width;
        const canvasHeight = this.canvas.style.height ? parseInt(this.canvas.style.height) : this.canvas.height;
        
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Background gradient
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, Math.max(canvasWidth, canvasHeight)
        );
        gradient.addColorStop(0, "#1a1a2e");
        gradient.addColorStop(1, "#16213e");
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        if (this.showGrid) {
            this.drawGrid();
        }
        
        this.drawAxes();
        this.drawLabels();
    }

    drawGrid() {
        const canvasWidth = this.canvas.style.width ? parseInt(this.canvas.style.width) : this.canvas.width;
        const canvasHeight = this.canvas.style.height ? parseInt(this.canvas.style.height) : this.canvas.height;
        
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        this.ctx.lineWidth = 1;
        
        // Vertical grid lines
        for (let i = 1; i < 30; i++) {
            const xPos = this.centerX + i * this.scale;
            const xNeg = this.centerX - i * this.scale;
            
            if (xPos < canvasWidth) {
                this.ctx.beginPath();
                this.ctx.moveTo(xPos, 0);
                this.ctx.lineTo(xPos, canvasHeight);
                this.ctx.stroke();
            }
            
            if (xNeg > 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(xNeg, 0);
                this.ctx.lineTo(xNeg, canvasHeight);
                this.ctx.stroke();
            }
        }
        
        // Horizontal grid lines
        for (let i = 1; i < 30; i++) {
            const yPos = this.centerY + i * this.scale;
            const yNeg = this.centerY - i * this.scale;
            
            if (yPos < canvasHeight) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, yPos);
                this.ctx.lineTo(canvasWidth, yPos);
                this.ctx.stroke();
            }
            
            if (yNeg > 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, yNeg);
                this.ctx.lineTo(canvasWidth, yNeg);
                this.ctx.stroke();
            }
        }
    }

    drawAxes() {
        const canvasWidth = this.canvas.style.width ? parseInt(this.canvas.style.width) : this.canvas.width;
        const canvasHeight = this.canvas.style.height ? parseInt(this.canvas.style.height) : this.canvas.height;
        
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        this.ctx.lineWidth = 2;
        
        // Real axis (horizontal)
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.centerY);
        this.ctx.lineTo(canvasWidth, this.centerY);
        this.ctx.stroke();
        
        // Imaginary axis (vertical)
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, 0);
        this.ctx.lineTo(this.centerX, canvasHeight);
        this.ctx.stroke();
        
        // Axis arrows
        this.drawArrow(canvasWidth - 20, this.centerY, 0);
        this.drawArrow(this.centerX, 20, Math.PI / 2);
    }

    drawArrow(x, y, angle) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(-10, -5);
        this.ctx.lineTo(-10, 5);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }

    drawLabels() {
        const canvasWidth = this.canvas.style.width ? parseInt(this.canvas.style.width) : this.canvas.width;
        const canvasHeight = this.canvas.style.height ? parseInt(this.canvas.style.height) : this.canvas.height;
        
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        this.ctx.font = `${Math.max(12, this.scale / 3)}px Arial`;
        this.ctx.textAlign = "center";
        
        // Real axis label
        this.ctx.fillText("Real", canvasWidth - 30, this.centerY - 10);
        
        // Imaginary axis label
        this.ctx.save();
        this.ctx.translate(this.centerX + 15, 30);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText("Imaginary", 0, 0);
        this.ctx.restore();
        
        // Number labels on axes (only show if scale is large enough)
        if (this.scale > 15) {
            this.ctx.font = `${Math.max(10, this.scale / 4)}px Arial`;
            for (let i = -10; i <= 10; i++) {
                if (i !== 0) {
                    const x = this.centerX + i * this.scale;
                    const y = this.centerY + i * this.scale;
                    
                    if (x > 0 && x < canvasWidth) {
                        this.ctx.fillText(i.toString(), x, this.centerY + 20);
                    }
                    if (y > 0 && y < canvasHeight) {
                        this.ctx.fillText(i.toString(), this.centerX - 20, y + 5);
                    }
                }
            }
        }
    }

    addComplexNumber(real, imag, color = null) {
        const complexNum = {
            real: real,
            imag: imag,
            color: color || this.getRandomColor(),
            timestamp: Date.now()
        };
        
        this.complexNumbers.push(complexNum);
        
        if (this.showTrail) {
            this.trail.push({...complexNum});
            if (this.trail.length > 50) {
                this.trail.shift();
            }
        }
        
        this.plotAllNumbers();
        return complexNum;
    }

    plotComplexNumber(complexNum, isAnimated = false) {
        const x = this.centerX + complexNum.real * this.scale;
        const y = this.centerY - complexNum.imag * this.scale;
        
        // Draw vector from origin
        this.ctx.strokeStyle = complexNum.color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        
        // Draw point
        const pointSize = Math.max(4, this.scale / 8);
        this.ctx.fillStyle = complexNum.color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, pointSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add glow effect
        this.ctx.shadowColor = complexNum.color;
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(x, y, pointSize - 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Draw polar coordinates if enabled
        if (this.showPolar) {
            this.drawPolarInfo(complexNum, x, y);
        }
        
        // Draw complex number label (only if scale is large enough)
        if (this.scale > 20) {
            this.ctx.fillStyle = "white";
            this.ctx.font = `${Math.max(10, this.scale / 3)}px Arial`;
            this.ctx.textAlign = "left";
            const label = `${complexNum.real.toFixed(2)} + ${complexNum.imag.toFixed(2)}i`;
            this.ctx.fillText(label, x + 10, y - 10);
        }
    }

    drawPolarInfo(complexNum, x, y) {
        const r = Math.sqrt(complexNum.real * complexNum.real + complexNum.imag * complexNum.imag);
        const theta = Math.atan2(complexNum.imag, complexNum.real);
        
        // Draw radius circle
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, r * this.scale, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw angle arc
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 30, 0, theta);
        this.ctx.stroke();
        
        // Polar coordinates label (only if scale is large enough)
        if (this.scale > 20) {
            this.ctx.fillStyle = "yellow";
            this.ctx.font = `${Math.max(9, this.scale / 4)}px Arial`;
            const polarLabel = `r=${r.toFixed(2)}, θ=${(theta * 180 / Math.PI).toFixed(1)}°`;
            this.ctx.fillText(polarLabel, x + 10, y + 10);
        }
    }

    plotAllNumbers() {
        this.drawComplexPlane();
        
        // Draw trail if enabled
        if (this.showTrail && this.trail.length > 1) {
            this.ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            for (let i = 0; i < this.trail.length; i++) {
                const point = this.trail[i];
                const x = this.centerX + point.real * this.scale;
                const y = this.centerY - point.imag * this.scale;
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.stroke();
        }
        
        this.complexNumbers.forEach(num => this.plotComplexNumber(num));
    }

    getRandomColor() {
        const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7", "#dda0dd", "#98d8c8"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateInputFields(real, imag) {
        document.getElementById("realPart").value = real.toFixed(3);
        document.getElementById("imagPart").value = imag.toFixed(3);
    }

    updateResults(real, imag) {
        const magnitude = Math.sqrt(real * real + imag * imag);
        const angle = Math.atan2(imag, real) * 180 / Math.PI;
        
        document.getElementById("currentPoint").textContent = `${real.toFixed(2)} + ${imag.toFixed(2)}i`;
        document.getElementById("magnitude").textContent = magnitude.toFixed(2);
        document.getElementById("angle").textContent = `${angle.toFixed(1)}°`;
        document.getElementById("conjugate").textContent = `${real.toFixed(2)} - ${imag.toFixed(2)}i`;
    }

    clearAll() {
        this.complexNumbers = [];
        this.trail = [];
        this.drawComplexPlane();
        showNotification("Canvas cleared", "success");
    }

    toggleGrid() {
        this.showGrid = !this.showGrid;
        this.plotAllNumbers();
        showNotification(`Grid ${this.showGrid ? "enabled" : "disabled"}`, "success");
    }

    togglePolar() {
        this.showPolar = !this.showPolar;
        this.plotAllNumbers();
        showNotification(`Polar coordinates ${this.showPolar ? "enabled" : "disabled"}`, "success");
    }

    toggleTrail() {
        this.showTrail = !this.showTrail;
        if (!this.showTrail) {
            this.trail = [];
        }
        this.plotAllNumbers();
        showNotification(`Trail ${this.showTrail ? "enabled" : "disabled"}`, "success");
    }

    animateOperation(z1, z2, operation) {
        let result;
        switch (operation) {
            case "add":
                result = { real: z1.real + z2.real, imag: z1.imag + z2.imag };
                break;
            case "multiply":
                result = {
                    real: z1.real * z2.real - z1.imag * z2.imag,
                    imag: z1.real * z2.imag + z1.imag * z2.real
                };
                break;
            default:
                return;
        }
        
        this.clearAll();
        this.addComplexNumber(z1.real, z1.imag, "#ff6b6b");
        this.addComplexNumber(z2.real, z2.imag, "#4ecdc4");
        
        setTimeout(() => {
            this.addComplexNumber(result.real, result.imag, "#ffd700");
        }, 1000);
    }
}

// Initialize visualizer
let visualizer;

document.addEventListener("DOMContentLoaded", function() {
    visualizer = new ComplexVisualizer("complexCanvas");
    
    // Add initial example point
    setTimeout(() => {
        const complexNum = visualizer.addComplexNumber(3, 2);
        visualizer.updateResults(3, 2);
    }, 500);
});

function plotComplexNumber() {
    const realPart = parseFloat(document.getElementById("realPart").value);
    const imagPart = parseFloat(document.getElementById("imagPart").value);

    if (isNaN(realPart) || isNaN(imagPart)) {
        showNotification("Please enter valid numbers.", "error");
        return;
    }

    visualizer.addComplexNumber(realPart, imagPart);
    visualizer.updateResults(realPart, imagPart);
    showNotification(`Plotted: ${realPart} + ${imagPart}i`, "success");
}

function demonstrateOperations() {
    visualizer.clearAll();
    
    const z1 = { real: 3, imag: 2 };
    const z2 = { real: 1, imag: 4 };
    
    visualizer.addComplexNumber(z1.real, z1.imag, "#ff6b6b");
    setTimeout(() => {
        visualizer.addComplexNumber(z2.real, z2.imag, "#4ecdc4");
    }, 500);
    
    setTimeout(() => {
        visualizer.animateOperation(z1, z2, "add");
    }, 1000);
    
    setTimeout(() => {
        visualizer.animateOperation(z1, z2, "multiply");
    }, 3000);
}

function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
        ${type === "success" ? "background: linear-gradient(45deg, #4CAF50, #45a049);" : "background: linear-gradient(45deg, #f44336, #d32f2f);"}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.style.transform = "translateX(0)", 100);
    setTimeout(() => {
        notification.style.transform = "translateX(100%)";
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

