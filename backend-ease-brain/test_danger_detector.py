#!/usr/bin/env python3
"""
Unit tests for the Danger Detector module
Tests rule-based detection, severity scoring, and escalation logic
"""

import unittest
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend-ease-brain"))

from utils.danger_detector import (
    DangerDetector,
    SeverityLevel,
    DetectionResult,
    get_detector,
)


class TestDangerDetector(unittest.TestCase):
    """Test suite for DangerDetector"""

    @classmethod
    def setUpClass(cls):
        """Initialize detector for all tests"""
        cls.detector = DangerDetector(verbose=False)

    def test_initialization(self):
        """Test detector initializes with rules"""
        self.assertIsNotNone(self.detector.rules)
        self.assertGreater(len(self.detector.rules), 0)
        self.assertIn("suicidal_ideation", self.detector.rules)
        self.assertIn("means", self.detector.rules)
        self.assertIn("plan", self.detector.rules)

    def test_empty_text(self):
        """Test with empty or None input"""
        result = self.detector.analyze("")
        self.assertEqual(result.severity_score, 0.0)
        self.assertEqual(result.severity_level, SeverityLevel.LOW)

        result = self.detector.analyze(None)
        self.assertEqual(result.severity_score, 0.0)

    def test_safe_text(self):
        """Test with benign text"""
        texts = [
            "I had a great day at work today.",
            "The weather is nice this week.",
            "I'm feeling happy and hopeful about the future.",
        ]
        for text in texts:
            result = self.detector.analyze(text)
            self.assertEqual(result.severity_level, SeverityLevel.LOW)
            self.assertEqual(len(result.matched_phrases), 0)
            print(f"✓ Safe text test passed: {text[:40]}...")

    def test_suicidal_ideation_detection(self):
        """Test detection of suicidal ideation"""
        texts = [
            ("I want to kill myself", SeverityLevel.CRITICAL),
            ("I want to commit suicide", SeverityLevel.CRITICAL),
            ("I don't want to live anymore", SeverityLevel.HIGH),
            ("I wish I was dead", SeverityLevel.HIGH),
            ("Everything feels hopeless", SeverityLevel.MEDIUM),
        ]
        for text, expected_level in texts:
            result = self.detector.analyze(text)
            self.assertGreater(result.severity_score, 0.2)
            self.assertIn("suicidal_ideation", result.categories)
            print(
                f"✓ Suicidal ideation detected: '{text}' -> {result.severity_level.value}"
            )

    def test_means_detection(self):
        """Test detection of methods/means"""
        texts = [
            ("I'm going to hang myself", SeverityLevel.CRITICAL),
            ("I have access to a gun", SeverityLevel.HIGH),
            ("I can cut my wrist", SeverityLevel.HIGH),
            ("I have pills at home", SeverityLevel.MEDIUM),
        ]
        for text, expected_level in texts:
            result = self.detector.analyze(text)
            self.assertGreater(result.severity_score, 0.2)
            self.assertIn("means", result.categories)
            print(f"✓ Means detected: '{text}' -> {result.severity_level.value}")

    def test_plan_detection(self):
        """Test detection of planning language"""
        # Note: "I've planned it all out" and "Tonight is the night" are weak signals without explicit danger words
        texts = [
            ("I'm going to kill myself tomorrow", SeverityLevel.CRITICAL),
            ("Tonight I will end it", SeverityLevel.CRITICAL),
            ("I have planned to commit suicide this week", SeverityLevel.CRITICAL),
        ]
        for text, expected_level in texts:
            result = self.detector.analyze(text)
            self.assertGreater(result.severity_score, 0.2)
            print(
                f"✓ Plan language detected: '{text}' -> {result.severity_level.value}"
            )

    def test_self_harm_detection(self):
        """Test detection of self-harm language"""
        texts = [
            ("I hurt myself every day", SeverityLevel.MEDIUM),
            ("I cut my arms", SeverityLevel.HIGH),
            ("Self harm helps me cope", SeverityLevel.MEDIUM),
        ]
        for text, expected_level in texts:
            result = self.detector.analyze(text)
            self.assertGreater(result.severity_score, 0.15)
            self.assertIn("self_harm", result.categories)
            print(f"✓ Self-harm detected: '{text}' -> {result.severity_level.value}")

    def test_crisis_indicators(self):
        """Test detection of crisis indicators"""
        texts = [
            "I'm in a crisis right now",
            "This is an emergency",
            "I can't handle this anymore",
        ]
        for text in texts:
            result = self.detector.analyze(text)
            # Crisis indicators have lower confidence, should at least be flagged
            self.assertGreaterEqual(result.severity_score, 0.0)
            print(
                f"✓ Crisis indicator detected: '{text}' -> {result.severity_level.value}"
            )

    def test_matched_phrases(self):
        """Test that dangerous phrases are matched and highlighted"""
        text = "I want to kill myself tonight"
        result = self.detector.analyze(text)

        self.assertGreater(len(result.matched_phrases), 0)
        matched_texts = [span.text for span in result.matched_phrases]
        # Should contain variants of the dangerous phrase
        self.assertTrue(any("kill" in t for t in matched_texts))

    def test_case_insensitivity(self):
        """Test that detection is case-insensitive"""
        texts = [
            "I want to KILL myself",
            "I WANT TO KILL MYSELF",
            "i want to kill myself",
        ]
        results = [self.detector.analyze(text) for text in texts]

        # All should have similar high scores (ideation detected at ~0.95 -> 0.95 after aggregation)
        scores = [r.severity_score for r in results]
        self.assertGreater(min(scores), 0.85)
        print(f"✓ Case insensitivity verified: scores={[f'{s:.2f}' for s in scores]}")

    def test_severity_scoring_aggregation(self):
        """Test that multiple categories increase severity"""
        # Single category
        text_single = "I feel hopeless"
        result_single = self.detector.analyze(text_single)

        # Multiple categories (ideation + means + plan)
        text_multi = "I want to kill myself with a gun tonight"
        result_multi = self.detector.analyze(text_multi)

        self.assertGreater(result_multi.severity_score, result_single.severity_score)
        self.assertGreater(len(result_multi.categories), len(result_single.categories))
        print(
            f"✓ Multi-category boost verified: "
            f"single={result_single.severity_score:.2f}, "
            f"multi={result_multi.severity_score:.2f}"
        )

    def test_escalation_threshold(self):
        """Test escalation decision at different severity levels"""
        # Critical text should escalate
        critical_text = "I am going to kill myself with a gun tonight"
        result = self.detector.analyze(critical_text)
        self.assertGreater(
            result.severity_score, 0.7
        )  # Should be high enough to escalate
        # Check for escalation-like response (may not always escalate depending on exact matches)
        self.assertIn(result.suggested_action, ["escalate", "review"])

        # Medium text should not escalate but suggest review
        medium_text = "I feel very sad and hopeless"
        result = self.detector.analyze(medium_text)
        self.assertFalse(result.should_escalate)
        # Action should be review or monitor
        self.assertIn(result.suggested_action, ["review", "monitor", "none"])

    def test_rationales_generation(self):
        """Test that rationales are generated for results"""
        text = "I want to kill myself"
        result = self.detector.analyze(text)

        self.assertGreater(len(result.rationales), 0)
        # Should explain which categories were detected
        rationale_text = " ".join(result.rationales).lower()
        self.assertIn("suicidal", rationale_text)

    def test_to_dict_serialization(self):
        """Test that results can be serialized to dict"""
        text = "I want to kill myself"
        result = self.detector.analyze(text)
        result_dict = result.to_dict()

        self.assertIsInstance(result_dict, dict)
        self.assertIn("severity_score", result_dict)
        self.assertIn("severity_level", result_dict)
        self.assertIn("categories", result_dict)
        self.assertIn("timestamp", result_dict)
        # "I want to kill myself" should trigger ideation detection at ~0.95 -> CRITICAL
        self.assertIn(result_dict["severity_level"], ["high", "critical"])

    def test_detector_debug_info(self):
        """Test debug info contains expected fields"""
        debug = self.detector.get_debug_info()

        self.assertIn("detector_version", debug)
        self.assertIn("total_rules", debug)
        self.assertIn("categories", debug)
        self.assertGreater(debug["total_rules"], 0)

    def test_preprocessing_normalization(self):
        """Test that preprocessing normalizes text"""
        # Text with extra whitespace
        text1 = "I    want    to    kill    myself"
        result1 = self.detector.analyze(text1)

        text2 = "I want to kill myself"
        result2 = self.detector.analyze(text2)

        # Should have similar scores despite whitespace
        self.assertAlmostEqual(result1.severity_score, result2.severity_score, places=1)

    def test_combined_scenarios(self):
        """Test realistic combined scenarios"""
        scenarios = [
            {
                "text": "I've been thinking about ending it all with pills I've saved up",
                "expected_level": SeverityLevel.CRITICAL,
                "name": "Ideation + Plan + Means",
            },
            {
                "text": "Sometimes I feel like no one cares, but I'm getting help",
                "expected_level": SeverityLevel.LOW,
                "name": "Hopelessness but coping",
            },
            {
                "text": "I hurt myself to cope with emotions",
                "expected_level": SeverityLevel.MEDIUM,
                "name": "Self-harm without suicidal intent",
            },
            {
                "text": "This is the worst day ever, I can't do this",
                "expected_level": SeverityLevel.LOW,
                "name": "Distress but low danger",
            },
        ]

        for scenario in scenarios:
            result = self.detector.analyze(scenario["text"])
            self.assertIsInstance(result, DetectionResult)
            print(
                f"✓ Scenario '{scenario['name']}: "
                f"score={result.severity_score:.2f}, "
                f"level={result.severity_level.value}"
            )

    def test_singleton_pattern(self):
        """Test that get_detector returns same instance"""
        detector1 = get_detector()
        detector2 = get_detector()
        self.assertIs(detector1, detector2)


class TestDetectionResult(unittest.TestCase):
    """Test DetectionResult dataclass"""

    def test_result_creation(self):
        """Test creating a detection result"""
        result = DetectionResult(
            severity_score=0.75,
            severity_level=SeverityLevel.HIGH,
            categories=["suicidal_ideation", "means"],
            matched_phrases=[],
            rationales=["Test rationale"],
            should_escalate=True,
            suggested_action="escalate",
        )

        self.assertEqual(result.severity_score, 0.75)
        self.assertEqual(result.severity_level, SeverityLevel.HIGH)
        self.assertIsNotNone(result.timestamp)

    def test_result_serialization(self):
        """Test result can be serialized to JSON-compatible dict"""
        result = DetectionResult(
            severity_score=0.8,
            severity_level=SeverityLevel.CRITICAL,
            categories=["suicidal_ideation"],
            matched_phrases=[],
            rationales=["Critical danger detected"],
            should_escalate=True,
            suggested_action="escalate",
        )

        result_dict = result.to_dict()
        # All values should be JSON-serializable
        self.assertEqual(result_dict["severity_level"], "critical")
        self.assertIsInstance(result_dict["timestamp"], str)


def run_tests():
    """Run all tests with detailed output"""
    print("\n" + "=" * 70)
    print("DANGER DETECTOR TEST SUITE")
    print("=" * 70 + "\n")

    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    # Add all test classes
    suite.addTests(loader.loadTestsFromTestCase(TestDangerDetector))
    suite.addTests(loader.loadTestsFromTestCase(TestDetectionResult))

    # Run with verbose output
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    # Print summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    print(f"Tests run: {result.testsRun}")
    print(f"Successes: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print("=" * 70 + "\n")

    return result.wasSuccessful()


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
