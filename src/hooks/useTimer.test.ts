import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from './useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts at full remaining time', () => {
    const { result } = renderHook(() => useTimer(5000));
    expect(result.current.remainingMs).toBe(5000);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isExpired).toBe(false);
  });

  it('counts down when started', () => {
    const { result } = renderHook(() => useTimer(5000));
    act(() => {
      result.current.start();
    });
    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remainingMs).toBeLessThan(5000);
    expect(result.current.remainingMs).toBeGreaterThanOrEqual(3900);
  });

  it('pauses counting', () => {
    const { result } = renderHook(() => useTimer(5000));
    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    const remaining = result.current.remainingMs;

    act(() => {
      result.current.pause();
    });
    expect(result.current.isRunning).toBe(false);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.remainingMs).toBe(remaining);
  });

  it('resets to full time', () => {
    const { result } = renderHook(() => useTimer(5000));
    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.remainingMs).toBe(5000);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isExpired).toBe(false);
  });

  it('fires onExpire callback when time runs out', () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() => useTimer(500, onExpire));
    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current.isExpired).toBe(true);
    expect(result.current.isRunning).toBe(false);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('does not double-fire onExpire if start called twice', () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() => useTimer(500, onExpire));
    act(() => {
      result.current.start();
    });
    act(() => {
      result.current.start(); // second call should be ignored
    });
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('cleans up interval on unmount', () => {
    const onExpire = vi.fn();
    const { result, unmount } = renderHook(() => useTimer(500, onExpire));
    act(() => {
      result.current.start();
    });
    unmount();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onExpire).not.toHaveBeenCalled();
  });
});
