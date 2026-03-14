"""
Background Task Queue for Async LLM Detection
Handles off-thread LLM calls to avoid blocking message creation.
Uses Threading for simplicity (can be upgraded to Celery/RQ for scale).
"""

import threading
import logging
import asyncio
from typing import Callable, Any, Optional
from datetime import datetime
from queue import Queue, Empty
from enum import Enum

logger = logging.getLogger(__name__)


class TaskStatus(Enum):
    """Task status enumeration"""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class Task:
    """Represents a background task"""

    def __init__(
        self, task_id: str, func: Callable, args: tuple = (), kwargs: dict = None
    ):
        self.task_id = task_id
        self.func = func
        self.args = args
        self.kwargs = kwargs or {}
        self.status = TaskStatus.PENDING
        self.result = None
        self.error = None
        self.created_at = datetime.utcnow()
        self.started_at = None
        self.completed_at = None

    def __repr__(self):
        return f"<Task {self.task_id} status={self.status.value}>"


class TaskQueue:
    """
    Simple background task queue for async operations.
    Runs tasks in a thread pool.
    """

    def __init__(self, num_workers: int = 3, max_queue_size: int = 1000):
        """
        Initialize task queue.

        Args:
            num_workers: Number of worker threads
            max_queue_size: Maximum queue size before rejecting new tasks
        """
        self.queue = Queue(maxsize=max_queue_size)
        self.tasks = {}  # task_id -> Task
        self.num_workers = num_workers
        self.workers = []
        self.running = False

    def start(self):
        """Start worker threads"""
        if self.running:
            logger.warning("Task queue already running")
            return

        self.running = True
        for i in range(self.num_workers):
            worker = threading.Thread(target=self._worker_loop, daemon=True)
            worker.start()
            self.workers.append(worker)
        logger.info(f"Started task queue with {self.num_workers} workers")

    def stop(self):
        """Stop worker threads"""
        self.running = False
        # Wait for queue to drain
        for worker in self.workers:
            worker.join(timeout=5)
        logger.info("Task queue stopped")

    def submit_task(
        self, task_id: str, func: Callable, args: tuple = (), kwargs: dict = None
    ) -> Task:
        """
        Submit a task for async execution.

        Args:
            task_id: Unique task identifier
            func: Callable to execute (should be async or return a coroutine)
            args: Positional arguments
            kwargs: Keyword arguments

        Returns:
            Task object (check status later with get_task)
        """
        task = Task(task_id, func, args, kwargs)
        self.tasks[task_id] = task

        try:
            self.queue.put_nowait(task)
            logger.debug(f"Submitted task {task_id}")
            return task
        except Exception as e:
            logger.error(f"Failed to submit task {task_id}: {str(e)}")
            task.status = TaskStatus.FAILED
            task.error = str(e)
            return task

    def get_task(self, task_id: str) -> Optional[Task]:
        """Get task by ID"""
        return self.tasks.get(task_id)

    def get_task_result(self, task_id: str, timeout: float = 10.0) -> Any:
        """
        Get task result, waiting if necessary (up to timeout).

        Args:
            task_id: Task identifier
            timeout: Max time to wait in seconds

        Returns:
            Task result or raises exception
        """
        import time

        start_time = time.time()

        while time.time() - start_time < timeout:
            task = self.get_task(task_id)
            if not task:
                raise ValueError(f"Task {task_id} not found")

            if task.status == TaskStatus.COMPLETED:
                return task.result
            elif task.status == TaskStatus.FAILED:
                raise RuntimeError(f"Task {task_id} failed: {task.error}")

            time.sleep(0.1)

        raise TimeoutError(f"Task {task_id} did not complete within {timeout}s")

    def _worker_loop(self):
        """Worker thread loop"""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        while self.running:
            try:
                task = self.queue.get(timeout=1)
            except Empty:
                continue

            self._execute_task(loop, task)

        loop.close()

    def _execute_task(self, loop: asyncio.AbstractEventLoop, task: Task):
        """Execute a single task"""
        try:
            task.status = TaskStatus.RUNNING
            task.started_at = datetime.utcnow()

            # Check if function is async or returns a coroutine
            result = task.func(*task.args, **task.kwargs)
            if asyncio.iscoroutine(result):
                task.result = loop.run_until_complete(result)
            else:
                task.result = result

            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.utcnow()
            logger.debug(f"Task {task.task_id} completed successfully")

        except Exception as e:
            task.status = TaskStatus.FAILED
            task.error = str(e)
            task.completed_at = datetime.utcnow()
            logger.error(f"Task {task.task_id} failed: {str(e)}")

    def get_stats(self) -> dict:
        """Get queue statistics"""
        statuses = {}
        for task in self.tasks.values():
            status = task.status.value
            statuses[status] = statuses.get(status, 0) + 1

        return {
            "total_tasks": len(self.tasks),
            "queue_size": self.queue.qsize(),
            "num_workers": self.num_workers,
            "running": self.running,
            "status_breakdown": statuses,
        }


# Global task queue instance
_task_queue = None


def get_task_queue(num_workers: int = 3) -> TaskQueue:
    """Get or create global task queue"""
    global _task_queue
    if _task_queue is None:
        _task_queue = TaskQueue(num_workers=num_workers)
        _task_queue.start()
    return _task_queue


def shutdown_task_queue():
    """Shutdown global task queue"""
    global _task_queue
    if _task_queue:
        _task_queue.stop()
        _task_queue = None
