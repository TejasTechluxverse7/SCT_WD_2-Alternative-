document.addEventListener('DOMContentLoaded', function() {
    // Calculator state variables
    let currentOperand = '0';
    let previousOperand = '';
    let operation = undefined;
    let memory = 0; 
    let shouldResetScreen = false;
    
    // DOM elements
    const currentOperandElement = document.querySelector('.current-operand');
    const previousOperandElement = document.querySelector('.previous-operand');
    const scientificKeypad = document.getElementById('scientific-keypad');
    const themeToggleButton = document.getElementById('theme-toggle');
    const scientificToggleButton = document.getElementById('scientific-toggle');
    
    // --- Core Calculator Logic ---
    function updateDisplay() {
        currentOperandElement.textContent = currentOperand;
        if (operation != null) {
            previousOperandElement.textContent = `${previousOperand} ${getOperationSymbol(operation)}`;
        } else {
            previousOperandElement.textContent = previousOperand;
        }
    }
    
    function getOperationSymbol(op) {
        switch(op) {
            case '+': return '+';
            case '-': return '−';
            case '*': return '×';
            case '/': return '÷';
            case '%': return '%';
            default: return '';
        }
    }
    
    function clear() {
        currentOperand = '0';
        previousOperand = '';
        operation = undefined;
        shouldResetScreen = false;
    }
    
    function deleteDigit() {
        if (currentOperand.length === 1) {
            currentOperand = '0';
        } else {
            currentOperand = currentOperand.slice(0, -1);
        }
    }
    
    function appendNumber(number) {
        if (shouldResetScreen) {
            currentOperand = '';
            shouldResetScreen = false;
        }
        if (number === '.' && currentOperand.includes('.')) return;
        if (currentOperand === '0' && number !== '.') currentOperand = '';
        currentOperand += number;
    }
    
    function chooseOperation(op) {
        if (currentOperand === '') return;
        if (previousOperand !== '') {
            calculate();
        }
        operation = op;
        previousOperand = currentOperand;
        shouldResetScreen = true;
    }

    function chooseScientificOperation(action) {
        const current = parseFloat(currentOperand);
        if (isNaN(current)) return;
        let result;
        switch(action) {
            case 'sin': result = Math.sin(current * (Math.PI / 180)); break;
            case 'cos': result = Math.cos(current * (Math.PI / 180)); break;
            case 'tan': result = Math.tan(current * (Math.PI / 180)); break;
            case 'log': result = Math.log10(current); break;
            case 'sqrt': result = Math.sqrt(current); break;
            case 'pi': result = Math.PI; break;
            case 'e': result = Math.E; break;
            case 'power': result = current * current; break;
            default: return;
        }
        currentOperand = formatResult(result);
        previousOperand = '';
        operation = undefined;
        shouldResetScreen = true;
    }
    
    function calculate() {
        let computation;
        const prev = parseFloat(previousOperand);
        const current = parseFloat(currentOperand);
        if (isNaN(prev) || isNaN(current)) return;
        switch (operation) {
            case '+': computation = prev + current; break;
            case '-': computation = prev - current; break;
            case '*': computation = prev * current; break;
            case '/': 
                if (current === 0) { showError('Cannot divide by zero'); return; }
                computation = prev / current; 
                break;
            case '%': computation = prev % current; break;
            default: return;
        }
        currentOperand = formatResult(computation);
        operation = undefined;
        previousOperand = '';
        shouldResetScreen = true;
    }
    
    function formatResult(num) {
        if (typeof num !== 'number' || isNaN(num)) return '0';
        return num.toString();
    }
    
    function showError(message) {
        currentOperandElement.classList.add('error');
        currentOperand = message;
        updateDisplay();
        setTimeout(() => {
            currentOperandElement.classList.remove('error');
            clear();
            updateDisplay();
        }, 1500);
    }

    // --- Memory Functions ---
    function memoryClear() { memory = 0; }
    function memoryRecall() { currentOperand = memory.toString(); updateDisplay(); }
    function memoryAdd() { const c = parseFloat(currentOperand); if (!isNaN(c)) memory += c; }
    function memorySubtract() { const c = parseFloat(currentOperand); if (!isNaN(c)) memory -= c; }

    // --- Theme & Scientific Toggles ---
    function toggleTheme() {
        document.body.classList.toggle('light-theme');
        const isLightTheme = document.body.classList.contains('light-theme');
        themeToggleButton.textContent = isLightTheme ? '🌙' : '☀️';
    }
    function toggleScientificMode() {
        scientificKeypad.classList.toggle('visible');
        scientificToggleButton.classList.toggle('active');
    }

    // --- Event Listeners ---
    document.querySelectorAll('[data-number]').forEach(button => {
        button.addEventListener('click', () => { appendNumber(button.getAttribute('data-number')); updateDisplay(); });
    });
    document.querySelectorAll('[data-operator]').forEach(button => {
        button.addEventListener('click', () => { chooseOperation(button.getAttribute('data-operator')); updateDisplay(); });
    });
    document.querySelectorAll('[data-action]').forEach(button => {
        const action = button.getAttribute('data-action');
        switch(action) {
            case 'sin': case 'cos': case 'tan': case 'log': case 'sqrt': case 'pi': case 'e': case 'power':
                button.addEventListener('click', () => { chooseScientificOperation(action); updateDisplay(); });
                break;
            case 'calculate': button.addEventListener('click', () => { calculate(); updateDisplay(); }); break;
            case 'clear': button.addEventListener('click', () => { clear(); updateDisplay(); }); break;
            case 'delete': button.addEventListener('click', () => { deleteDigit(); updateDisplay(); }); break;
            case 'mc': button.addEventListener('click', () => { memoryClear(); }); break;
            case 'mr': button.addEventListener('click', () => { memoryRecall(); }); break;
            case 'm-plus': button.addEventListener('click', () => { memoryAdd(); }); break;
            case 'm-minus': button.addEventListener('click', () => { memorySubtract(); }); break;
        }
    });

    themeToggleButton.addEventListener('click', toggleTheme);
    scientificToggleButton.addEventListener('click', toggleScientificMode);

    document.addEventListener('keydown', function(e) {
        const key = e.key;
        if ((key >= '0' && key <= '9') || key === '.') appendNumber(key);
        else if (['+', '-', '*', '/', '%'].includes(key)) chooseOperation(key);
        else if (key === 'Enter' || key === '=') { e.preventDefault(); calculate(); }
        else if (key === 'Escape') clear();
        else if (key === 'Backspace') deleteDigit();
        updateDisplay();
    });

    updateDisplay();
});
