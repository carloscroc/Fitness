/**
 * GitHub Issues Automation Service
 *
 * Automatically creates GitHub issues for missing exercise data during migration.
 * This helps track and prioritize data enrichment efforts.
 */

import { MissingDataInfo } from '../types/exercise';
import { isFeatureEnabled } from './featureFlags';

/**
 * GitHub API configuration
 */
interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  apiUrl: string;
}

/**
 * GitHub issue structure
 */
interface GitHubIssue {
  title: string;
  body: string;
  labels: string[];
  assignees?: string[];
}

/**
 * GitHub API response
 */
interface GitHubIssueResponse {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
}

/**
 * Issue creation result
 */
export interface IssueCreationResult {
  success: boolean;
  issueNumber?: number;
  issueUrl?: string;
  error?: string;
  exerciseName: string;
}

/**
 * Get GitHub configuration from environment variables
 */
function getGitHubConfig(): GitHubConfig | null {
  const token = import.meta.env.GITHUB_TOKEN;
  const owner = import.meta.env.GITHUB_OWNER;
  const repo = import.meta.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    console.warn('🏋️ GitHub configuration missing. Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO in environment.');
    return null;
  }

  return {
    token,
    owner,
    repo,
    apiUrl: 'https://api.github.com'
  };
}

/**
 * Check if GitHub issues automation is enabled
 */
export function isGitHubIssuesEnabled(): boolean {
  return isFeatureEnabled('AUTO_CREATE_GITHUB_ISSUES', false) && getGitHubConfig() !== null;
}

/**
 * Create an issue on GitHub
 */
async function createGitHubIssue(
  config: GitHubConfig,
  issue: GitHubIssue
): Promise<GitHubIssueResponse> {
  const response = await fetch(`${config.apiUrl}/repos/${config.owner}/${config.repo}/issues`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(issue)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Generate GitHub issue body for missing exercise data
 */
function generateIssueBody(missingData: MissingDataInfo): string {
  const { exerciseName, missingFields, priority, suggestedData } = missingData;

  const priorityEmoji = priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢';
  const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);

  let body = `## ${priorityEmoji} Missing Exercise Data: ${exerciseName}

**Priority:** ${priorityLabel}
**Data Source:** ${missingData.dataSource}
**Exercise ID:** ${missingData.exerciseId}

### Missing Fields

`;

  // List missing fields with descriptions
  const fieldDescriptions: Record<string, string> = {
    'video': 'YouTube video URL demonstrating proper form',
    'steps': 'Step-by-step instructions for performing the exercise',
    'benefits': 'List of benefits and muscle groups targeted',
    'image': 'High-quality image URL showing exercise starting position',
    'calories': 'Estimated calories burned per minute of exercise',
    'bpm': 'Target heart rate zone for the exercise',
    'difficulty': 'Difficulty level (Beginner/Intermediate/Advanced)'
  };

  missingFields.forEach(field => {
    const description = fieldDescriptions[field] || field;
    body += `- **${field.charAt(0).toUpperCase() + field.slice(1)}**: ${description}\n`;
  });

  // Add suggested data if available
  if (suggestedData && Object.keys(suggestedData).length > 0) {
    body += `

### Suggested Data

`;

    Object.entries(suggestedData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        body += `**${key.charAt(0).toUpperCase() + key.slice(1)}:**\n`;
        value.forEach((item, index) => {
          body += `${index + 1}. ${item}\n`;
        });
      } else {
        body += `**${key.charAt(0).toUpperCase() + key.slice(1)}:** ${value}\n`;
      }
    });
  }

  body += `

### Acceptance Criteria

- [ ] Add missing video URL (preferably YouTube)
- [ ] Provide detailed step-by-step instructions
- [ ] Include comprehensive benefits list
- [ ] Add high-quality exercise image
- [ ] Set appropriate difficulty level
- [ ] Estimate calorie burn rate
- [ ] Set target heart rate zone

### Additional Context

This issue was automatically generated during the exercise data migration from frontend static data to backend live data. The goal is to enrich our exercise database with comprehensive information to provide the best user experience.

**Related:** Exercise Migration Initiative
**Created:** ${new Date().toISOString()}
`;

  return body;
}

/**
 * Generate appropriate labels for the issue
 */
function generateIssueLabels(missingData: MissingDataInfo): string[] {
  const labels = ['exercise-data', 'data-migration'];

  // Add priority label
  labels.push(`priority: ${missingData.priority}`);

  // Add specific field labels
  missingData.missingFields.forEach(field => {
    labels.push(`missing-${field}`);
  });

  // Add data source label
  labels.push(`source: ${missingData.dataSource}`);

  return labels;
}

/**
 * Create a GitHub issue for missing exercise data
 */
export async function createMissingDataIssue(
  missingData: MissingDataInfo
): Promise<IssueCreationResult> {
  try {
    const config = getGitHubConfig();
    if (!config) {
      return {
        success: false,
        error: 'GitHub configuration not available',
        exerciseName: missingData.exerciseName
      };
    }

    // Generate issue content
    const title = `Missing Exercise Data: ${missingData.exerciseName}`;
    const body = generateIssueBody(missingData);
    const labels = generateIssueLabels(missingData);

    const issue: GitHubIssue = {
      title,
      body,
      labels
    };

    // Create the issue
    const response = await createGitHubIssue(config, issue);

    console.log(`🏋️ Created GitHub issue #${response.number}: ${title}`);

    return {
      success: true,
      issueNumber: response.number,
      issueUrl: response.html_url,
      exerciseName: missingData.exerciseName
    };

  } catch (error) {
    console.error(`🏋️ Failed to create GitHub issue for ${missingData.exerciseName}:`, error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      exerciseName: missingData.exerciseName
    };
  }
}

/**
 * Create multiple GitHub issues in batch
 */
export async function createMissingDataIssues(
  missingDataList: MissingDataInfo[]
): Promise<IssueCreationResult[]> {
  const results: IssueCreationResult[] = [];

  console.log(`🏋️ Creating ${missingDataList.length} GitHub issues for missing exercise data...`);

  // Process issues in batches to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < missingDataList.length; i += batchSize) {
    const batch = missingDataList.slice(i, i + batchSize);

    // Create issues concurrently within the batch
    const batchPromises = batch.map(missingData => createMissingDataIssue(missingData));
    const batchResults = await Promise.all(batchPromises);

    results.push(...batchResults);

    // Rate limiting: wait between batches
    if (i + batchSize < missingDataList.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`🏋️ GitHub issues creation completed: ${successful} successful, ${failed} failed`);

  return results;
}

/**
 * Check if an issue already exists for an exercise
 */
export async function checkExistingIssue(
  exerciseName: string
): Promise<GitHubIssueResponse | null> {
  try {
    const config = getGitHubConfig();
    if (!config) return null;

    const query = `repo:${config.owner}/${config.repo} "Missing Exercise Data: ${exerciseName}" in:title`;
    const searchUrl = `${config.apiUrl}/search/issues?q=${encodeURIComponent(query)}`;

    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0];
    }

    return null;

  } catch (error) {
    console.warn(`🏋️ Failed to check existing issues for ${exerciseName}:`, error);
    return null;
  }
}

/**
 * Create issues only if they don't already exist
 */
export async function createMissingDataIssuesIfNotExists(
  missingDataList: MissingDataInfo[]
): Promise<IssueCreationResult[]> {
  const results: IssueCreationResult[] = [];

  for (const missingData of missingDataList) {
    // Check if issue already exists
    const existingIssue = await checkExistingIssue(missingData.exerciseName);

    if (existingIssue) {
      console.log(`🏋️ Issue already exists for ${missingData.exerciseName}: #${existingIssue.number}`);
      results.push({
        success: true,
        issueNumber: existingIssue.number,
        issueUrl: existingIssue.html_url,
        exerciseName: missingData.exerciseName
      });
    } else {
      // Create new issue
      const result = await createMissingDataIssue(missingData);
      results.push(result);
    }

    // Small delay between checks
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return results;
}

/**
 * Get summary of issue creation results
 */
export function getIssueCreationSummary(results: IssueCreationResult[]): {
  total: number;
  successful: number;
  failed: number;
  failedExercises: string[];
  successfulIssues: Array<{ number: number; url: string; name: string }>;
} {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  return {
    total: results.length,
    successful: successful.length,
    failed: failed.length,
    failedExercises: failed.map(r => r.exerciseName),
    successfulIssues: successful.map(r => ({
      number: r.issueNumber!,
      url: r.issueUrl!,
      name: r.exerciseName
    }))
  };
}