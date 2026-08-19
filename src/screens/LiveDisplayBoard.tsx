import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Clock,
  Hash,
  User,
  Store,
  Volume2,
  CalendarDays,
  Megaphone,
  ListOrdered,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { getLiveStatus, type LiveQueueResponse } from '@/api/queueApi';

type ServingTokenView = {
  number: string;
  name: string;
  counter: number;
};

const POLL_INTERVAL = 5000;

export default function LiveDisplayBoard() {
  const [data, setData] = useState<LiveQueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [clock, setClock] = useState(new Date());
  const prevServingKey = useRef<string>('');

  const fetchStatus = useCallback(async () => {
    try {
      const res = await getLiveStatus();
      setData(res);
      setError(null);

      const servingKey =
        res.servingTokens
          ?.map((t) => `${t.tokenNumber}@${t.counter?.counterNumber ?? '-'}`)
          .join('|') ?? '';
      if (
        servingKey &&
        servingKey !== prevServingKey.current &&
        prevServingKey.current !== ''
      ) {
        setFlash(true);
        setTimeout(() => setFlash(false), 1200);
      }
      prevServingKey.current = servingKey;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load live queue status.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Poll live-status
  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchStatus]);

  const servingTokens: ServingTokenView[] =
    data?.servingTokens?.map((t) => ({
      number: String(t.tokenNumber),
      name: t.user?.name ?? 'Customer',
      counter: t.counter?.counterNumber ?? 0,
    })) ?? [];

  const featured = servingTokens[0] ?? null;
  const otherServing = servingTokens.slice(1);
  const pendingCount = data?.pendingCustomers ?? 0;

  const formatClock = (d: Date) =>
    d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  const formatDate = (d: Date) =>
    d.toLocaleDateString([], {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });

  return (
    <div className="animate-[fadeIn_0.4s_ease-out] w-full max-w-5xl mx-auto">
      {/* Top status strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
            <CalendarDays className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-semibold text-slate-700">
              {formatDate(clock)}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-slate-700">
              Live
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white shadow-md">
            <Clock className="w-4 h-4 text-teal-400" />
            <span className="text-lg font-bold tabular-nums tracking-tight">
              {formatClock(clock)}
            </span>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-3" />
          <p className="text-slate-500 font-medium">Loading live status…</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-base font-semibold text-slate-700 mb-1">
            Couldn't load the live board
          </p>
          <p className="text-sm text-slate-500 max-w-sm mb-4">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchStatus();
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Board content */}
      {!loading && !error && (
        <>
          {/* Currently Serving panel */}
          <div
            className={`relative rounded-3xl overflow-hidden transition-all duration-500 ${
              flash
                ? 'shadow-2xl shadow-teal-500/40 ring-2 ring-teal-400'
                : 'shadow-xl shadow-slate-900/20 ring-1 ring-slate-800'
            }`}
          >
            {/* Dark gradient backdrop */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
            <div
              className={`absolute inset-0 transition-opacity duration-700 ${
                flash ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-transparent to-blue-500/20" />
            </div>
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative px-6 sm:px-10 py-8 sm:py-10">
              {/* Now Serving badge */}
              <div className="flex items-center justify-center mb-6 sm:mb-8">
                <div
                  className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-teal-500/15 border border-teal-400/30 ${
                    flash ? 'animate-[glowPulse_1.2s_ease-out]' : ''
                  }`}
                >
                  <Megaphone className="w-5 h-5 text-teal-400" />
                  <span className="text-sm sm:text-base font-bold uppercase tracking-[0.25em] text-teal-300">
                    Now Serving
                  </span>
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                </div>
              </div>

              {featured ? (
                <>
                  {/* Token number — extra large */}
                  <div className="text-center mb-8 sm:mb-10">
                    <div
                      key={featured.number}
                      className="text-7xl sm:text-8xl lg:text-9xl font-black text-white tracking-tighter tabular-nums leading-none animate-[slideUpFade_0.5s_ease-out] drop-shadow-2xl"
                    >
                      {featured.number}
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-2 text-slate-300">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-sm sm:text-base font-medium">
                        {featured.name}
                      </span>
                    </div>
                  </div>

                  {/* Counter pill — highly visible */}
                  <div className="flex justify-center mb-7 sm:mb-8">
                    <div
                      key={`counter-${featured.number}`}
                      className="flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 shadow-lg shadow-teal-500/30 animate-[slideUpFade_0.6s_ease-out]"
                    >
                      <Store className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                      <div className="text-left">
                        <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-teal-100 font-semibold leading-none mb-1">
                          Please proceed to
                        </p>
                        <p className="text-2xl sm:text-3xl font-black text-white leading-none">
                          Counter {featured.counter}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-4xl sm:text-5xl font-black text-slate-500 tracking-tight mb-3">
                    —
                  </div>
                  <p className="text-lg font-semibold text-slate-300 mb-1">
                    No one is being served right now
                  </p>
                  <p className="text-sm text-slate-400">
                    The next token will appear here automatically.
                  </p>
                </div>
              )}

              {/* Announcement line */}
              <div className="flex items-center justify-center gap-2 text-slate-300">
                <Volume2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <p className="text-sm sm:text-base text-center">
                  Please make your way to the counter when your token is called
                </p>
              </div>
            </div>
          </div>

          {/* Other counters currently serving */}
          {otherServing.length > 0 && (
            <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {otherServing.map((t, i) => (
                <div
                  key={`${t.number}-${i}`}
                  className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <Store className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Counter {t.counter}
                      </p>
                      <p className="text-lg font-bold text-slate-800 tabular-nums truncate">
                        {t.number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-500 flex-shrink-0">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="truncate max-w-[100px]">{t.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Waiting queue summary */}
          <div className="mt-6 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center">
                  <ListOrdered className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
                    Waiting in Queue
                  </h3>
                  <p className="text-xs text-slate-400 hidden sm:block">
                    Customers waiting to be called
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {pendingCount} waiting
              </span>
            </div>

            {pendingCount === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Hash className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-slate-400 font-medium">
                  No customers in the queue right now.
                </p>
              </div>
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-4xl font-black text-slate-800 tabular-nums">
                  {pendingCount}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {pendingCount === 1
                    ? 'customer is waiting to be served'
                    : 'customers are waiting to be served'}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
