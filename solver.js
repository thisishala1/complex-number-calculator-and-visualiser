        // Enhanced Complex Number Visualizer
        class ComplexVisualizer {
            constructor(canvasId) {
                this.canvas = document.getElementById(canvasId);
                this.ctx = this.canvas.getContext("2d");
                this.scale = 30;
                this.centerX = this.canvas.width / 2;
                this.centerY = this.canvas.height / 2;
                this.complexNumbers = [];
                this.animationId = null;
                this.showGrid = true;
                this.showPolar = false;
                this.showTrail = false;
                this.trail = [];
                
                this.setupEventListeners();
                this.drawComplexPlane();
            }

            setupEventListeners() {
                // Mouse interaction for adding points
                this.canvas.addEventListener("click", (e) => {
                    const rect = this.canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const real = (x - this.centerX) / this.scale;
                    const imag = -(y - this.centerY) / this.scale;
                    
                    this.addComplexNumber(real, imag);
                    this.updateInputFields(real, imag);
                });

                // Zoom with mouse wheel
                this.canvas.addEventListener("wheel", (e) => {
                    e.preventDefault();
                    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
                    this.scale *= zoomFactor;
                    this.scale = Math.max(5, Math.min(100, this.scale));
                    this.drawComplexPlane();
                    this.plotAllNumbers();
                });
            }

            drawComplexPlane() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Background gradient
                const gradient = this.ctx.createRadialGradient(
                    this.centerX, this.centerY, 0,
                    this.centerX, this.centerY, Math.max(this.canvas.width, this.canvas.height)
                );
                gradient.addColorStop(0, "#1a1a2e");
                gradient.addColorStop(1, "#16213e");
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                if (this.showGrid) {
                    this.drawGrid();
                }
                
                this.drawAxes();
                this.drawLabels();
            }

            drawGrid() {
                this.ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
                this.ctx.lineWidth = 1;
                
                // Vertical grid lines
                for (let i = 1; i < 30; i++) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.centerX + i * this.scale, 0);
                    this.ctx.lineTo(this.centerX + i * this.scale, this.canvas.height);
                    this.ctx.moveTo(this.centerX - i * this.scale, 0);
                    this.ctx.lineTo(this.centerX - i * this.scale, this.canvas.height);
                    this.ctx.stroke();
                }
                
                // Horizontal grid lines
                for (let i = 1; i < 30; i++) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, this.centerY + i * this.scale);
                    this.ctx.lineTo(this.canvas.width, this.centerY + i * this.scale);
                    this.ctx.moveTo(0, this.centerY - i * this.scale);
                    this.ctx.lineTo(this.canvas.width, this.centerY - i * this.scale);
                    this.ctx.stroke();
                }
            }

            drawAxes() {
                this.ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
                this.ctx.lineWidth = 2;
                
                // Real axis (horizontal)
                this.ctx.beginPath();
                this.ctx.moveTo(0, this.centerY);
                this.ctx.lineTo(this.canvas.width, this.centerY);
                this.ctx.stroke();
                
                // Imaginary axis (vertical)
                this.ctx.beginPath();
                this.ctx.moveTo(this.centerX, 0);
                this.ctx.lineTo(this.centerX, this.canvas.height);
                this.ctx.stroke();
                
                // Axis arrows
                this.drawArrow(this.canvas.width - 20, this.centerY, 0);
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
                this.ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
                this.ctx.font = "14px Arial";
                this.ctx.textAlign = "center";
                
                // Real axis label
                this.ctx.fillText("Real", this.canvas.width - 30, this.centerY - 10);
                
                // Imaginary axis label
                this.ctx.save();
                this.ctx.translate(this.centerX + 15, 30);
                this.ctx.rotate(-Math.PI / 2);
                this.ctx.fillText("Imaginary", 0, 0);
                this.ctx.restore();
                
                // Number labels on axes
                this.ctx.font = "12px Arial";
                for (let i = -10; i <= 10; i++) {
                    if (i !== 0) {
                        const x = this.centerX + i * this.scale;
                        const y = this.centerY + i * this.scale;
                        
                        if (x > 0 && x < this.canvas.width) {
                            this.ctx.fillText(i.toString(), x, this.centerY + 20);
                        }
                        if (y > 0 && y < this.canvas.height) {
                            this.ctx.fillText(i.toString(), this.centerX - 20, y + 5);
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
                this.ctx.fillStyle = complexNum.color;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 6, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Add glow effect
                this.ctx.shadowColor = complexNum.color;
                this.ctx.shadowBlur = 10;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 4, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
                
                // Draw polar coordinates if enabled
                if (this.showPolar) {
                    this.drawPolarInfo(complexNum, x, y);
                }
                
                // Draw complex number label
                this.ctx.fillStyle = "white";
                this.ctx.font = "12px Arial";
                this.ctx.textAlign = "left";
                const label = `${complexNum.real.toFixed(2)} + ${complexNum.imag.toFixed(2)}i`;
                this.ctx.fillText(label, x + 10, y - 10);
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
                
                // Polar coordinates label
                this.ctx.fillStyle = "yellow";
                this.ctx.font = "11px Arial";
                const polarLabel = `r=${r.toFixed(2)}, θ=${(theta * 180 / Math.PI).toFixed(1)}°`;
                this.ctx.fillText(polarLabel, x + 10, y + 10);
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
                visualizer.addComplexNumber(3, 2);
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
                ${type === "success" ? "background: linear-gradient(45deg, #4CAF50, #45a049);" : "background: linear-gradient(45deg, #f44336, #d32f2f);"}
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => notification.style.transform = "translateX(0)", 100);
            setTimeout(() => {
                notification.style.transform = "translateX(100%)";
                setTimeout(() => document.body.removeChild(notification), 300);
            }, 3000);
        }