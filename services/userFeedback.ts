/**
 * User Feedback Collection Service
 *
 * Comprehensive user feedback system for the enhanced exercise library rollout.
 * Collects, categorizes, and analyzes user feedback to improve the product.
 */

import { getErrorTracker } from './errorTracking';

interface FeedbackOptions {
  type: 'rating' | 'survey' | 'nps' | 'feature_request' | 'bug_report' | 'general';
  title: string;
  description?: string;
  questions?: FeedbackQuestion[];
  trigger?: FeedbackTrigger;
  targeting?: FeedbackTargeting;
  rewards?: FeedbackReward;
}

interface FeedbackQuestion {
  id: string;
  type: 'rating' | 'text' | 'multiple_choice' | 'checkbox' | 'nps';
  text: string;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  placeholder?: string;
}

interface FeedbackTrigger {
  type: 'immediate' | 'delayed' | 'event_based' | 'frequency_based';
  delay?: number; // milliseconds
  event?: string; // event name
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  maxViews?: number;
}

interface FeedbackTargeting {
  userSegments?: string[];
  features?: string[];
  environment?: string[];
  rolloutPhase?: number[];
  customCriteria?: (context: FeedbackContext) => boolean;
}

interface FeedbackReward {
  type: 'points' | 'badge' | 'discount' | 'premium_time';
  value: number;
  description: string;
}

interface FeedbackContext {
  userId?: string;
  sessionId?: string;
  feature?: string;
  component?: string;
  action?: string;
  userAgent?: string;
  url?: string;
  timestamp?: Date;
  environment?: string;
  rolloutPhase?: string;
  userSegment?: string;
  sessionDuration?: number;
  featureUsage?: Record<string, number>;
}

interface FeedbackResponse {
  id: string;
  feedbackId: string;
  userId?: string;
  sessionId: string;
  responses: Array<{
    questionId: string;
    answer: any;
    duration?: number;
  }>;
  context: FeedbackContext;
  rating?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  category?: string;
  tags: string[];
  createdAt: Date;
  completed: boolean;
  rewardClaimed?: boolean;
}

interface FeedbackAnalytics {
  totalResponses: number;
  completionRate: number;
  averageRating: number;
  responsesByType: Record<string, number>;
  responsesByFeature: Record<string, number>;
  sentimentDistribution: Record<string, number>;
  commonThemes: Array<{
    theme: string;
    count: number;
    examples: string[];
  }>;
}

class UserFeedback {
  private feedbacks: Map<string, FeedbackOptions> = new Map();
  private responses: FeedbackResponse[] = [];
  private activeFeedback: string | null = null;
  private feedbackHistory: Map<string, number> = new Map();
  private isEnabled: boolean;
  private environment: string;

  constructor(options: { enabled?: boolean; environment?: string } = {}) {
    this.isEnabled = options.enabled !== false;
    this.environment = options.environment || import.meta.env.NODE_ENV || 'development';

    if (this.isEnabled) {
      this.loadDefaultFeedbacks();
    }
  }

  private loadDefaultFeedbacks(): void {
    // Exercise Library Rating
    this.registerFeedback('exercise_library_rating', {
      type: 'rating',
      title: 'How would you rate your experience with the enhanced exercise library?',
      description: 'Your feedback helps us improve the exercise library for everyone.',
      questions: [
        {
          id: 'overall_rating',
          type: 'rating',
          text: 'Overall experience',
          required: true,
          min: 1,
          max: 5
        },
        {
          id: 'ease_of_use',
          type: 'rating',
          text: 'Ease of use',
          required: true,
          min: 1,
          max: 5
        },
        {
          id: 'feature_satisfaction',
          type: 'multiple_choice',
          text: 'Which features do you find most useful?',
          options: [
            'Enhanced search and filtering',
            'Video integration',
            'Progress tracking',
            'Personalized recommendations',
            'Social features'
          ],
          required: false
        },
        {
          id: 'improvement_suggestions',
          type: 'text',
          text: 'What would you like to see improved?',
          placeholder: 'Share your suggestions...',
          required: false
        }
      ],
      trigger: {
        type: 'frequency_based',
        frequency: 'weekly',
        maxViews: 1
      },
      targeting: {
        features: ['ENHANCED_EXERCISE_LIBRARY'],
        userSegments: ['beta_tester', 'power_user']
      },
      rewards: {
        type: 'points',
        value: 50,
        description: '50 points for your feedback'
      }
    });

    // NPS Survey
    this.registerFeedback('nps_survey', {
      type: 'nps',
      title: 'How likely are you to recommend our fitness app to a friend?',
      description: 'On a scale of 0-10, how likely would you be to recommend our app?',
      questions: [
        {
          id: 'nps_score',
          type: 'nps',
          text: 'Rating (0 = Not likely, 10 = Very likely)',
          required: true,
          min: 0,
          max: 10
        },
        {
          id: 'nps_reason',
          type: 'text',
          text: 'What is the primary reason for your score?',
          placeholder: 'Tell us more...',
          required: false
        }
      ],
      trigger: {
        type: 'frequency_based',
        frequency: 'monthly',
        maxViews: 1
      },
      targeting: {
        userSegments: ['power_user', 'regular_user']
      }
    });

    // Feature Request
    this.registerFeedback('feature_request', {
      type: 'feature_request',
      title: 'Have a feature idea?',
      description: 'We\'d love to hear your ideas for new features!',
      questions: [
        {
          id: 'feature_title',
          type: 'text',
          text: 'Feature title',
          placeholder: 'Brief title for your feature idea',
          required: true
        },
        {
          id: 'feature_description',
          type: 'text',
          text: 'Describe your feature idea',
          placeholder: 'How would this feature work? What problem would it solve?',
          required: true
        },
        {
          id: 'feature_priority',
          type: 'multiple_choice',
          text: 'How important is this feature to you?',
          options: ['Nice to have', 'Would use occasionally', 'Would use daily', 'Essential'],
          required: true
        }
      ],
      trigger: {
        type: 'event_based',
        event: 'feature_request_clicked'
      },
      targeting: {
        userSegments: ['beta_tester', 'power_user']
      }
    });

    // Bug Report
    this.registerFeedback('bug_report', {
      type: 'bug_report',
      title: 'Report a bug',
      description: 'Help us fix issues by reporting bugs you encounter.',
      questions: [
        {
          id: 'bug_description',
          type: 'text',
          text: 'What happened?',
          placeholder: 'Describe the issue you encountered...',
          required: true
        },
        {
          id: 'bug_steps',
          type: 'text',
          text: 'Steps to reproduce',
          placeholder: 'What did you do that led to this issue?',
          required: true
        },
        {
          id: 'bug_expected',
          type: 'text',
          text: 'What did you expect to happen?',
          placeholder: 'Describe the expected behavior...',
          required: false
        },
        {
          id: 'bug_severity',
          type: 'multiple_choice',
          text: 'How severe is this issue?',
          options: ['Minor annoyance', 'Impacts usability', 'Prevents feature use', 'Critical issue'],
          required: true
        }
      ],
      trigger: {
        type: 'event_based',
        event: 'bug_report_clicked'
      }
    });
  }

  // Public API

  public registerFeedback(id: string, options: FeedbackOptions): void {
    this.feedbacks.set(id, options);
  }

  public shouldShowFeedback(feedbackId: string, context: FeedbackContext): boolean {
    const feedback = this.feedbacks.get(feedbackId);
    if (!feedback || !this.isEnabled) return false;

    // Check targeting criteria
    if (!this.checkTargeting(feedback.targeting, context)) {
      return false;
    }

    // Check frequency limits
    if (!this.checkFrequency(feedbackId, feedback.trigger)) {
      return false;
    }

    return true;
  }

  private checkTargeting(targeting?: FeedbackTargeting, context?: FeedbackContext): boolean {
    if (!targeting) return true;

    if (targeting.userSegments && context?.userSegment &&
        !targeting.userSegments.includes(context.userSegment)) {
      return false;
    }

    if (targeting.features && context?.feature &&
        !targeting.features.some(feature => context.feature?.includes(feature))) {
      return false;
    }

    if (targeting.environment && !targeting.environment.includes(this.environment)) {
      return false;
    }

    if (targeting.customCriteria && context && !targeting.customCriteria(context)) {
      return false;
    }

    return true;
  }

  private checkFrequency(feedbackId: string, trigger?: FeedbackTrigger): boolean {
    if (!trigger || trigger.type !== 'frequency_based') return true;

    const history = this.feedbackHistory.get(feedbackId) || 0;
    if (trigger.maxViews && history >= trigger.maxViews) {
      return false;
    }

    // Check frequency timing
    const lastResponse = this.responses
      .filter(r => r.feedbackId === feedbackId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (!lastResponse) return true;

    const now = new Date();
    const timeDiff = now.getTime() - lastResponse.createdAt.getTime();
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

    switch (trigger.frequency) {
      case 'daily':
        return daysDiff >= 1;
      case 'weekly':
        return daysDiff >= 7;
      case 'monthly':
        return daysDiff >= 30;
      default:
        return true;
    }
  }

  public startFeedback(feedbackId: string, context: FeedbackContext): void {
    const feedback = this.feedbacks.get(feedbackId);
    if (!feedback) return;

    this.activeFeedback = feedbackId;

    // Increment view count
    const currentCount = this.feedbackHistory.get(feedbackId) || 0;
    this.feedbackHistory.set(feedbackId, currentCount + 1);

    // Track feedback start
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'feedback_started', {
        feedback_id: feedbackId,
        feedback_type: feedback.type,
        user_id: context.userId
      });
    }
  }

  public submitFeedback(feedbackId: string, responses: Array<{ questionId: string; answer: any }>, context: FeedbackContext): string {
    const feedback = this.feedbacks.get(feedbackId);
    if (!feedback) return '';

    const responseId = `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Calculate overall rating if applicable
    let overallRating: number | undefined;
    const ratingQuestion = responses.find(r =>
      feedback.questions.find(q => q.id === r.questionId && q.type === 'rating')
    );
    if (ratingQuestion && typeof ratingQuestion.answer === 'number') {
      overallRating = ratingQuestion.answer;
    }

    // Analyze sentiment
    const sentiment = this.analyzeSentiment(responses, feedback);

    // Extract tags
    const tags = this.extractTags(responses, feedback, context);

    const feedbackResponse: FeedbackResponse = {
      id: responseId,
      feedbackId,
      userId: context.userId,
      sessionId: context.sessionId || 'unknown',
      responses,
      context,
      rating: overallRating,
      sentiment,
      category: feedback.type,
      tags,
      createdAt: new Date(),
      completed: true
    };

    this.responses.push(feedbackResponse);

    // Process reward if applicable
    if (feedback.rewards && overallRating && overallRating >= 4) {
      this.processReward(feedbackResponse, feedback.rewards);
    }

    // Track submission
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'feedback_submitted', {
        feedback_id: feedbackId,
        feedback_type: feedback.type,
        rating: overallRating,
        sentiment,
        user_id: context.userId
      });
    }

    // Send to external service
    this.sendFeedbackData(feedbackResponse);

    this.activeFeedback = null;

    return responseId;
  }

  private analyzeSentiment(responses: Array<{ questionId: string; answer: any }>, feedback: FeedbackOptions): 'positive' | 'neutral' | 'negative' {
    // Check for explicit rating
    const ratingResponse = responses.find(r => {
      const question = feedback.questions.find(q => q.id === r.questionId);
      return question && question.type === 'rating';
    });

    if (ratingResponse && typeof ratingResponse.answer === 'number') {
      if (ratingResponse.answer >= 4) return 'positive';
      if (ratingResponse.answer <= 2) return 'negative';
      return 'neutral';
    }

    // Analyze text responses for sentiment
    const textResponses = responses.filter(r => {
      const question = feedback.questions.find(q => q.id === r.questionId);
      return question && question.type === 'text' && typeof r.answer === 'string';
    });

    for (const response of textResponses) {
      const text = (response.answer as string).toLowerCase();
      if (text.includes('excellent') || text.includes('great') || text.includes('love') || text.includes('amazing')) {
        return 'positive';
      }
      if (text.includes('terrible') || text.includes('awful') || text.includes('hate') || text.includes('frustrating')) {
        return 'negative';
      }
    }

    return 'neutral';
  }

  private extractTags(responses: Array<{ questionId: string; answer: any }>, feedback: FeedbackOptions, context: FeedbackContext): string[] {
    const tags: string[] = [];

    // Add context tags
    if (context.feature) tags.push(`feature:${context.feature}`);
    if (context.component) tags.push(`component:${context.component}`);

    // Add response-based tags
    responses.forEach(response => {
      const question = feedback.questions.find(q => q.id === response.questionId);
      if (!question) return;

      if (question.type === 'multiple_choice' && Array.isArray(response.answer)) {
        response.answer.forEach((answer: string) => {
          tags.push(`response:${answer.toLowerCase().replace(/\s+/g, '_')}`);
        });
      }

      if (question.type === 'text' && typeof response.answer === 'string') {
        const text = response.answer.toLowerCase();
        if (text.includes('slow') || text.includes('performance')) tags.push('performance_issue');
        if (text.includes('bug') || text.includes('crash') || text.includes('error')) tags.push('bug_report');
        if (text.includes('feature') || text.includes('add') || text.includes('new')) tags.push('feature_request');
        if (text.includes('ui') || text.includes('design') || text.includes('layout')) tags.push('ui_feedback');
      }
    });

    return [...new Set(tags)]; // Remove duplicates
  }

  private processReward(response: FeedbackResponse, reward: FeedbackReward): void {
    // Mark reward for claiming
    response.rewardClaimed = false;

    // Store reward info
    localStorage.setItem(`reward_${response.id}`, JSON.stringify({
      type: reward.type,
      value: reward.value,
      description: reward.description,
      claimed: false,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }));

    // Notify user
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('feedback_reward', {
        detail: {
          responseId: response.id,
          reward
        }
      }));
    }
  }

  public claimReward(responseId: string): boolean {
    const rewardData = localStorage.getItem(`reward_${responseId}`);
    if (!rewardData) return false;

    const reward = JSON.parse(rewardData);
    if (reward.claimed) return false;

    // Process reward based on type
    switch (reward.type) {
      case 'points':
        // Add points to user account
        const currentPoints = parseInt(localStorage.getItem('user_points') || '0', 10);
        localStorage.setItem('user_points', (currentPoints + reward.value).toString());
        break;
      case 'badge':
        // Award badge to user
        const badges = JSON.parse(localStorage.getItem('user_badges') || '[]');
        badges.push({
          id: `feedback_${Date.now()}`,
          name: 'Feedback Contributor',
          description: reward.description,
          earnedAt: new Date().toISOString()
        });
        localStorage.setItem('user_badges', JSON.stringify(badges));
        break;
    }

    reward.claimed = true;
    localStorage.setItem(`reward_${responseId}`, JSON.stringify(reward));

    return true;
  }

  private sendFeedbackData(response: FeedbackResponse): void {
    // Send to analytics service
    if (this.environment === 'production' && import.meta.env.VITE_FEEDBACK_ENDPOINT) {
      fetch(import.meta.env.VITE_FEEDBACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response)
      }).catch(error => {
        console.error('[User Feedback] Failed to send feedback:', error);
        // Track as error
        getErrorTracker().captureError(error, {
          component: 'user_feedback',
          action: 'send_feedback'
        });
      });
    }

    // Log to error tracker for bug reports
    if (response.category === 'bug_report') {
      const bugDescription = response.responses.find(r => r.questionId === 'bug_description')?.answer;
      if (bugDescription) {
        getErrorTracker().captureUserFeedback(
          response.context.feature || 'unknown',
          bugDescription as string,
          response.rating
        );
      }
    }
  }

  public getFeedbackAnalytics(timeRange?: { start: Date; end: Date }): FeedbackAnalytics {
    const filteredResponses = timeRange
      ? this.responses.filter(r => r.createdAt >= timeRange.start && r.createdAt <= timeRange.end)
      : this.responses;

    const totalResponses = filteredResponses.length;
    const completedResponses = filteredResponses.filter(r => r.completed).length;
    const completionRate = totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0;

    const ratings = filteredResponses
      .map(r => r.rating)
      .filter((r): r is number => r !== undefined);

    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : 0;

    const responsesByType: Record<string, number> = {};
    const responsesByFeature: Record<string, number> = {};
    const sentimentDistribution: Record<string, number> = { positive: 0, neutral: 0, negative: 0 };

    filteredResponses.forEach(response => {
      responsesByType[response.category] = (responsesByType[response.category] || 0) + 1;

      if (response.context.feature) {
        responsesByFeature[response.context.feature] = (responsesByFeature[response.context.feature] || 0) + 1;
      }

      if (response.sentiment) {
        sentimentDistribution[response.sentiment] = (sentimentDistribution[response.sentiment] || 0) + 1;
      }
    });

    // Extract common themes from text responses
    const commonThemes = this.extractCommonThemes(filteredResponses);

    return {
      totalResponses,
      completionRate,
      averageRating,
      responsesByType,
      responsesByFeature,
      sentimentDistribution,
      commonThemes
    };
  }

  private extractCommonThemes(responses: FeedbackResponse[]): Array<{ theme: string; count: number; examples: string[] }> {
    const textResponses: string[] = [];

    responses.forEach(response => {
      response.responses.forEach(r => {
        if (typeof r.answer === 'string' && r.answer.length > 10) {
          textResponses.push(r.answer);
        }
      });
    });

    // Simple theme extraction (in production, use NLP service)
    const themes: Record<string, { count: number; examples: string[] }> = {};

    textResponses.forEach(text => {
      const lowerText = text.toLowerCase();

      // Look for common themes
      if (lowerText.includes('search') || lowerText.includes('filter')) {
        const theme = 'Search & Filtering';
        if (!themes[theme]) themes[theme] = { count: 0, examples: [] };
        themes[theme].count++;
        if (themes[theme].examples.length < 3) themes[theme].examples.push(text.substring(0, 100) + '...');
      }

      if (lowerText.includes('video') || lowerText.includes('media')) {
        const theme = 'Video Content';
        if (!themes[theme]) themes[theme] = { count: 0, examples: [] };
        themes[theme].count++;
        if (themes[theme].examples.length < 3) themes[theme].examples.push(text.substring(0, 100) + '...');
      }

      if (lowerText.includes('performance') || lowerText.includes('slow') || lowerText.includes('fast')) {
        const theme = 'Performance';
        if (!themes[theme]) themes[theme] = { count: 0, examples: [] };
        themes[theme].count++;
        if (themes[theme].examples.length < 3) themes[theme].examples.push(text.substring(0, 100) + '...');
      }

      if (lowerText.includes('ui') || lowerText.includes('design') || lowerText.includes('layout')) {
        const theme = 'User Interface';
        if (!themes[theme]) themes[theme] = { count: 0, examples: [] };
        themes[theme].count++;
        if (themes[theme].examples.length < 3) themes[theme].examples.push(text.substring(0, 100) + '...');
      }
    });

    return Object.entries(themes)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([theme, data]) => ({ theme, ...data }));
  }

  public getFeedback(feedbackId: string): FeedbackOptions | undefined {
    return this.feedbacks.get(feedbackId);
  }

  public getActiveFeedback(): string | null {
    return this.activeFeedback;
  }

  public exportFeedbackData(): string {
    return JSON.stringify({
      feedbacks: Array.from(this.feedbacks.entries()),
      responses: this.responses,
      analytics: this.getFeedbackAnalytics(),
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  public clearResponses(): void {
    this.responses = [];
  }

  public destroy(): void {
    this.feedbacks.clear();
    this.responses = [];
    this.feedbackHistory.clear();
    this.activeFeedback = null;
  }
}

// Create singleton instance
let userFeedback: UserFeedback | null = null;

export function getUserFeedback(options?: { enabled?: boolean; environment?: string }): UserFeedback {
  if (!userFeedback) {
    userFeedback = new UserFeedback(options);
  }
  return userFeedback;
}

export function destroyUserFeedback(): void {
  if (userFeedback) {
    userFeedback.destroy();
    userFeedback = null;
  }
}

export default UserFeedback;