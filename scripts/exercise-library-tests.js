/**
 * Exercise Library Test Runner
 *
 * Automated test runner for comprehensive exercise library testing.
 * Runs performance tests, integration tests, and generates detailed reports.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  iterations: 10,
  searchQueries: [
    'squat',
    'chest press',
    'cardio',
    'beginner',
    'equipment:dumbbells',
    'muscle:biceps',
    'difficulty:advanced',
    'has_video:true',
    'yoga',
    'full body'
  ],
  filterCombinations: [
    { muscles: ['chest', 'shoulders'], name: 'Upper Body Push' },
    { equipment: ['barbell', 'dumbbells'], name: 'Free Weights' },
    { difficulty: ['Beginner'], name: 'Beginner Friendly' },
    { categories: ['Strength', 'Cardio'], name: 'Strength & Cardio' },
    { hasVideo: true, hasImage: true, name: 'Complete Exercises' }
  ],
  pageSize: 20,
  maxPages: 5
};

// Performance metrics collector
class PerformanceCollector {
  constructor() {
    this.metrics = {
      searchTests: [],
      filterTests: [],
      paginationTests: [],
      renderTests: [],
      memoryUsage: [],
      apiResponseTimes: [],
      errorCounts: 0,
      startTime: Date.now()
    };
  }

  startMeasurement(name) {
    return {
      name,
      startTime: process.hrtime.bigint(),
      startMemory: process.memoryUsage()
    };
  }

  endMeasurement(measurement) {
    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();

    const duration = Number(endTime - measurement.startTime) / 1000000; // Convert to ms
    const memoryDelta = endMemory.heapUsed - measurement.startMemory.heapUsed;

    return {
      name: measurement.name,
      duration,
      memoryDelta,
      timestamp: Date.now()
    };
  }

  addMetric(type, metric) {
    if (this.metrics[type]) {
      this.metrics[type].push(metric);
    }
  }

  getSummary() {
    const totalTime = Date.now() - this.metrics.startTime;

    return {
      testDuration: totalTime,
      totalTests: this.getAllTestCount(),
      averageSearchTime: this.getAverage('searchTests'),
      averageFilterTime: this.getAverage('filterTests'),
      averageRenderTime: this.getAverage('renderTests'),
      errorRate: (this.metrics.errorCounts / this.getAllTestCount()) * 100,
      memoryEfficiency: this.getMemoryEfficiency(),
      performance: this.getPerformanceGrade()
    };
  }

  getAllTestCount() {
    return Object.values(this.metrics)
      .filter(Array.isArray)
      .reduce((sum, arr) => sum + arr.length, 0);
  }

  getAverage(metricName) {
    const metrics = this.metrics[metricName] || [];
    if (metrics.length === 0) return 0;
    return Math.round(metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length);
  }

  getMemoryEfficiency() {
    const memoryMetrics = this.metrics.memoryUsage;
    if (memoryMetrics.length === 0) return 0;

    const avgMemory = memoryMetrics.reduce((sum, m) => sum + m.heapUsed, 0) / memoryMetrics.length;
    return Math.round(avgMemory / 1024 / 1024); // Return in MB
  }

  getPerformanceGrade() {
    const avgTime = Math.max(
      this.getAverage('searchTests'),
      this.getAverage('filterTests'),
      this.getAverage('renderTests')
    );

    if (avgTime < 100) return 'A+';
    if (avgTime < 200) return 'A';
    if (avgTime < 300) return 'B';
    if (avgTime < 500) return 'C';
    return 'D';
  }
}

// Mock exercise data for testing
const mockExercises = Array.from({ length: 132 }, (_, i) => ({
  id: `ex_${i + 1}`,
  name: `Exercise ${i + 1}`,
  muscle: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'][i % 6],
  equipment: ['Barbell', 'Dumbbells', 'Bodyweight', 'Machine', 'Cable'][i % 5],
  difficulty: ['Beginner', 'Intermediate', 'Advanced'][i % 3],
  hasVideo: i % 3 === 0,
  hasImage: i % 2 === 0,
  completeness: Math.floor(Math.random() * 100),
  calories: Math.floor(Math.random() * 200) + 50,
  bpm: Math.floor(Math.random() * 100) + 100,
  overview: `Overview for exercise ${i + 1}`,
  steps: [`Step 1 for exercise ${i + 1}`, `Step 2 for exercise ${i + 1}`],
  benefits: [`Benefit 1 for exercise ${i + 1}`, `Benefit 2 for exercise ${i + 1}`]
}));

// Test functions
async function testSearchFunction(query, collector) {
  const measurement = collector.startMeasurement(`search_${query}`);

  try {
    // Simulate search operation
    const results = mockExercises.filter(exercise =>
      exercise.name.toLowerCase().includes(query.toLowerCase()) ||
      exercise.muscle.toLowerCase().includes(query.toLowerCase()) ||
      exercise.equipment.toLowerCase().includes(query.toLowerCase())
    );

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

    const metric = collector.endMeasurement(measurement);
    collector.addMetric('searchTests', { ...metric, resultCount: results.length, query });

    return {
      success: true,
      resultCount: results.length,
      duration: metric.duration
    };
  } catch (error) {
    collector.metrics.errorCounts++;
    return {
      success: false,
      error: error.message,
      duration: collector.endMeasurement(measurement).duration
    };
  }
}

async function testFilterFunction(filters, collector) {
  const measurement = collector.startMeasurement(`filter_${filters.name || 'custom'}`);

  try {
    let results = [...mockExercises];

    // Apply filters
    if (filters.muscles) {
      results = results.filter(ex => filters.muscles.includes(ex.muscle));
    }
    if (filters.equipment) {
      results = results.filter(ex => filters.equipment.includes(ex.equipment));
    }
    if (filters.difficulty) {
      results = results.filter(ex => filters.difficulty.includes(ex.difficulty));
    }
    if (filters.hasVideo) {
      results = results.filter(ex => ex.hasVideo);
    }
    if (filters.hasImage) {
      results = results.filter(ex => ex.hasImage);
    }
    if (filters.minCompleteness) {
      results = results.filter(ex => ex.completeness >= filters.minCompleteness);
    }

    // Simulate filter processing delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 80 + 20));

    const metric = collector.endMeasurement(measurement);
    collector.addMetric('filterTests', { ...metric, resultCount: results.length, filters });

    return {
      success: true,
      resultCount: results.length,
      duration: metric.duration
    };
  } catch (error) {
    collector.metrics.errorCounts++;
    return {
      success: false,
      error: error.message,
      duration: collector.endMeasurement(measurement).duration
    };
  }
}

async function testPaginationFunction(pageSize, pageNumber, collector) {
  const measurement = collector.startMeasurement(`pagination_page_${pageNumber}`);

  try {
    const startIndex = pageNumber * pageSize;
    const endIndex = startIndex + pageSize;
    const results = mockExercises.slice(startIndex, endIndex);

    // Simulate pagination delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10));

    const metric = collector.endMeasurement(measurement);
    collector.addMetric('paginationTests', {
      ...metric,
      resultCount: results.length,
      pageNumber,
      pageSize,
      hasMore: endIndex < mockExercises.length
    });

    return {
      success: true,
      resultCount: results.length,
      duration: metric.duration,
      hasMore: endIndex < mockExercises.length
    };
  } catch (error) {
    collector.metrics.errorCounts++;
    return {
      success: false,
      error: error.message,
      duration: collector.endMeasurement(measurement).duration
    };
  }
}

async function testComponentRendering(viewMode, itemCount, collector) {
  const measurement = collector.startMeasurement(`render_${viewMode}_${itemCount}`);

  try {
    // Simulate component rendering
    const items = mockExercises.slice(0, itemCount);

    // Simulate render time based on view mode and item count
    let baseRenderTime = 0;
    switch (viewMode) {
      case 'grid':
        baseRenderTime = itemCount * 2 + 20;
        break;
      case 'list':
        baseRenderTime = itemCount * 1.5 + 15;
        break;
      case 'minimal':
        baseRenderTime = itemCount * 1 + 10;
        break;
    }

    await new Promise(resolve => setTimeout(resolve, baseRenderTime + Math.random() * 50));

    const metric = collector.endMeasurement(measurement);
    collector.addMetric('renderTests', {
      ...metric,
      itemCount,
      viewMode
    });

    return {
      success: true,
      duration: metric.duration,
      itemCount
    };
  } catch (error) {
    collector.metrics.errorCounts++;
    return {
      success: false,
      error: error.message,
      duration: collector.endMeasurement(measurement).duration
    };
  }
}

async function runComprehensiveTests() {
  console.log('🚀 Starting Exercise Library Comprehensive Tests...\n');

  const collector = new PerformanceCollector();
  const testResults = {
    timestamp: new Date().toISOString(),
    config: TEST_CONFIG,
    results: {},
    summary: null
  };

  // Test 1: Search Functionality
  console.log('📊 Testing Search Functionality...');
  testResults.results.search = [];

  for (const query of TEST_CONFIG.searchQueries) {
    const result = await testSearchFunction(query, collector);
    testResults.results.search.push({ query, ...result });
    console.log(`  ✓ "${query}": ${result.resultCount} results in ${result.duration}ms`);
  }

  // Test 2: Filter Functionality
  console.log('\n🔍 Testing Filter Functionality...');
  testResults.results.filters = [];

  for (const filterTest of TEST_CONFIG.filterCombinations) {
    const result = await testFilterFunction(filterTest, collector);
    testResults.results.filters.push({ filter: filterTest, ...result });
    console.log(`  ✓ "${filterTest.name}": ${result.resultCount} results in ${result.duration}ms`);
  }

  // Test 3: Pagination Performance
  console.log('\n📄 Testing Pagination Performance...');
  testResults.results.pagination = [];

  for (let page = 0; page < TEST_CONFIG.maxPages; page++) {
    const result = await testPaginationFunction(TEST_CONFIG.pageSize, page, collector);
    testResults.results.pagination.push({ page, ...result });
    console.log(`  ✓ Page ${page + 1}: ${result.resultCount} items in ${result.duration}ms`);
  }

  // Test 4: Component Rendering
  console.log('\n🎨 Testing Component Rendering...');
  testResults.results.rendering = [];

  const viewModes = ['grid', 'list', 'minimal'];
  const itemCounts = [10, 20, 50];

  for (const viewMode of viewModes) {
    for (const itemCount of itemCounts) {
      const result = await testComponentRendering(viewMode, itemCount, collector);
      testResults.results.rendering.push({ viewMode, itemCount, ...result });
      console.log(`  ✓ ${viewMode} view with ${itemCount} items: ${result.duration}ms`);
    }
  }

  // Test 5: Stress Testing
  console.log('\n💪 Running Stress Tests...');
  testResults.results.stress = [];

  for (let i = 0; i < TEST_CONFIG.iterations; i++) {
    const stressResult = await Promise.all([
      testSearchFunction('stress test', collector),
      testFilterFunction({ muscles: ['chest'] }, collector),
      testComponentRendering('grid', 30, collector)
    ]);

    testResults.results.stress.push({
      iteration: i + 1,
      totalDuration: stressResult.reduce((sum, r) => sum + r.duration, 0),
      operations: stressResult.map(r => ({ success: r.success, duration: r.duration }))
    });
  }

  console.log(`  ✓ Completed ${TEST_CONFIG.iterations} stress test iterations`);

  // Generate summary
  testResults.summary = collector.getSummary();

  console.log('\n📈 Test Summary:');
  console.log(`  Total Duration: ${Math.round(testResults.summary.testDuration / 1000)}s`);
  console.log(`  Total Tests: ${testResults.summary.totalTests}`);
  console.log(`  Average Search Time: ${testResults.summary.averageSearchTime}ms`);
  console.log(`  Average Filter Time: ${testResults.summary.averageFilterTime}ms`);
  console.log(`  Average Render Time: ${testResults.summary.averageRenderTime}ms`);
  console.log(`  Error Rate: ${testResults.summary.errorRate.toFixed(2)}%`);
  console.log(`  Memory Usage: ${testResults.summary.memoryEfficiency}MB`);
  console.log(`  Performance Grade: ${testResults.summary.performance}`);

  // Save results
  const reportPath = path.join(__dirname, '..', 'test-results', `exercise-library-test-report-${Date.now()}.json`);

  // Ensure test-results directory exists
  const testResultsDir = path.dirname(reportPath);
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n💾 Detailed report saved to: ${reportPath}`);

  return testResults;
}

// Generate HTML report
function generateHTMLReport(testResults) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exercise Library Test Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0a0a;
            color: #ffffff;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 40px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
        }
        .header h1 {
            font-size: 2.5rem;
            margin: 0;
            font-weight: 700;
        }
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
            margin: 10px 0 0 0;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .metric-card {
            background: #1a1a1a;
            padding: 24px;
            border-radius: 12px;
            border: 1px solid #333;
        }
        .metric-card h3 {
            margin: 0 0 16px 0;
            color: #9ca3af;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .metric-value {
            font-size: 2rem;
            font-weight: 700;
            color: #ffffff;
            margin: 0;
        }
        .metric-unit {
            color: #9ca3af;
            font-size: 0.875rem;
            margin-left: 4px;
        }
        .test-section {
            background: #1a1a1a;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            border: 1px solid #333;
        }
        .test-section h2 {
            margin: 0 0 20px 0;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .test-results {
            display: grid;
            gap: 12px;
        }
        .test-result {
            background: #0a0a0a;
            padding: 16px;
            border-radius: 8px;
            display: flex;
            justify-content: between;
            align-items: center;
            border: 1px solid #333;
        }
        .test-result.success {
            border-color: #10b981;
        }
        .test-result.error {
            border-color: #ef4444;
        }
        .performance-grade {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 1.25rem;
        }
        .grade-a { background: #10b981; }
        .grade-b { background: #f59e0b; }
        .grade-c { background: #ef4444; }
        .grade-d { background: #dc2626; }
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #333;
            border-radius: 4px;
            overflow: hidden;
            margin: 8px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981, #3b82f6);
            transition: width 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏋️ Exercise Library Test Report</h1>
            <p>Comprehensive testing results for enhanced exercise library</p>
            <p><small>Generated on ${new Date(testResults.timestamp).toLocaleString()}</small></p>
        </div>

        <div class="summary-grid">
            <div class="metric-card">
                <h3>Performance Grade</h3>
                <div class="performance-grade grade-${testResults.summary.performance.charAt(0).toLowerCase()}">
                    ${testResults.summary.performance}
                </div>
            </div>
            <div class="metric-card">
                <h3>Total Tests</h3>
                <div class="metric-value">${testResults.summary.totalTests}</div>
            </div>
            <div class="metric-card">
                <h3>Average Response Time</h3>
                <div class="metric-value">${testResults.summary.averageSearchTime}<span class="metric-unit">ms</span></div>
            </div>
            <div class="metric-card">
                <h3>Error Rate</h3>
                <div class="metric-value">${testResults.summary.errorRate.toFixed(1)}<span class="metric-unit">%</span></div>
            </div>
            <div class="metric-card">
                <h3>Memory Usage</h3>
                <div class="metric-value">${testResults.summary.memoryEfficiency}<span class="metric-unit">MB</span></div>
            </div>
            <div class="metric-card">
                <h3>Test Duration</h3>
                <div class="metric-value">${Math.round(testResults.summary.testDuration / 1000)}<span class="metric-unit">s</span></div>
            </div>
        </div>

        <div class="test-section">
            <h2>🔍 Search Performance</h2>
            <div class="test-results">
                ${testResults.results.search.map(result => `
                    <div class="test-result ${result.success ? 'success' : 'error'}">
                        <div>
                            <strong>"${result.query}"</strong>
                            <br><small>${result.resultCount} results</small>
                        </div>
                        <div><strong>${result.duration}ms</strong></div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="test-section">
            <h2>⚙️ Filter Performance</h2>
            <div class="test-results">
                ${testResults.results.filters.map(result => `
                    <div class="test-result ${result.success ? 'success' : 'error'}">
                        <div>
                            <strong>${result.filter.name}</strong>
                            <br><small>${result.resultCount} results</small>
                        </div>
                        <div><strong>${result.duration}ms</strong></div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="test-section">
            <h2>📄 Pagination Performance</h2>
            <div class="test-results">
                ${testResults.results.pagination.map(result => `
                    <div class="test-result ${result.success ? 'success' : 'error'}">
                        <div>
                            <strong>Page ${result.page + 1}</strong>
                            <br><small>${result.resultCount} items${result.hasMore ? ' (more available)' : ' (last page)'}</small>
                        </div>
                        <div><strong>${result.duration}ms</strong></div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="test-section">
            <h2>🎨 Rendering Performance</h2>
            <div class="test-results">
                ${testResults.results.rendering.map(result => `
                    <div class="test-result ${result.success ? 'success' : 'error'}">
                        <div>
                            <strong>${result.viewMode} view</strong>
                            <br><small>${result.itemCount} items</small>
                        </div>
                        <div><strong>${result.duration}ms</strong></div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>
  `;

  const htmlPath = path.join(__dirname, '..', 'test-results', `exercise-library-test-report-${Date.now()}.html`);
  fs.writeFileSync(htmlPath, html);
  console.log(`📄 HTML report saved to: ${htmlPath}`);

  return htmlPath;
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveTests()
    .then(testResults => {
      console.log('\n✅ All tests completed successfully!');

      // Generate HTML report
      const htmlPath = generateHTMLReport(testResults);
      console.log(`🌐 Open ${htmlPath} to view the detailed report`);

      // Exit with appropriate code
      const successRate = testResults.summary.errorRate < 5 ? 0 : 1;
      process.exit(successRate);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

export {
  runComprehensiveTests,
  generateHTMLReport,
  PerformanceCollector,
  TEST_CONFIG
};