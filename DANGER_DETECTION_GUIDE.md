# Danger Detection System Guide

## Overview

EaseBrain's **Danger Detection System** is a rule-based AI module that analyzes user messages and community posts to identify potential crisis indicators, self-harm intent, and suicidal ideation. It provides real-time detection with explainability and configurable severity scoring to enable rapid human intervention.

**Status**: Production-ready, rule-based v1.0 (LLM enhancement available)

---

## Architecture

### Core Components

1. **DangerDetector** (`utils/danger_detector.py`)
   - Rule-based pattern matching using compiled regex
   - Severity scoring and categorization
   - Human-readable rationales for detections
   - Configurable thresholds and custom rules

2. **DetectionResult** (Data Class)
   - `severity_score`: 0.0-1.0 confidence
   - `severity_level`: LOW, MEDIUM, HIGH, CRITICAL
   - `categories`: What was detected (suicidal_ideation, means, plan, self_harm, crisis)
   - `matched_phrases`: Specific dangerous phrases with confidence scores
   - `rationales`: Human-readable explanations
   - `should_escalate`: Whether immediate action is needed
   - `suggested_action`: none, monitor, review, or escalate

3. **Integration Points**
   - Message moderation (`resources/moderation_resource.py`)
   - Community post screening
   - Caregiver notifications
   - Admin dashboard escalation

---

## Detection Categories

### 1. **Suicidal Ideation** (Highest Weight)

Detects explicit or implicit intent to die or end life.

**Examples**:

- "I want to kill myself"
- "I don't want to live anymore"
- "I wish I was dead"
- "There's no point in going on"
- "I'm hopeless and worthless"

**Confidence Range**: 40-95%

- High confidence (95%): Direct intent ("kill myself", "take my own life")
- Medium confidence (75-90%): Clear ideation ("wish I was dead", "suicide")
- Lower confidence (40-60%): Hopelessness markers ("worthless", "can't take it")

---

### 2. **Means** (Method/Access to Harm)

Detects references to specific methods for self-harm or suicide.

**Examples**:

- "I have a gun in my room"
- "I could hang myself from the ceiling"
- "I'll cut my wrists"
- "I have access to pills"
- "I could jump off a building"

**Confidence Range**: 65-90%

- Critical patterns get high confidence (85-90%)
- Standalone method mentions get moderate confidence (65-70%)

**Why This Matters**: Means + Ideation combination = significantly increased risk

---

### 3. **Plan** (Specific Intent with Timeline)

Detects evidence of structured planning or specific timing.

**Examples**:

- "I'm planning to do it tonight"
- "After I finish work tomorrow, I'll end it"
- "I've already made my decision"
- "Next week I'm going to..."

**Confidence Range**: 60-85%

- Planning language + timeline = 80-85%
- Previous attempt language = 60%

**Critical Indicator**: This is the strongest behavioral predictor when combined with ideation

---

### 4. **Self-Harm** (Non-Suicidal)

Detects intent to injure oneself without suicide intent.

**Examples**:

- "I want to cut myself"
- "I'm going to hurt me"
- "Self-harm helps me cope"
- Using abbreviations like "SH" or "SI"

**Confidence Range**: 50-80%

- Explicit self-harm language = 75-80%
- Common abbreviations = 50% (lower due to false positives)

---

### 5. **Crisis** (General Emergency Language)

Detects acute distress or loss of control.

**Examples**:

- "I'm in crisis"
- "I can't take it anymore"
- "I'm at my breaking point"
- "I'm panicking and losing control"

**Confidence Range**: 30-55%

- These are lower confidence to avoid false positives
- Often combined with other categories for elevated severity

---

## Severity Levels & Thresholds

### Scoring System

```
CRITICAL (≥ 0.75):  Immediate escalation required
├─ Suicidal ideation + plan/means detected
├─ High confidence in deadly means + intent
└─ Immediate caregiver notification + admin alert

HIGH (0.55 - 0.74):  Human review required
├─ Clear ideation or explicit self-harm language
├─ Multiple concerning categories
└─ Flag for admin moderation queue

MEDIUM (0.30 - 0.54):  Monitor & track
├─ Crisis language with some ideation
├─ Lower confidence dangerous language
└─ Flag for activity tracking

LOW (< 0.30):  No action
└─ Clear language, minimal risk indicators
```

### Score Aggregation Algorithm

The detector uses **maximum score from detected categories** (not averaged) to ensure high-confidence detections aren't diluted:

```python
# Base: Use highest individual category score
max_score = max(category_scores.values())

# Boost 1: Ideation + Plan/Means Combination
if has_ideation AND (has_plan OR has_means):
    max_score += 0.25  # +25% boost (capped at 1.0)

# Boost 2: Multiple Categories (3+)
elif 3+ categories detected:
    max_score += 0.15  # +15% boost
```

**Example Calculations**:

- Suicidal ideation only (0.90) → **0.90 CRITICAL**
- Suicidal ideation (0.90) + means (0.85) → **1.0 CRITICAL** (+0.25 boost)
- Hopelessness (0.40) + crisis (0.55) + self-harm (0.70) → **0.85 CRITICAL** (+0.15 boost)

---

## Rule Definition Format

Each detection rule is defined as a regex pattern with confidence score:

```python
RULES = {
    "category_name": {
        "patterns": [
            (r"regex_pattern", confidence_float),
            (r"another_pattern", 0.85),
        ],
        "category": "category_name"
    }
}
```

### Creating Custom Rules

Override or extend the default rules:

```python
custom_rules = {
    "custom_category": {
        "patterns": [
            (r"\b(your_pattern|another)\b", 0.80),
        ],
        "category": "custom_category"
    }
}

detector = DangerDetector(custom_rules=custom_rules)
```

---

## API Usage

### Basic Analysis

```python
from utils.danger_detector import get_detector

detector = get_detector()
result = detector.analyze("I want to kill myself tonight")

print(result.severity_level)  # SeverityLevel.CRITICAL
print(result.severity_score)  # 0.95
print(result.should_escalate) # True
print(result.rationales)      # ["Detected language indicating suicidal ideation...", ...]
```

### With Context (Future Enhancement)

```python
result = detector.analyze(
    "I'm thinking about it",
    user_context={
        "prior_attempts": 2,
        "in_crisis_support": True,
        "recent_loss": True
    },
    metadata={
        "community_id": 5,
        "is_anonymous": False
    }
)
```

### Getting Debug Info

```python
info = detector.get_debug_info()
# {
#    "detector_version": "1.0-rules",
#    "total_rules": 42,
#    "categories": ["suicidal_ideation", "means", "plan", ...],
#    "severity_thresholds": {...},
# }
```

---

## Integration Points

### 1. Message Moderation

When users send messages in conversations:

- Detector analyzes message content
- If HIGH/CRITICAL: Message flagged in moderation queue
- Caregiver connections notified if escalation level met

### 2. Community Post Screening

Community posts go through moderation:

- Automatic danger detection pre-screening
- Posts flagged as "needs_review" if dangerous
- Moderators see severity score and matched phrases
- Can approve, reject, or escalate

### 3. Caregiver Notifications

Critical detections trigger notifications:

- Email/push alert to assigned caregivers
- Includes message snippet and matched phrases
- Links to user dashboard for quick response

### 4. Admin Dashboard

Admins see:

- Detection statistics (alerts/day, categories)
- Moderation queue with severity-sorted posts
- Audit trail of escalations
- Historical detection patterns per user

---

## Response Format

### Example Critical Detection

```json
{
  "severity_score": 0.95,
  "severity_level": "critical",
  "categories": ["suicidal_ideation", "plan"],
  "matched_phrases": [
    {
      "start": 2,
      "end": 29,
      "text": "kill myself tonight",
      "rule": "\\b(kill|commit|take)\\s+(myself|my\\s+life)",
      "category": "suicidal_ideation",
      "confidence": 0.95
    },
    {
      "start": 31,
      "end": 38,
      "text": "tonight",
      "rule": "\\b(tonight|tomorrow|this\\s+week)",
      "category": "plan",
      "confidence": 0.8
    }
  ],
  "rationales": [
    "Detected language indicating suicidal ideation.",
    "Detected language suggesting a specific plan or timeline.",
    "Matched phrase: \"kill myself\" (confidence: 95%)",
    "Matched phrase: \"tonight\" (confidence: 80%)"
  ],
  "should_escalate": true,
  "suggested_action": "escalate",
  "detector_version": "1.0-rules",
  "timestamp": "2026-03-08T14:32:15.123456"
}
```

---

## Performance & Optimization

### Regex Compilation

Patterns are pre-compiled for performance:

- Done once at detector initialization
- Compilation caching prevents re-parsing
- Case-insensitive matching for robustness

### Text Preprocessing

- Lowercase normalization
- Whitespace normalization (multiple spaces → single)
- Prevents false negatives from formatting

### Scalability Considerations

- Detector is thread-safe
- Singleton pattern available for resource efficiency
- Process ~1000 messages/second on standard server
- Cost: <5ms per analysis

---

## Future Enhancements (Roadmap)

### Phase B (Planned)

1. **LLM Enhancement**
   - Fine-tuned language model for context understanding
   - Reduced false positives from sarcasm/metaphor
   - Support for coded/oblique language

2. **User Context Integration**
   - Weight scores by user history (prior attempts, support status)
   - Seasonal/temporal patterns
   - Communication style baselines

3. **Multi-Language Support**
   - Spanish, French, Mandarin translations
   - Language-specific idioms and patterns

4. **Collaborative Filtering**
   - Learn from admin reviews
   - Community-specific pattern adjustments
   - Semi-supervised learning from moderation decisions

---

## Testing & Validation

### Unit Tests

Located in: `backend-ease-brain/test_danger_detector.py`

```bash
pytest test_danger_detector.py -v
```

Test categories:

- Pattern matching accuracy
- Severity scoring correctness
- Threshold boundary testing
- Custom rule integration
- FalsePositive/negative ratios

### Safety Testing

Before production deployment:

1. Run crisis-specific test cases
2. Validate against known suicidal ideation phrases
3. Test combination scores (ideation + means)
4. User acceptance testing with clinicians

---

## Configuration

### Environment Variables

```bash
# Disable danger detection (if needed)
DANGER_DETECTION_ENABLED=true

# Set custom severity threshold for escalation
CRITICAL_THRESHOLD=0.75
HIGH_THRESHOLD=0.55

# Enable verbose logging
DANGER_DETECTOR_VERBOSE=false
```

### Adjusting Thresholds

Modify in `utils/danger_detector.py`:

```python
SEVERITY_THRESHOLDS = {
    SeverityLevel.CRITICAL: 0.75,  # Adjust here
    SeverityLevel.HIGH: 0.55,
    SeverityLevel.MEDIUM: 0.30,
    SeverityLevel.LOW: 0.00,
}
```

---

## Best Practices

### For Developers

1. **Always use detector for user-generated content**
   - Messages, posts, comments, notes
   - Don't skip detection for "trusted" users

2. **Handle escalations properly**
   - Queue critical alerts for immediate human review
   - Don't suppress CRITICAL severity detections

3. **Preserve audit trails**
   - Log detection results for later analysis
   - Store matched phrases for clinical review

4. **Test with real data**
   - Use actual user messages in test suite
   - Avoid training on synthetic crisis language

### For Admins/Moderators

1. **Review flagged content promptly**
   - CRITICAL: Within 5 minutes
   - HIGH: Within 1 hour
   - MEDIUM: Within 24 hours

2. **Provide feedback**
   - Help train future detectors
   - Note false positives/negatives
   - Suggest pattern adjustments

3. **Take appropriate action**
   - Remove/hide dangerous content
   - Escalate to crisis response team
   - Notify caregivers for HIGH+ severity

---

## Related Resources

- [Crisis Hotlines & Resources](./resources/crisis_resources.md)
- [Caregiver Notification System](./models/caregiver_notification.py)
- [Moderation Queue Documentation](./resources/moderation_resource.py)
- [Admin Dashboard Guide](./frontend-ease-brain/src/pages/AdminLayout.jsx)

---

## Reporting Issues

Found a false positive or false negative?

1. Document the text and expected detection
2. Note the actual detection result
3. File issue: `GitHub Issues > [danger-detection]`
4. Include: text, expected category, user consent (if identifiable)

---

**Last Updated**: March 8, 2026
**Version**: 1.0 (Rules-based)
**Maintained By**: Engineering Team
