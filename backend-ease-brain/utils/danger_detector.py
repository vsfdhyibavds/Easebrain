"""
Danger Detector Module for AI Needs Planning
Implements rule-based and ML-capable detection of self-harm, suicidal ideation, and crisis indicators.
Provides explainability and configurable severity scoring.
"""

import re
from enum import Enum
from dataclasses import dataclass, asdict
from typing import Optional, List, Dict
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class SeverityLevel(Enum):
    """Severity levels for detected danger indicators"""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class MatchedSpan:
    """Represents a matched dangerous phrase or pattern"""

    start: int
    end: int
    text: str
    rule: str
    category: str
    confidence: float


@dataclass
class DetectionResult:
    """Result of danger detection analysis"""

    severity_score: float  # 0.0 to 1.0
    severity_level: SeverityLevel
    categories: List[str]  # e.g., ["suicidal_ideation", "means", "plan"]
    matched_phrases: List[MatchedSpan]
    rationales: List[str]
    should_escalate: bool
    suggested_action: str  # "none", "review", "escalate", "remove"
    detector_version: str = "1.0-rules"
    timestamp: datetime = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow()

    def to_dict(self):
        """Convert to JSON-serializable dict"""
        result = asdict(self)
        result["severity_level"] = self.severity_level.value
        result["timestamp"] = self.timestamp.isoformat()
        result["matched_phrases"] = [asdict(m) for m in self.matched_phrases]
        return result


class DangerDetector:
    """
    Rule-based danger detector for mental health and suicide prevention.
    Detects: suicidal ideation, self-harm, intent, means, and crisis language.
    """

    # Detection rules organized by category
    RULES = {
        "suicidal_ideation": {
            "patterns": [
                # Explicit intent
                (r"\b(kill|commit|take)\s+(myself|my\s+life|my\s+own\s+life)\b", 0.95),
                (r"\bwant\s+(to\s+)?(die|be\s+dead)\b", 0.90),
                (r"\bi\s+(don't|do\s+not|dont)\s+(want\s+to\s+)?live\b", 0.85),
                (r"\bsuicide|suicidal\b", 0.80),
                (r"\b(end|finish|end\s+it)\s+(all|everything|myself)\b", 0.85),
                (r"\b(no\s+)?point\s+(in\s+)?(living|going\s+on)\b", 0.75),
                (r"\bwish\s+i\s+was\s+dead\b", 0.80),
                (r"\bwish\s+i\s+could\s+\w+\s+(myself|me)\b", 0.75),
                # Hopelessness/despair markers
                (r"\b(hopeless|useless|worthless|waste)\b", 0.40),
                (
                    r"\b(can't|cannot|cant)\s+(handle|take|do)\s+(this|it|anymore)\b",
                    0.50,
                ),
                (r"\bno\s+(one|body)\s+(cares|loves|needs)\s+(me|you)\b", 0.60),
            ],
            "category": "suicidal_ideation",
        },
        "means": {
            "patterns": [
                # Methods/means
                (
                    r"\b(gun|knife|blade|rope|noose|pills?|overdose|hang|cut|slit|jump)\b",
                    0.65,
                ),
                (r"\b(prescription|medication|medicine|drug)\s+\w*overdos", 0.70),
                (r"\bhang\s+(myself|me|from)\b", 0.90),
                (r"\b(cut|slit)\s+(myself|my\s+(wrist|arm|throat))", 0.85),
                (r"\bdrink\s+(poison|bleach|acid)\b", 0.90),
                (r"\bjump\s+(off|from|in\s+front\s+of)\b", 0.80),
            ],
            "category": "means",
        },
        "plan": {
            "patterns": [
                # Planning language - more flexible matching
                (r"\b(when|if|after)\s+\w+.*?(kill|die|commit|jump|cut|hang)\b", 0.80),
                (
                    r"\b(plan|planned|planning)\s+.*?(to|on).*?(kill|die|commit|end|hurt)\b",
                    0.85,
                ),
                (
                    r"\b(tonight|tomorrow|this\s+week|next\s+week|soon).*?(kill|die|end|do\s+it)\b",
                    0.80,
                ),
                (r"\bi\s+(have|made)\s+a\s+(plan|decision)\b", 0.60),
                (r"\b(already|have)\s+(tried|attempted|planned)\b", 0.60),
            ],
            "category": "plan",
        },
        "self_harm": {
            "patterns": [
                # Self-harm and injury language (distinct from suicidal ideation)
                (r"\b(hurt|harm|injure)\s+(myself|me)\b", 0.70),
                (r"\b(cut|scratch|pick|burn)\s+(myself|my|me)\b", 0.75),
                (r"\b(self.{0,3}harm|self.{0,3}injury|self.{0,3}cutting?)\b", 0.80),
                (r"\bSH\b|\bSI\b", 0.50),  # Abbreviations
            ],
            "category": "self_harm",
        },
        "crisis": {
            "patterns": [
                # Crisis indicators (lower confidence, require context)
                (r"\b(crisis|emergency|danger|urgent)\b", 0.30),
                (r"\b(can't\s+take\s+it|at\s+my\s+limit|breaking\s+point)\b", 0.55),
                (r"\b(overwhelmed|panicking|losing\s+control)\b", 0.40),
            ],
            "category": "crisis",
        },
    }

    # Threshold configuration
    SEVERITY_THRESHOLDS = {
        SeverityLevel.CRITICAL: 0.75,  # Immediate escalation
        SeverityLevel.HIGH: 0.55,  # Review required
        SeverityLevel.MEDIUM: 0.30,  # Flag for monitoring
        SeverityLevel.LOW: 0.00,  # No action
    }

    ESCALATION_THRESHOLDS = {
        "critical": 0.75,  # Must escalate
        "review": 0.55,  # Human review
        "monitor": 0.30,  # Flag but no action
    }

    def __init__(self, custom_rules: Optional[Dict] = None, verbose: bool = False):
        """
        Initialize detector with optional custom rules.

        Args:
            custom_rules: Override/extend detection rules
            verbose: Enable detailed logging
        """
        self.rules = self.RULES.copy()
        if custom_rules:
            self.rules.update(custom_rules)
        self.verbose = verbose
        self._compile_patterns()

    def _compile_patterns(self):
        """Compile regex patterns for performance"""
        self.compiled_rules = {}
        for category, rule_data in self.rules.items():
            self.compiled_rules[category] = [
                (re.compile(pattern, re.IGNORECASE), confidence, rule_data["category"])
                for pattern, confidence in rule_data["patterns"]
            ]

    def analyze(
        self,
        text: str,
        user_context: Optional[Dict] = None,
        metadata: Optional[Dict] = None,
    ) -> DetectionResult:
        """
        Analyze text for danger indicators.

        Args:
            text: The text to analyze (message, post, etc.)
            user_context: Optional context about the user (e.g., prior flags, role)
            metadata: Optional metadata (e.g., community_id, is_anonymous)

        Returns:
            DetectionResult with score, categories, matches, and recommended action
        """
        if not text or not isinstance(text, str):
            return DetectionResult(
                severity_score=0.0,
                severity_level=SeverityLevel.LOW,
                categories=[],
                matched_phrases=[],
                rationales=["No text to analyze"],
                should_escalate=False,
                suggested_action="none",
            )

        # Normalize text
        normalized_text = self._preprocess(text)

        # Apply rule-based detection
        matched_spans = []
        category_scores = {}

        for category, compiled_rules in self.compiled_rules.items():
            for pattern, confidence, cat in compiled_rules:
                for match in pattern.finditer(normalized_text):
                    span = MatchedSpan(
                        start=match.start(),
                        end=match.end(),
                        text=match.group(),
                        rule=pattern.pattern[:50],  # Truncate for readability
                        category=cat,
                        confidence=confidence,
                    )
                    matched_spans.append(span)

                    # Track max confidence per category
                    if cat not in category_scores:
                        category_scores[cat] = 0.0
                    category_scores[cat] = max(category_scores[cat], confidence)

        # Calculate aggregate score
        severity_score = self._aggregate_score(category_scores, matched_spans)
        severity_level = self._get_severity_level(severity_score)

        # Determine escalation
        should_escalate = severity_score >= self.ESCALATION_THRESHOLDS["critical"]
        suggested_action = self._get_suggested_action(severity_score)

        # Build rationales
        rationales = self._build_rationales(category_scores, matched_spans)

        if self.verbose:
            logger.info(
                f"Detection result: score={severity_score:.2f}, "
                f"level={severity_level.value}, categories={list(category_scores.keys())}"
            )

        return DetectionResult(
            severity_score=severity_score,
            severity_level=severity_level,
            categories=list(category_scores.keys()),
            matched_phrases=matched_spans,
            rationales=rationales,
            should_escalate=should_escalate,
            suggested_action=suggested_action,
            detector_version="1.0-rules",
        )

    def _preprocess(self, text: str) -> str:
        """Normalize text for analysis"""
        # Lowercase for matching (case-insensitive)
        text = text.lower()
        # Normalize whitespace
        text = re.sub(r"\s+", " ", text)
        return text

    def _aggregate_score(
        self,
        category_scores: Dict[str, float],
        matched_spans: List[MatchedSpan],
    ) -> float:
        """
        Aggregate individual category scores into overall severity.
        Weighting: suicidal_ideation + plan heavily weighted, means moderate, crisis/self-harm lower.
        """
        if not category_scores:
            return 0.0

        # Use max score from detected categories (not weighted average)
        # This ensures high-confidence detections aren't diluted
        max_score = max(category_scores.values())

        # If multiple dangerous categories detected, boost score
        if len(category_scores) > 1:
            # Combination boost: ideation + plan/means = more critical
            has_ideation = "suicidal_ideation" in category_scores
            has_plan_means = "plan" in category_scores or "means" in category_scores

            if has_ideation and has_plan_means:
                # Ideation + plan/means = critical boost
                max_score = min(1.0, max_score + 0.25)
            elif len(category_scores) > 2:
                # 3+ categories = elevated
                max_score = min(1.0, max_score + 0.15)

        return max_score

    def _get_severity_level(self, score: float) -> SeverityLevel:
        """Map score to severity level"""
        if score >= self.SEVERITY_THRESHOLDS[SeverityLevel.CRITICAL]:
            return SeverityLevel.CRITICAL
        elif score >= self.SEVERITY_THRESHOLDS[SeverityLevel.HIGH]:
            return SeverityLevel.HIGH
        elif score >= self.SEVERITY_THRESHOLDS[SeverityLevel.MEDIUM]:
            return SeverityLevel.MEDIUM
        else:
            return SeverityLevel.LOW

    def _get_suggested_action(self, score: float) -> str:
        """Recommend action based on severity score"""
        if score >= self.ESCALATION_THRESHOLDS["critical"]:
            return "escalate"
        elif score >= self.ESCALATION_THRESHOLDS["review"]:
            return "review"
        elif score >= self.ESCALATION_THRESHOLDS["monitor"]:
            return "monitor"
        else:
            return "none"

    def _build_rationales(
        self,
        category_scores: Dict[str, float],
        matched_spans: List[MatchedSpan],
    ) -> List[str]:
        """Build human-readable explanations for the detection"""
        rationales = []

        # Category-based rationales
        category_messages = {
            "suicidal_ideation": "Detected language indicating suicidal ideation.",
            "plan": "Detected language suggesting a specific plan or timeline.",
            "means": "Detected references to methods or means.",
            "self_harm": "Detected language indicating self-harm intent.",
            "crisis": "Detected crisis or emergency language.",
        }

        for category in sorted(category_scores.keys()):
            if category in category_messages:
                rationales.append(category_messages[category])

        # Add specific phrase context if critical
        if matched_spans:
            top_phrases = sorted(
                matched_spans, key=lambda s: s.confidence, reverse=True
            )[:3]
            for span in top_phrases:
                rationales.append(
                    f'Matched phrase: "{span.text}" (confidence: {span.confidence:.0%})'
                )

        if not rationales:
            rationales.append("No specific danger indicators detected.")

        return rationales

    def get_debug_info(self) -> Dict:
        """Return detector configuration and rule count for debugging"""
        return {
            "detector_version": "1.0-rules",
            "total_rules": sum(len(v["patterns"]) for v in self.rules.values()),
            "categories": list(self.rules.keys()),
            "severity_thresholds": {
                k.value: v for k, v in self.SEVERITY_THRESHOLDS.items()
            },
            "escalation_thresholds": self.ESCALATION_THRESHOLDS,
        }


# Singleton instance for convenience
_detector_instance = None


def get_detector(
    custom_rules: Optional[Dict] = None, verbose: bool = False
) -> DangerDetector:
    """Factory function to get or create detector instance"""
    global _detector_instance
    if _detector_instance is None:
        _detector_instance = DangerDetector(custom_rules=custom_rules, verbose=verbose)
    return _detector_instance
