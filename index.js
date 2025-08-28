// Complex Number Calculator with Enhanced Features
class ComplexNumber {
  constructor(real, imag) {
    this.real = real;
    this.imag = imag;
  }

  // Basic operations
  add(other) {
    return new ComplexNumber(this.real + other.real, this.imag + other.imag);
  }

  subtract(other) {
    return new ComplexNumber(this.real - other.real, this.imag - other.imag);
  }

  multiply(other) {
    const real = this.real * other.real - this.imag * other.imag;
    const imag = this.real * other.imag + this.imag * other.real;
    return new ComplexNumber(real, imag);
  }

  divide(other) {
    const denominator = other.real * other.real + other.imag * other.imag;
    if (denominator === 0) {
      throw new Error("Division by zero");
    }
    const real = (this.real * other.real + this.imag * other.imag) / denominator;
    const imag = (this.imag * other.real - this.real * other.imag) / denominator;
    return new ComplexNumber(real, imag);
  }

  // Advanced operations
  conjugate() {
    return new ComplexNumber(this.real, -this.imag);
  }

  modulus() {
    return Math.sqrt(this.real * this.real + this.imag * this.imag);
  }

  argument() {
    return Math.atan2(this.imag, this.real);
  }

  power(n) {
    const r = this.modulus();
    const theta = this.argument();
    const newR = Math.pow(r, n);
    const newTheta = n * theta;
    return new ComplexNumber(
      newR * Math.cos(newTheta),
      newR * Math.sin(newTheta)
    );
  }

  sqrt() {
    const r = this.modulus();
    const theta = this.argument();
    const newR = Math.sqrt(r);
    const newTheta = theta / 2;
    return new ComplexNumber(
      newR * Math.cos(newTheta),
      newR * Math.sin(newTheta)
    );
  }

  exp() {
    const expReal = Math.exp(this.real);
    return new ComplexNumber(
      expReal * Math.cos(this.imag),
      expReal * Math.sin(this.imag)
    );
  }

  log() {
    return new ComplexNumber(
      Math.log(this.modulus()),
      this.argument()
    );
  }

  toString() {
    if (this.imag >= 0) {
      return `${this.real.toFixed(3)} + ${this.imag.toFixed(3)}i`;
    } else {
      return `${this.real.toFixed(3)} - ${Math.abs(this.imag).toFixed(3)}i`;
    }
  }

  toPolarString() {
    const r = this.modulus();
    const theta = this.argument();
    return `${r.toFixed(3)} ∠ ${(theta * 180 / Math.PI).toFixed(2)}°`;
  }
}

// Animation and UI functions
function animateValue(element, start, end, duration) {
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const current = start + (end - start) * progress;
    element.textContent = current.toFixed(3);
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

function createResultCard(title, value, description = '') {
  return `
    <div class="result-card">
      <h4>${title}</h4>
      <div class="result-value">${value}</div>
      ${description ? `<p class="result-description">${description}</p>` : ''}
    </div>
  `;
}

function displayResults(z1, z2, results) {
  const resultsContainer = document.getElementById('results-container');
  
  const resultCards = [
    createResultCard('Addition', results.addition.toString(), 'z₁ + z₂'),
    createResultCard('Subtraction', results.subtraction.toString(), 'z₁ - z₂'),
    createResultCard('Multiplication', results.multiplication.toString(), 'z₁ × z₂'),
    createResultCard('Division', results.division.toString(), 'z₁ ÷ z₂'),
    createResultCard('Conjugate z₁', results.conjugate1.toString(), 'z̄₁'),
    createResultCard('Conjugate z₂', results.conjugate2.toString(), 'z̄₂'),
    createResultCard('|z₁|', results.modulus1.toFixed(3), 'Modulus of z₁'),
    createResultCard('|z₂|', results.modulus2.toFixed(3), 'Modulus of z₂'),
    createResultCard('Arg(z₁)', `${(results.argument1 * 180 / Math.PI).toFixed(2)}°`, 'Argument of z₁'),
    createResultCard('Arg(z₂)', `${(results.argument2 * 180 / Math.PI).toFixed(2)}°`, 'Argument of z₂'),
    createResultCard('z₁²', results.power1.toString(), 'z₁ squared'),
    createResultCard('√z₁', results.sqrt1.toString(), 'Square root of z₁'),
    createResultCard('e^z₁', results.exp1.toString(), 'Exponential of z₁'),
    createResultCard('ln(z₁)', results.log1.toString(), 'Natural log of z₁'),
    createResultCard('Polar z₁', z1.toPolarString(), 'Polar form of z₁'),
    createResultCard('Polar z₂', z2.toPolarString(), 'Polar form of z₂')
  ];
  
  resultsContainer.innerHTML = `
    <h2>Results</h2>
    <div class="results-grid">
      ${resultCards.join('')}
    </div>
  `;
}

function performOperations() {
  try {
    const real1 = parseFloat(document.getElementById('real1').value);
    const imag1 = parseFloat(document.getElementById('imag1').value);
    const real2 = parseFloat(document.getElementById('real2').value);
    const imag2 = parseFloat(document.getElementById('imag2').value);

    if (isNaN(real1) || isNaN(imag1) || isNaN(real2) || isNaN(imag2)) {
      showNotification("Please enter valid numeric values for all fields.", "error");
      return;
    }

    const z1 = new ComplexNumber(real1, imag1);
    const z2 = new ComplexNumber(real2, imag2);

    const results = {
      addition: z1.add(z2),
      subtraction: z1.subtract(z2),
      multiplication: z1.multiply(z2),
      division: z2.modulus() === 0 ? "Undefined (Division by zero)" : z1.divide(z2),
      conjugate1: z1.conjugate(),
      conjugate2: z2.conjugate(),
      modulus1: z1.modulus(),
      modulus2: z2.modulus(),
      argument1: z1.argument(),
      argument2: z2.argument(),
      power1: z1.power(2),
      sqrt1: z1.sqrt(),
      exp1: z1.exp(),
      log1: z1.modulus() === 0 ? "Undefined (log of zero)" : z1.log()
    };

    displayResults(z1, z2, results);
    showNotification("Calculations completed successfully!", "success");
    
    // Add visual feedback
    const button = document.querySelector('.calculate-btn');
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 150);

  } catch (error) {
    showNotification(`Error: ${error.message}`, "error");
  }
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
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
    ${type === 'success' ? 'background: linear-gradient(45deg, #4CAF50, #45a049);' : 'background: linear-gradient(45deg, #f44336, #d32f2f);'}
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Dark theme toggle
function toggleDarkTheme() {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  localStorage.setItem('darkTheme', isDark);
}

// Initialize theme from localStorage
document.addEventListener('DOMContentLoaded', function() {
  const isDark = localStorage.getItem('darkTheme') === 'true';
  if (isDark) {
    document.body.classList.add('dark-theme');
  }
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
      performOperations();
    }
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      toggleDarkTheme();
    }
  });
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ComplexNumber, performOperations };
}


