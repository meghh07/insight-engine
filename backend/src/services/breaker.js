export class CircuitBreaker {
  constructor(failureThreshold, cooldownMs) {
    this.failureThreshold = failureThreshold;
    this.cooldownMs = cooldownMs;
    this.failures = 0;
    this.openedAt = 0;
  }

  canExecute() {
    if (this.failures < this.failureThreshold) return true;
    return Date.now() - this.openedAt > this.cooldownMs;
  }

  recordSuccess() {
    this.failures = 0;
    this.openedAt = 0;
  }

  recordFailure() {
    this.failures += 1;
    if (this.failures >= this.failureThreshold && this.openedAt === 0) {
      this.openedAt = Date.now();
    }
  }
}
