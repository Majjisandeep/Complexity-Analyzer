function analyzeCode(code, language = 'javascript') {
    console.log(`🔥 Analyzing ${language} code`);
    
    // Default values
    let timeComplexity = 'O(1)';
    let spaceComplexity = 'O(1)';
    let explanation = [];
    
    // Convert code to lowercase for case-insensitive matching
    const lowerCode = code.toLowerCase();
    
    // Check for empty or trivial code
    if (!code.trim()) {
        return { 
            timeComplexity: 'N/A', 
            spaceComplexity: 'N/A',
            explanation: ['No code provided to analyze']
        };
    }
    
    // Split code into lines for more precise analysis
    const codeLines = code.split('\n').map(line => line.trim());
    
    // Detect early loop termination with break statements
    const hasEarlyTermination = detectEarlyLoopTermination(codeLines);
    
    // Algorithm specific pattern detection
    const isMergeSort = detectMergeSort(code, lowerCode);
    const isQuickSort = detectQuickSort(code, lowerCode);
    const isBinarySearch = detectBinarySearch(code, lowerCode);
    const isDijkstra = detectDijkstra(code, lowerCode);
    const isBFS = detectBFS(code, lowerCode);
    const isDFS = detectDFS(code, lowerCode);
    
    // Detect loops
    const hasForLoop = /\bfor\s*\([^)]*\)|\bfor\s+\w+\s+in\s+/.test(code);
    const hasWhileLoop = /\bwhile\s*\([^)]*\)/.test(code);
    const hasForEachLoop = /\.foreach\s*\(/.test(lowerCode);
    const hasMapFilter = /\.(map|filter|reduce|some|every)\s*\(/.test(lowerCode);
    
    // Detect nested loops
    let loopDepth = 0;
    let maxLoopDepth = 0;
    let bracketStack = 0;
    let inLoop = false;
    let nestedLoopDetected = false;
    
    // Simple bracket tracking for nested structures
    for (const line of codeLines) {
        if (/\bfor\s*\(|\bwhile\s*\(|\bfor\s+\w+\s+in\s+/.test(line)) {
            inLoop = true;
        }
        
        const openBrackets = (line.match(/{/g) || []).length;
        const closeBrackets = (line.match(/}/g) || []).length;
        
        // For Python-style indentation
        const indentLevel = line.search(/\S|$/);
        
        bracketStack += openBrackets - closeBrackets;
        
        if (inLoop && (openBrackets > 0 || indentLevel > 0)) {
            loopDepth++;
            maxLoopDepth = Math.max(maxLoopDepth, loopDepth);
            inLoop = false;
            
            if (loopDepth > 1) {
                nestedLoopDetected = true;
            }
        }
        
        if ((closeBrackets > 0 || line.trim() === '') && loopDepth > 0) {
            loopDepth = Math.max(0, loopDepth - 1);
        }
    }
    
    // Detect recursion - improved pattern
    const recursionDetected = detectRecursion(code);
    
    // Detect common data structures
    const hasArray = /\[\s*[^\]]*\]/.test(code);
    const hasObject = /{\s*[^}]*}/.test(code);
    const hasMap = /new\s+Map\s*\(/.test(code);
    const hasSet = /new\s+Set\s*\(/.test(code);
    
    // Detect common sorting algorithms
    const hasSortMethod = /\.sort\s*\(/.test(code);
    
    // Specific algorithm analysis
    if (isMergeSort) {
        timeComplexity = 'O(n log n)';
        spaceComplexity = 'O(n)';
        explanation.push('Merge sort algorithm detected with time complexity O(n log n)');
        explanation.push('Merge sort requires additional array space, so space complexity is O(n)');
    } else if (isQuickSort) {
        timeComplexity = 'O(n log n)'; // Average case
        explanation.push('Quick sort algorithm detected with average time complexity O(n log n)');
        explanation.push('Note: Quick sort worst case is O(n²), but average case is O(n log n)');
    } else if (isBinarySearch) {
        timeComplexity = 'O(log n)';
        explanation.push('Binary search algorithm detected with time complexity O(log n)');
    } else if (isDijkstra) {
        timeComplexity = 'O((V + E) log V)'; // Using priority queue
        explanation.push('Dijkstra\'s algorithm pattern detected');
    } else if (isBFS || isDFS) {
        timeComplexity = 'O(V + E)'; // V = vertices, E = edges
        spaceComplexity = 'O(V)';
        explanation.push(`${isBFS ? 'Breadth-first' : 'Depth-first'} search pattern detected`);
    } else if (hasEarlyTermination) {
        timeComplexity = 'O(1)';
        explanation.push('Loop with immediate break or early termination detected, suggesting constant time complexity');
    } else if (hasFixedIterations(code)) {
        timeComplexity = 'O(1)';
        explanation.push('Loop with fixed number of iterations detected, suggesting constant time complexity');
    } else if (nestedLoopDetected || maxLoopDepth >= 2) {
        timeComplexity = 'O(n²)';
        explanation.push('Nested loops detected, suggesting quadratic time complexity');
    } else if (hasForLoop || hasWhileLoop || hasForEachLoop || hasMapFilter) {
        timeComplexity = 'O(n)';
        explanation.push('Single loop detected, suggesting linear time complexity');
    }
    
    if (recursionDetected && timeComplexity === 'O(1)') {
        // If no specific algorithm was detected but recursion is present
        timeComplexity = 'O(n)';
        explanation.push('Recursion detected, suggesting at least linear time complexity');
        
        // Recursive merge-sort like pattern? (Divide and conquer)
        if (code.includes('mid') || 
            code.includes('middle') || 
            /\b(left|right)\s*=/.test(code)) {
            timeComplexity = 'O(n log n)';
            explanation.push('Recursive divide and conquer pattern detected, suggesting O(n log n)');
        }
        
        // Recursion typically uses call stack space
        spaceComplexity = 'O(n)';
        explanation.push('Recursion detected, suggesting linear space complexity due to call stack usage');
    }
    
    // Analysis based on common algorithms and patterns
    if (hasSortMethod && timeComplexity === 'O(1)') {
        timeComplexity = 'O(n log n)';
        explanation.push('Sorting operation detected, suggesting O(n log n) time complexity');
    }
    
    // Space complexity analysis
    if (hasArray || hasObject || hasMap || hasSet) {
        if (spaceComplexity === 'O(1)') {
            spaceComplexity = 'O(n)';
            explanation.push('Data structure instantiation detected, suggesting linear space complexity');
        }
    }
    
    // Add disclaimer for accuracy
    explanation.push('Note: This is a static analysis and may not accurately reflect actual runtime complexity in all cases.');
    
    return { 
        timeComplexity, 
        spaceComplexity,
        explanation 
    };
}

// Helper function to detect early loop termination
function detectEarlyLoopTermination(lines) {
    // Check for patterns like:
    // 1. Loop followed immediately by break
    // 2. Loop with a single if statement containing break
    // 3. Loop with just a few operations before break
    
    let inLoop = false;
    let indentationLevel = 0;
    let operationsBeforeBreak = 0;
    const maxOpsBeforeConstant = 3; // Max operations before we consider it not "constant"
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const indentation = lines[i].search(/\S|$/);
        
        // Detect loop start
        if (/\bfor\s|\bwhile\s/.test(line) && !line.includes(';')) {
            inLoop = true;
            indentationLevel = indentation;
            operationsBeforeBreak = 0;
            continue;
        }
        
        // Count operations inside the loop
        if (inLoop) {
            const currentIndentation = indentation;
            
            // We've exited the loop
            if (currentIndentation <= indentationLevel && line !== '') {
                inLoop = false;
                continue;
            }
            
            // Check for break statement
            if (line.includes('break')) {
                return operationsBeforeBreak <= maxOpsBeforeConstant;
            }
            
            // Count operations if the line has actual code
            if (line !== '' && !line.startsWith('#') && !line.startsWith('//')) {
                operationsBeforeBreak++;
            }
            
            // If too many operations before break, it's not a constant-time loop
            if (operationsBeforeBreak > maxOpsBeforeConstant) {
                inLoop = false;
            }
        }
    }
    
    return false;
}

// Helper function to detect if a loop has fixed iterations
function hasFixedIterations(code) {
    // Look for loops with numeric ranges like "for i in range(10):" or "for(i=0; i<5; i++)"
    const fixedRangePattern = /for\s+\w+\s+in\s+range\s*\(\s*\d+\s*\)/i;
    const fixedCounterPattern = /for\s*\(\s*\w+\s*=\s*\d+\s*;\s*\w+\s*[<>]=?\s*\d+\s*;/;
    
    return fixedRangePattern.test(code) || fixedCounterPattern.test(code);
}

// Helper function to detect recursion
function detectRecursion(code) {
    const functionDefs = code.match(/function\s+(\w+)|const\s+(\w+)\s*=\s*function|let\s+(\w+)\s*=\s*function|\b(\w+)\s*:\s*function|def\s+(\w+)/g) || [];
    
    if (functionDefs.length > 0) {
        // Extract function names
        const functionNames = functionDefs.map(def => {
            const match = def.match(/function\s+(\w+)|const\s+(\w+)|let\s+(\w+)|(\w+)\s*:|def\s+(\w+)/);
            if (match) {
                // Return the first non-undefined capture group
                return match.slice(1).find(m => m !== undefined);
            }
            return null;
        }).filter(name => name);
        
        // Check for each function name being called within the code
        for (const funcName of functionNames) {
            const recursiveCallPattern = new RegExp(`\\b${funcName}\\s*\\(`, 'g');
            // Find all occurrences
            const matches = [...code.matchAll(recursiveCallPattern)];
            if (matches.length > 1) {
                return true;
            }
        }
    }
    
    return false;
}

// Algorithm detection functions (keeping the same as before)
function detectMergeSort(code, lowerCode) {
    // Look for merge sort key characteristics
    const hasMergeFunction = /\b(merge)\s*\(/.test(lowerCode);
    const hasMidPointCalc = /\bmid\b|\bmiddle\b|\/\s*2/.test(lowerCode);
    const hasArrayMerging = /\bmerge|\bconcat|\bpush.*shift|\bpush.*splice/.test(lowerCode);
    const hasDivideAndConquer = /\b(left|right)\s*=.*\b\1\s*\(/.test(code);
    
    // More specific patterns
    const hasMergeSortName = /\bmerge.?sort\b/i.test(code);
    const hasMergeSortPattern = 
        hasMergeFunction && 
        hasMidPointCalc && 
        hasArrayMerging && 
        hasDivideAndConquer;
    
    return hasMergeSortName || hasMergeSortPattern || 
           (lowerCode.includes('merge') && 
            lowerCode.includes('sort') && 
            detectRecursion(code));
}

function detectQuickSort(code, lowerCode) {
    // Look for quicksort key characteristics
    const hasPivot = /\bpivot\b/.test(lowerCode);
    const hasPartition = /\bpartition\b/.test(lowerCode);
    const hasQuickSortName = /\bquick.?sort\b/i.test(code);
    
    return hasQuickSortName || (hasPivot && hasPartition && detectRecursion(code));
}

function detectBinarySearch(code, lowerCode) {
    // Look for binary search key characteristics
    const hasMidPoint = /\bmid\b|\bmiddle\b/.test(lowerCode);
    const hasLowHigh = (/\blow\b.*\bhigh\b/.test(lowerCode) || /\bstart\b.*\bend\b/.test(lowerCode));
    const hasComparison = /\bif\s*\([^)]*(?:<=|>=|<|>)/.test(code);
    const hasBinarySearchName = /\bbinary.?search\b/i.test(code);
    
    return hasBinarySearchName || (hasMidPoint && hasLowHigh && hasComparison);
}

function detectDijkstra(code, lowerCode) {
    // Look for Dijkstra algorithm key characteristics
    const hasDijkstraName = /\bdijkstra\b/i.test(code);
    const hasPriorityQueue = /priority.*queue|heap|queue.*priority/i.test(lowerCode);
    const hasDistanceTracking = /\bdistance\b|\bdist\b/.test(lowerCode);
    const hasVisited = /\bvisited\b|\bseen\b/.test(lowerCode);
    
    return hasDijkstraName || (hasPriorityQueue && hasDistanceTracking && hasVisited);
}

function detectBFS(code, lowerCode) {
    // Look for BFS key characteristics
    const hasBFSName = /\bbfs\b|\bbreadth.*first\b/i.test(code);
    const hasQueue = /\bqueue\b|\bshift\b.*\bpush\b/.test(lowerCode);
    const hasVisited = /\bvisited\b|\bseen\b/.test(lowerCode);
    
    return hasBFSName || (hasQueue && hasVisited);
}

function detectDFS(code, lowerCode) {
    // Look for DFS key characteristics
    const hasDFSName = /\bdfs\b|\bdepth.*first\b/i.test(code);
    const hasStack = /\bstack\b|\bpush\b.*\bpop\b/.test(lowerCode);
    const hasVisited = /\bvisited\b|\bseen\b/.test(lowerCode);
    const hasRecursiveTraversal = detectRecursion(code) && /\bvisit\b|\btraverse\b/.test(lowerCode);
    
    return hasDFSName || hasRecursiveTraversal || (hasStack && hasVisited);
}

module.exports = analyzeCode;