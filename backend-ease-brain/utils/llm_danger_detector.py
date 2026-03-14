"""
LLM-Enhanced Danger Detector
Optional layer on top of rule-based detector using LLM for nuanced analysis.
Supports OpenAI, Anthropic, and other configurable API backends.
"""

import os
import json
import logging
from typing import Optional, Dict, Any
from enum import Enum
from dataclasses import dataclass
import asyncio

from utils.danger_detector import DetectionResult, SeverityLevel

logger = logging.getLogger(__name__)


class LLMProvider(Enum):
    """Supported LLM providers"""

    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    LOCAL = "local"  # For local models via ollama, etc.


@dataclass
class LLMDetectionResult(DetectionResult):
    """Extended result with LLM confidence and reasoning"""

    llm_enhanced: bool = False
    llm_provider: Optional[str] = None
    llm_reasoning: Optional[str] = None
    rule_vs_llm_agreement: Optional[float] = None  # 0.0 to 1.0, how much they agree


class LLMDangerDetector:
    """
    LLM-enhanced danger detector for subtle ideation and intent detection.
    Runs asynchronously to avoid blocking writes.
    """

    # Configuration from environment
    DEFAULT_PROVIDER = os.getenv("DANGER_DETECTOR_LLM_PROVIDER", "openai")
    DEFAULT_MODEL = os.getenv("DANGER_DETECTOR_LLM_MODEL", "gpt-3.5-turbo")
    API_KEY = os.getenv("DANGER_DETECTOR_LLM_API_KEY", "")
    ENABLED = os.getenv("DANGER_DETECTOR_LLM_ENABLED", "false").lower() == "true"
    TIMEOUT_SECONDS = int(os.getenv("DANGER_DETECTOR_LLM_TIMEOUT", "5"))

    # System prompt for consistent outputs
    SYSTEM_PROMPT = """You are a mental health crisis detection expert. Analyze the given text for:
1. Suicidal ideation (thoughts of suicide)
2. Intent (commitment to act)
3. Means (access to methods)
4. Planning (specific timeline/plan)
5. Self-harm (non-suicidal self-injury)
6. Crisis indicators (severe distress)

Respond ONLY with valid JSON (no markdown, no extra text) in this exact format:
{
    "severity_score": 0.0-1.0,
    "severity_level": "low|medium|high|critical",
    "categories": ["category1", "category2"],
    "reasoning": "Brief explanation of why this severity was assigned"
}

Be conservative - only flag as critical if there's clear, immediate danger."""

    def __init__(
        self,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
    ):
        """
        Initialize LLM detector.

        Args:
            provider: LLM provider (openai, anthropic, local). Defaults to env var.
            model: Model name. Defaults to env var.
            api_key: API key. Defaults to env var.
        """
        self.provider = provider or self.DEFAULT_PROVIDER
        self.model = model or self.DEFAULT_MODEL
        self.api_key = api_key or self.API_KEY
        self.enabled = self.ENABLED and bool(self.api_key)

        if self.enabled:
            logger.info(
                f"LLM detector enabled with provider={self.provider}, model={self.model}"
            )
        else:
            logger.info(
                "LLM detector disabled (set DANGER_DETECTOR_LLM_ENABLED=true and API key)"
            )

    async def enhance_detection(
        self,
        text: str,
        rule_based_result: DetectionResult,
        context: Optional[Dict] = None,
    ) -> LLMDetectionResult:
        """
        Enhance rule-based detection with LLM analysis.

        Args:
            text: Text to analyze
            rule_based_result: Result from rule-based detector
            context: Optional context (user_id, community_id, etc.)

        Returns:
            Enhanced detection result combining rule + LLM signals
        """
        if not self.enabled:
            # Return rule-based result as-is if LLM not enabled
            return self._convert_to_llm_result(rule_based_result)

        try:
            # Call LLM asynchronously with timeout
            llm_score, llm_level, llm_categories, reasoning = await asyncio.wait_for(
                self._call_llm(text),
                timeout=self.TIMEOUT_SECONDS,
            )

            # Combine rule-based + LLM scores (weighted average: 60% rules, 40% LLM)
            combined_score = (rule_based_result.severity_score * 0.60) + (
                llm_score * 0.40
            )

            # Calculate agreement between rule-based and LLM
            score_diff = abs(rule_based_result.severity_score - llm_score)
            agreement = max(0.0, 1.0 - score_diff)  # 0.0 = disagree, 1.0 = agree

            # Merge categories (union of both detectors)
            merged_categories = list(
                set(rule_based_result.categories) | set(llm_categories)
            )

            # Map combined score to severity level
            if combined_score >= 0.75:
                combined_level = SeverityLevel.CRITICAL
            elif combined_score >= 0.55:
                combined_level = SeverityLevel.HIGH
            elif combined_score >= 0.30:
                combined_level = SeverityLevel.MEDIUM
            else:
                combined_level = SeverityLevel.LOW

            logger.info(
                f"LLM enhancement: rule_score={rule_based_result.severity_score:.2f}, "
                f"llm_score={llm_score:.2f}, combined={combined_score:.2f}, agreement={agreement:.2f}"
            )

            return LLMDetectionResult(
                severity_score=combined_score,
                severity_level=combined_level,
                categories=merged_categories,
                matched_phrases=rule_based_result.matched_phrases,
                rationales=rule_based_result.rationales
                + [f"LLM reasoning: {reasoning}"],
                should_escalate=combined_score >= 0.75,
                suggested_action="escalate"
                if combined_score >= 0.75
                else (
                    "review"
                    if combined_score >= 0.55
                    else ("monitor" if combined_score >= 0.30 else "none")
                ),
                detector_version="2.0-llm-enhanced",
                llm_enhanced=True,
                llm_provider=self.provider,
                llm_reasoning=reasoning,
                rule_vs_llm_agreement=agreement,
            )

        except asyncio.TimeoutError:
            logger.warning(
                f"LLM detection timed out after {self.TIMEOUT_SECONDS}s, falling back to rule-based"
            )
            return self._convert_to_llm_result(rule_based_result, reason="LLM timeout")

        except Exception as e:
            logger.error(f"LLM detection error: {str(e)}, falling back to rule-based")
            return self._convert_to_llm_result(
                rule_based_result, reason=f"LLM error: {str(e)}"
            )

    async def _call_llm(self, text: str) -> tuple:
        """
        Call the LLM API.

        Returns:
            Tuple of (severity_score, severity_level, categories, reasoning)
        """
        if self.provider == LLMProvider.OPENAI.value:
            return await self._call_openai(text)
        elif self.provider == LLMProvider.ANTHROPIC.value:
            return await self._call_anthropic(text)
        elif self.provider == LLMProvider.LOCAL.value:
            return await self._call_local(text)
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")

    async def _call_openai(self, text: str) -> tuple:
        """Call OpenAI API (requires openai package)"""
        try:
            import openai  # type: ignore

            openai.api_key = self.api_key
        except ImportError:
            raise ImportError(
                "openai package required for OpenAI provider. Install with: pip install openai"
            )

        try:
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=self.model,
                messages=[
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {"role": "user", "content": text},
                ],
                temperature=0.3,  # Low temperature for consistent outputs
                max_tokens=500,
            )

            result_text = response.choices[0].message.content.strip()
            result = json.loads(result_text)

            return (
                float(result.get("severity_score", 0.0)),
                result.get("severity_level", "low"),
                result.get("categories", []),
                result.get("reasoning", "No reasoning provided"),
            )

        except json.JSONDecodeError as e:
            logger.error(f"OpenAI response parsing error: {str(e)}")
            raise ValueError("Invalid JSON response from LLM")

    async def _call_anthropic(self, text: str) -> tuple:
        """Call Anthropic Claude API (requires anthropic package)"""
        try:
            import anthropic  # type: ignore
        except ImportError:
            raise ImportError(
                "anthropic package required for Anthropic provider. Install with: pip install anthropic"
            )

        try:
            client = anthropic.Anthropic(api_key=self.api_key)

            message = await asyncio.to_thread(
                client.messages.create,
                model=self.model,
                max_tokens=500,
                system=self.SYSTEM_PROMPT,
                messages=[
                    {"role": "user", "content": text},
                ],
            )

            result_text = message.content[0].text.strip()
            result = json.loads(result_text)

            return (
                float(result.get("severity_score", 0.0)),
                result.get("severity_level", "low"),
                result.get("categories", []),
                result.get("reasoning", "No reasoning provided"),
            )

        except json.JSONDecodeError as e:
            logger.error(f"Anthropic response parsing error: {str(e)}")
            raise ValueError("Invalid JSON response from LLM")

    async def _call_local(self, text: str) -> tuple:
        """Call local LLM via ollama or similar (requires requests)"""
        try:
            import requests
        except ImportError:
            raise ImportError("requests package required for local LLM provider")

        try:
            local_url = os.getenv(
                "DANGER_DETECTOR_LOCAL_URL", "http://localhost:11434/api/generate"
            )

            prompt = f"{self.SYSTEM_PROMPT}\n\nText to analyze:\n{text}"

            response = await asyncio.to_thread(
                requests.post,
                local_url,
                json={"model": self.model, "prompt": prompt, "stream": False},
                timeout=self.TIMEOUT_SECONDS,
            )

            response.raise_for_status()
            result_text = response.json().get("response", "").strip()

            # Try to extract JSON from response
            import re

            json_match = re.search(r"\{.*\}", result_text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                raise ValueError("No JSON found in local LLM response")

            return (
                float(result.get("severity_score", 0.0)),
                result.get("severity_level", "low"),
                result.get("categories", []),
                result.get("reasoning", "No reasoning provided"),
            )

        except Exception as e:
            logger.error(f"Local LLM error: {str(e)}")
            raise

    def _convert_to_llm_result(
        self,
        rule_result: DetectionResult,
        reason: str = "LLM not enabled",
    ) -> LLMDetectionResult:
        """Convert rule-based result to LLM result format"""
        return LLMDetectionResult(
            severity_score=rule_result.severity_score,
            severity_level=rule_result.severity_level,
            categories=rule_result.categories,
            matched_phrases=rule_result.matched_phrases,
            rationales=rule_result.rationales,
            should_escalate=rule_result.should_escalate,
            suggested_action=rule_result.suggested_action,
            detector_version=rule_result.detector_version,
            llm_enhanced=False,
            llm_provider=None,
            llm_reasoning=reason,
            rule_vs_llm_agreement=None,
        )

    def get_config(self) -> Dict[str, Any]:
        """Return detector configuration for debugging"""
        return {
            "enabled": self.enabled,
            "provider": self.provider,
            "model": self.model,
            "timeout_seconds": self.TIMEOUT_SECONDS,
            "api_key_set": bool(self.api_key),
        }


# Singleton instance
_llm_detector_instance = None


def get_llm_detector(
    provider: Optional[str] = None,
    model: Optional[str] = None,
    api_key: Optional[str] = None,
) -> LLMDangerDetector:
    """Factory function to get or create LLM detector instance"""
    global _llm_detector_instance
    if _llm_detector_instance is None:
        _llm_detector_instance = LLMDangerDetector(
            provider=provider, model=model, api_key=api_key
        )
    return _llm_detector_instance
