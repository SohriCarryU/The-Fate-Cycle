import unittest


class TestGlobalImageRateLimit(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        # Import inside setup so we can safely patch module globals per test.
        from backend.app import openai_client

        self.openai_client = openai_client
        # Ensure a clean slate.
        async with openai_client._global_image_gen_lock:
            openai_client._global_image_gen_timestamps.clear()

        # Use deterministic time.
        self._t = 1000.0
        openai_client._time_now = lambda: self._t

        # Ensure default window/limit for the test.
        openai_client.settings.IMAGE_GEN_GLOBAL_LIMIT = 10
        openai_client.settings.IMAGE_GEN_GLOBAL_WINDOW_SECONDS = 600

    async def asyncTearDown(self) -> None:
        # Restore time function to avoid leaking state across tests.
        self.openai_client._time_now = __import__("time").monotonic

    async def test_allows_up_to_limit(self):
        for _ in range(10):
            ok, retry_after = await self.openai_client._try_acquire_global_image_quota(1)
            self.assertTrue(ok)
            self.assertIsNone(retry_after)

        ok, retry_after = await self.openai_client._try_acquire_global_image_quota(1)
        self.assertFalse(ok)
        self.assertIsNotNone(retry_after)

    async def test_window_expires(self):
        # Fill the quota at t=1000
        for _ in range(10):
            ok, _ = await self.openai_client._try_acquire_global_image_quota(1)
            self.assertTrue(ok)

        # Still within window -> should reject
        self._t = 1000.0 + 599.0
        ok, _ = await self.openai_client._try_acquire_global_image_quota(1)
        self.assertFalse(ok)

        # Move beyond window -> should allow again
        self._t = 1000.0 + 601.0
        ok, retry_after = await self.openai_client._try_acquire_global_image_quota(1)
        self.assertTrue(ok)
        self.assertIsNone(retry_after)

