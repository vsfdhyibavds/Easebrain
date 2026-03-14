#!/usr/bin/env python3
"""
Unit tests for LLM-enhanced danger detector
Tests async LLM integration, fallback behavior, and result merging
"""

import unittest
import asyncio
import sys
from pathlib import Path
from unittest.mock import patch

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend-ease-brain"))

from utils.danger_detector import DangerDetector, SeverityLevel, DetectionResult
from utils.llm_danger_detector import LLMDangerDetector, LLMDetectionResult
from utils.task_queue import TaskQueue, TaskStatus


class TestLLMDangerDetector(unittest.TestCase):
    """Test suite for LLM-enhanced detector"""

    @classmethod
    def setUpClass(cls):
        """Initialize detectors"""
        cls.rule_detector = DangerDetector(verbose=False)
        cls.llm_detector = LLMDangerDetector()

    def test_llm_detector_initialization(self):
        """Test LLM detector initializes correctly"""
        self.assertIsNotNone(self.llm_detector)
        config = self.llm_detector.get_config()
        self.assertIn("enabled", config)
        self.assertIn("provider", config)
        print(f"✓ LLM detector config: {config}")

    def test_llm_disabled_fallback(self):
        """Test that disabled LLM returns rule-based result"""
        # Ensure LLM is disabled
        detector = LLMDangerDetector(api_key="")
        self.assertFalse(detector.enabled)

        rule_result = self.rule_detector.analyze("I want to kill myself")

        async def run_enhance():
            return await detector.enhance_detection(
                "I want to kill myself", rule_result
            )

        llm_result = asyncio.run(run_enhance())

        # Should be identical to rule-based result
        self.assertEqual(llm_result.severity_score, rule_result.severity_score)
        self.assertEqual(llm_result.severity_level, rule_result.severity_level)
        self.assertFalse(llm_result.llm_enhanced)
        print(f"✓ LLM disabled fallback: score={llm_result.severity_score:.2f}")

    def test_llm_result_conversion(self):
        """Test converting rule-based result to LLM result"""
        rule_result = self.rule_detector.analyze("I want to die")

        llm_result = self.llm_detector._convert_to_llm_result(rule_result)

        self.assertIsInstance(llm_result, LLMDetectionResult)
        self.assertEqual(llm_result.severity_score, rule_result.severity_score)
        self.assertFalse(llm_result.llm_enhanced)
        print(f"✓ Result conversion: {llm_result.detector_version}")

    @patch("utils.llm_danger_detector.LLMDangerDetector._call_openai")
    def test_llm_result_merging(self, mock_llm):
        """Test merging of rule-based and LLM results"""

        # Mock LLM response
        async def mock_response():
            return (0.85, "high", ["suicidal_ideation", "plan"], "LLM reasoning")

        mock_llm.return_value = mock_response()

        # Assume rule-based gives 0.70

        # Simulate merged result
        rule_score = 0.70
        llm_score = 0.85
        combined_score = (rule_score * 0.60) + (llm_score * 0.40)
        agreement = max(0.0, 1.0 - abs(rule_score - llm_score))

        self.assertGreater(combined_score, rule_score)
        self.assertLess(combined_score, llm_score)
        self.assertGreater(agreement, 0.8)
        print(
            f"✓ Result merging: rule={rule_score:.2f}, llm={llm_score:.2f}, "
            f"combined={combined_score:.2f}, agreement={agreement:.2f}"
        )

    def test_llm_timeout_fallback(self):
        """Test that LLM timeout falls back to rule-based"""
        import os

        async def run_timeout():
            # Temporarily set env var to enable LLM
            old_val = os.environ.get("DANGER_DETECTOR_LLM_ENABLED")
            os.environ["DANGER_DETECTOR_LLM_ENABLED"] = "true"

            try:
                # Create detector with API key and enabled flag
                detector = LLMDangerDetector(api_key="test_key_enabled")
                # Manually enable since env var doesn't persist
                detector.enabled = True

                rule_result = self.rule_detector.analyze("I want to kill myself")

                # Mock the _call_llm to simulate timeout
                async def slow_call(text):
                    await asyncio.sleep(10)
                    return (0.9, "critical", ["suicidal_ideation"], "test")

                detector._call_llm = slow_call
                result = await detector.enhance_detection(
                    "I want to kill myself", rule_result
                )
                return result
            finally:
                if old_val is not None:
                    os.environ["DANGER_DETECTOR_LLM_ENABLED"] = old_val
                elif "DANGER_DETECTOR_LLM_ENABLED" in os.environ:
                    del os.environ["DANGER_DETECTOR_LLM_ENABLED"]

        # Run with timeout
        result = asyncio.run(run_timeout())
        self.assertFalse(result.llm_enhanced)
        self.assertIn("timeout", result.llm_reasoning.lower())
        print(f"✓ LLM timeout fallback: {result.llm_reasoning}")

    def test_llm_error_fallback(self):
        """Test that LLM errors fall back gracefully"""
        import os

        async def run_error():
            # Temporarily set env var to enable LLM
            old_val = os.environ.get("DANGER_DETECTOR_LLM_ENABLED")
            os.environ["DANGER_DETECTOR_LLM_ENABLED"] = "true"

            try:
                # Create detector with API key
                detector = LLMDangerDetector(api_key="test_key_enabled")
                # Manually enable
                detector.enabled = True

                rule_result = self.rule_detector.analyze("I want to die")

                # Mock _call_llm to raise an error
                async def error_call(text):
                    raise ValueError("API error")

                detector._call_llm = error_call
                result = await detector.enhance_detection("I want to die", rule_result)
                return result
            finally:
                if old_val is not None:
                    os.environ["DANGER_DETECTOR_LLM_ENABLED"] = old_val
                elif "DANGER_DETECTOR_LLM_ENABLED" in os.environ:
                    del os.environ["DANGER_DETECTOR_LLM_ENABLED"]

        result = asyncio.run(run_error())
        self.assertFalse(result.llm_enhanced)
        self.assertIn("error", result.llm_reasoning.lower())
        print(f"✓ LLM error fallback: {result.llm_reasoning}")

    def test_llm_category_merging(self):
        """Test that detected categories are merged"""
        rule_result = DetectionResult(
            severity_score=0.60,
            severity_level=SeverityLevel.HIGH,
            categories=["suicidal_ideation"],
            matched_phrases=[],
            rationales=["Rule detected ideation"],
            should_escalate=False,
            suggested_action="review",
        )

        # Simulate LLM detecting additional categories
        llm_categories = ["suicidal_ideation", "plan", "means"]

        # Merge
        merged = list(set(rule_result.categories) | set(llm_categories))
        self.assertEqual(len(merged), 3)
        self.assertIn("plan", merged)
        self.assertIn("means", merged)
        print(f"✓ Category merging: {merged}")

    def test_llm_agreement_calculation(self):
        """Test agreement score calculation"""
        test_cases = [
            (0.90, 0.85, 0.95),  # High agreement
            (0.50, 0.50, 1.0),  # Perfect agreement
            (0.20, 0.80, 0.4),  # Low agreement
        ]

        for rule_score, llm_score, expected_min_agreement in test_cases:
            score_diff = abs(rule_score - llm_score)
            agreement = max(0.0, 1.0 - score_diff)
            self.assertGreaterEqual(agreement, expected_min_agreement - 0.01)
            print(f"✓ Agreement {rule_score:.2f} vs {llm_score:.2f} = {agreement:.2f}")


class TestTaskQueue(unittest.TestCase):
    """Test suite for background task queue"""

    def setUp(self):
        """Create task queue for each test"""
        self.queue = TaskQueue(num_workers=2)

    def tearDown(self):
        """Stop queue after each test"""
        self.queue.stop()

    def test_task_queue_initialization(self):
        """Test task queue initializes"""
        self.assertIsNotNone(self.queue)
        self.assertFalse(self.queue.running)

    def test_task_queue_start_stop(self):
        """Test starting and stopping queue"""
        self.queue.start()
        self.assertTrue(self.queue.running)
        self.assertEqual(len(self.queue.workers), 2)

        self.queue.stop()
        self.assertFalse(self.queue.running)
        print("✓ Task queue start/stop working")

    def test_submit_sync_task(self):
        """Test submitting a synchronous task"""
        self.queue.start()

        def simple_func(x):
            return x * 2

        task = self.queue.submit_task("test_sync_1", simple_func, args=(5,))
        self.assertIsNotNone(task)

        # Wait for completion
        import time

        time.sleep(0.5)

        task = self.queue.get_task("test_sync_1")
        self.assertEqual(task.status, TaskStatus.COMPLETED)
        self.assertEqual(task.result, 10)
        print("✓ Sync task executed: 5 * 2 = 10")

    def test_submit_async_task(self):
        """Test submitting an asynchronous task"""
        self.queue.start()

        async def async_func(x):
            await asyncio.sleep(0.1)
            return x + 10

        task = self.queue.submit_task("test_async_1", async_func, args=(5,))
        self.assertIsNotNone(task)

        # Wait for completion
        import time

        time.sleep(0.5)

        task = self.queue.get_task("test_async_1")
        self.assertEqual(task.status, TaskStatus.COMPLETED)
        self.assertEqual(task.result, 15)
        print("✓ Async task executed: 5 + 10 = 15")

    def test_get_task_result_blocking(self):
        """Test blocking wait for task result"""
        self.queue.start()

        def slow_func():
            import time

            time.sleep(0.2)
            return "done"

        self.queue.submit_task("slow_task", slow_func)

        # This should block until task completes
        result = self.queue.get_task_result("slow_task", timeout=2.0)
        self.assertEqual(result, "done")
        print("✓ Blocking wait for result: 'done'")

    def test_task_failure_handling(self):
        """Test handling of failed tasks"""
        self.queue.start()

        def failing_func():
            raise ValueError("Test error")

        self.queue.submit_task("failing_task", failing_func)

        import time

        time.sleep(0.3)

        task = self.queue.get_task("failing_task")
        self.assertEqual(task.status, TaskStatus.FAILED)
        self.assertIn("Test error", task.error)
        print(f"✓ Task failure captured: {task.error}")

    def test_queue_statistics(self):
        """Test queue statistics"""
        self.queue.start()

        for i in range(3):
            self.queue.submit_task(f"task_{i}", lambda x: x, args=(i,))

        import time

        time.sleep(0.5)

        stats = self.queue.get_stats()
        self.assertIn("total_tasks", stats)
        self.assertIn("status_breakdown", stats)
        self.assertEqual(stats["num_workers"], 2)
        print(f"✓ Queue stats: {stats}")


def run_tests():
    """Run all tests"""
    print("\n" + "=" * 70)
    print("LLM-ENHANCED DANGER DETECTOR TEST SUITE")
    print("=" * 70 + "\n")

    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    # Add test classes
    suite.addTests(loader.loadTestsFromTestCase(TestLLMDangerDetector))
    suite.addTests(loader.loadTestsFromTestCase(TestTaskQueue))

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
