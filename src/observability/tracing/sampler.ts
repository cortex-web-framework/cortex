import type { SamplingContext, SamplingResult } from '../types.js';
import { SamplingDecision } from '../types.js';

/**
 * Sampler interface for deciding whether to sample a trace
 */
export interface Sampler {
  shouldSample(_context: SamplingContext): SamplingResult;
}

/**
 * Probability-based sampler
 */
export class ProbabilitySampler implements Sampler {
  constructor(private probability: number) {
    if (probability < 0 || probability > 1) {
      throw new Error('Probability must be between 0 and 1');
    }
  }

  shouldSample(_context: SamplingContext): SamplingResult {
    const random = Math.random();
    const decision = random < this.probability ? SamplingDecision.RECORD_AND_SAMPLE : SamplingDecision.DROP;
    
    return {
      decision,
      attributes: {},
    };
  }
}

/**
 * Always sample sampler
 */
export class AlwaysOnSampler implements Sampler {
  shouldSample(_context: SamplingContext): SamplingResult {
    return {
      decision: SamplingDecision.RECORD_AND_SAMPLE,
      attributes: {},
    };
  }
}

/**
 * Never sample sampler
 */
export class AlwaysOffSampler implements Sampler {
  shouldSample(_context: SamplingContext): SamplingResult {
    return {
      decision: SamplingDecision.DROP,
      attributes: {},
    };
  }
}

/**
 * Trace ID ratio-based sampler
 */
export class TraceIdRatioBasedSampler implements Sampler {
  constructor(private ratio: number) {
    if (ratio < 0 || ratio > 1) {
      throw new Error('Ratio must be between 0 and 1');
    }
  }

  shouldSample(context: SamplingContext): SamplingResult {
    // Convert trace ID to number and check if it falls within the ratio
    const traceIdNum = parseInt(context.traceId.substring(0, 8), 16);
    const threshold = Math.floor(this.ratio * 0xffffffff);
    const decision = traceIdNum < threshold ? SamplingDecision.RECORD_AND_SAMPLE : SamplingDecision.DROP;

    return {
      decision,
      attributes: {},
    };
  }
}
