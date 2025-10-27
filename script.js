// ============================================
// BioQL Website - Interactive JavaScript
// ============================================

// ============================================
// Mobile Menu Toggle
// ============================================
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navActions = document.querySelector('.nav-actions');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        navActions.classList.toggle('active');

        // Prevent body scroll when menu is open
        document.body.style.overflow = mobileMenuToggle.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking on a link
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            navActions.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) &&
            !mobileMenuToggle.contains(e.target) &&
            !navActions.contains(e.target) &&
            mobileMenuToggle.classList.contains('active')) {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            navActions.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ============================================
// Smooth Scrolling
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// Navbar Scroll Effect
// ============================================
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.background = 'rgba(10, 14, 39, 0.95)';
        navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(10, 14, 39, 0.8)';
        navbar.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// ============================================
// Demo Interface Functionality
// ============================================
const demoTabs = document.querySelectorAll('.demo-tab');
const demoQueryTextarea = document.getElementById('demoQuery');
const runDemoButton = document.getElementById('runDemo');
const demoResultPre = document.getElementById('demoResult');

// Demo queries for different tabs
const demoQueries = {
    'docking': 'dock aspirin to COX-1 receptor and calculate binding affinity',
    'affinity': 'estimate binding affinity between semaglutide and GLP-1R using VQE',
    'adme': 'predict ADME properties and bioavailability for ibuprofen'
};

// Demo results for different tabs
const demoResults = {
    'docking': {
        binding_energy: -8.5,
        affinity_kd: 1.45,
        best_pose: {
            rotation: [0.12, 0.45, 0.89],
            translation: [2.3, -1.2, 0.5]
        },
        lipinski_compliant: true,
        quantum_advantage: "2.3x speedup vs classical"
    },
    'affinity': {
        binding_energy: -12.34,
        binding_affinity_kd: 1.45,
        binding_affinity_ki: 0.98,
        ic50: 2.9,
        ligand_efficiency: 0.42,
        interaction_types: ['hydrogen_bonding', 'hydrophobic', 'pi_stacking'],
        quantum_algorithm: "VQE with 12 qubits, depth 3"
    },
    'adme': {
        absorption_score: 0.75,
        distribution_score: 0.68,
        metabolism_score: 0.52,
        excretion_score: 0.71,
        bioavailability: 65.3,
        half_life: 4.2,
        lipinski_violations: 0,
        quantum_ml_confidence: 0.89
    }
};

// Tab switching
demoTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        demoTabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');

        // Update query textarea
        const demoType = tab.getAttribute('data-demo');
        demoQueryTextarea.value = demoQueries[demoType];
    });
});

// Run Demo Button
runDemoButton.addEventListener('click', () => {
    const activeTab = document.querySelector('.demo-tab.active');
    const demoType = activeTab.getAttribute('data-demo');
    const backend = document.getElementById('demoBackend').value;
    const shots = document.getElementById('demoShots').value;

    // Show loading state
    runDemoButton.disabled = true;
    runDemoButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="2" opacity="0.25"/>
            <path d="M12 2 A10 10 0 0 1 22 12" stroke-width="2"/>
        </svg>
        <span>Running on ${backend}...</span>
    `;

    // Simulate quantum execution
    setTimeout(() => {
        const result = demoResults[demoType];
        const enhancedResult = {
            ...result,
            backend: backend,
            shots: parseInt(shots),
            execution_time: (Math.random() * 3 + 1).toFixed(2) + 's',
            qubits_used: backend === 'ibm_quantum' ? 133 : (backend === 'ionq' ? 25 : 30),
            timestamp: new Date().toISOString()
        };

        demoResultPre.innerHTML = `<code>${JSON.stringify(enhancedResult, null, 2)}</code>`;

        // Reset button
        runDemoButton.disabled = false;
        runDemoButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 3L15 10L5 17V3Z" fill="currentColor"/>
            </svg>
            <span>Run Quantum Simulation</span>
        `;

        // Update execution time in output header
        document.querySelector('.output-time').textContent = `Execution time: ${enhancedResult.execution_time}`;

    }, 2300); // Simulated delay
});

// ============================================
// Animated Counter for Stats
// ============================================
const animateCounter = (element, target, duration = 2000) => {
    let current = 0;
    const increment = target / (duration / 16); // 60fps
    const isDecimal = target % 1 !== 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = isDecimal ? target.toFixed(1) : target;
            clearInterval(timer);
        } else {
            element.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
        }
    }, 16);
};

// Intersection Observer for stats animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            const value = entry.target.textContent.replace(/[^0-9.]/g, '');
            animateCounter(entry.target, parseFloat(value));
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-value').forEach(stat => {
    statsObserver.observe(stat);
});

// ============================================
// Module Cards Interactive Highlighting
// ============================================
const moduleCards = document.querySelectorAll('.module-card');

moduleCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        const moduleNumber = card.querySelector('.module-number');
        moduleNumber.style.opacity = '1';
        moduleNumber.style.transform = 'scale(1.1)';
    });

    card.addEventListener('mouseleave', () => {
        const moduleNumber = card.querySelector('.module-number');
        moduleNumber.style.opacity = '0.3';
        moduleNumber.style.transform = 'scale(1)';
    });
});

// ============================================
// Feature Cards Intersection Animation
// ============================================
const featureObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.6s ease-out';
    featureObserver.observe(card);
});

// ============================================
// Pricing Card Hover Effects
// ============================================
const pricingCards = document.querySelectorAll('.pricing-card');

pricingCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        const amount = card.querySelector('.amount');
        if (amount) {
            amount.style.transform = 'scale(1.05)';
            amount.style.transition = 'transform 0.3s ease';
        }
    });

    card.addEventListener('mouseleave', () => {
        const amount = card.querySelector('.amount');
        if (amount) {
            amount.style.transform = 'scale(1)';
        }
    });
});

// ============================================
// Code Window Syntax Highlighting Enhancement
// ============================================
const enhanceCodeHighlighting = () => {
    const codeBlocks = document.querySelectorAll('.code-content code, .module-code code');

    codeBlocks.forEach(block => {
        let html = block.innerHTML;

        // Highlight specific BioQL patterns
        html = html.replace(/quantum\(/g, '<span class="function">quantum</span>(');
        html = html.replace(/result\./g, '<span class="property">result</span>.');
        html = html.replace(/(\d+)/g, '<span class="number">$1</span>');

        block.innerHTML = html;
    });
};

// Run on load
window.addEventListener('DOMContentLoaded', enhanceCodeHighlighting);

// ============================================
// Backend Status Real-time Simulation
// ============================================
const simulateBackendStatus = () => {
    const statusDots = document.querySelectorAll('.status-dot.active');

    statusDots.forEach(dot => {
        setInterval(() => {
            // Pulse animation
            dot.style.animation = 'pulse 2s ease-in-out infinite';
        }, 2000);
    });
};

// Add pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% {
            box-shadow: 0 0 8px var(--color-bio-green);
        }
        50% {
            box-shadow: 0 0 16px var(--color-bio-green);
        }
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .btn-demo:disabled svg {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);

simulateBackendStatus();

// ============================================
// Quantum Particles Animation in Hero
// ============================================
const createQuantumParticles = () => {
    const particlesContainer = document.querySelector('.quantum-particles');
    if (!particlesContainer) return;

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'quantum-particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: rgba(0, 212, 255, ${Math.random() * 0.5 + 0.3});
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 5}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        particlesContainer.appendChild(particle);
    }
};

// Add float animation
const particleStyle = document.createElement('style');
particleStyle.textContent = `
    @keyframes float {
        0%, 100% {
            transform: translate(0, 0);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(particleStyle);

createQuantumParticles();

// ============================================
// Performance Optimization: Lazy Loading
// ============================================
const lazyLoadImages = () => {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
};

lazyLoadImages();

// ============================================
// Console Easter Egg
// ============================================
console.log('%c🧬 BioQL - Quantum Drug Discovery Platform', 'color: #00D4FF; font-size: 24px; font-weight: bold;');
console.log('%cVersion 5.7.5 - Production Ready', 'color: #9D4EDD; font-size: 14px;');
console.log('%cInterested in joining our team? Email: careers@bioql.com', 'color: #06FFA5; font-size: 12px;');
console.log('%c\nTry running: quantum("dock aspirin to COX-1")', 'color: #B4B9D2; font-size: 12px; font-style: italic;');

// ============================================
// Analytics & Tracking (Placeholder)
// ============================================
const trackEvent = (category, action, label) => {
    // Placeholder for analytics
    console.log(`Event: ${category} - ${action} - ${label}`);

    // Integration with Google Analytics, Mixpanel, etc.
    // if (window.gtag) {
    //     window.gtag('event', action, {
    //         event_category: category,
    //         event_label: label
    //     });
    // }
};

// Track demo runs
runDemoButton.addEventListener('click', () => {
    const backend = document.getElementById('demoBackend').value;
    trackEvent('Demo', 'Run Simulation', backend);
});

// Track pricing card clicks
document.querySelectorAll('.btn-pricing').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const plan = e.target.closest('.pricing-card').querySelector('h3').textContent;
        trackEvent('Pricing', 'Click Plan', plan);
    });
});

// ============================================
// Module Tabs Data Structure
// ============================================
const moduleData = {
    docking: {
        title: 'Molecular Docking',
        description: 'Predict ligand-receptor binding poses with quantum advantage',
        metrics: [
            { label: 'Accuracy', value: '±0.3 kcal/mol' },
            { label: 'Poses', value: '20+ per run' }
        ]
    },
    affinity: {
        title: 'Binding Affinity',
        description: 'VQE-based quantum chemistry for precise Kd/Ki calculation',
        metrics: [
            { label: 'Range', value: '0.01-100 µM' },
            { label: 'Parameters', value: 'ΔG, Kd, Ki, IC50' }
        ]
    },
    // ... more modules
};

// ============================================
// Print Page Information
// ============================================
console.table({
    'Website': 'BioQL Drug Discovery Platform',
    'Version': '5.7.5',
    'Modules': 6,
    'Backends': 5,
    'Technology': 'Quantum Computing',
    'Status': 'Production Ready ✅'
});

// ============================================
// Accessibility Enhancements
// ============================================
const enhanceAccessibility = () => {
    // Add ARIA labels to interactive elements
    document.querySelectorAll('button, a[href^="#"]').forEach(el => {
        if (!el.getAttribute('aria-label') && el.textContent.trim()) {
            el.setAttribute('aria-label', el.textContent.trim());
        }
    });

    // Add focus styles for keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-nav');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav');
    });
};

enhanceAccessibility();

// ============================================
// Initialize Everything
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ BioQL Website Loaded Successfully');
    console.log('🚀 All interactive features initialized');

    // Track page load time
    const loadTime = performance.now();
    console.log(`⚡ Page loaded in ${loadTime.toFixed(2)}ms`);
});

// ============================================
// Export for testing (if needed)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        trackEvent,
        demoResults,
        moduleData
    };
}
