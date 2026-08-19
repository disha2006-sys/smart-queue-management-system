import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Headphones,
  ChevronDown,
  Check,
  Store,
  Megaphone,
  User,
  Clock,
  CheckCircle2,
  Users,
  Hash,
  Power,
  Timer,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import {
  callNextCustomer as apiCallNext,
  getLiveStatus,
  type Token,
} from '@/api/queueApi';

type CounterStatus = 'active' | 'closed';

type ServingToken = {
  number: string;
  name: string;
} | null;

const COUNTERS = [1, 2, 3];

const POLL_INTERVAL = 5000;

export default function OperatorDashboard() {
  const [selectedCounter, setSelectedCounter] = useState(1);
  const [statuses, setStatuses] = useState<Record<number, CounterStatus>>({
    1: 'active',
    2: 'active',
    3: 'active',
  });
  const [serving, setServing] = useState<Record<number, ServingToken>>({
    1: null,
    2: null,
    3: null,
  });
  const [pendingCount, setPendingCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [callFlash, setCallFlash] = useState(false);
  const [completeFlash, setCompleteFlash] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const status = statuses[selectedCounter];
  const currentServing = serving[selectedCounter];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await getLiveStatus();
      setPendingCount(res.pendingCustomers ?? 0);

      const servingMap: Record<number, ServingToken> = { 1: null, 2: null, 3: null };
      for (const t of res.servingTokens ?? []) {
        const counterNum = t.counter?.counterNumber;
        if (counterNum && COUNTERS.includes(counterNum)) {
          servingMap[counterNum] = {
            number: String(t.tokenNumber),
            name: t.user?.name ?? 'Customer',
          };
        }
      }
      setServing(servingMap);
      setStatusError(null);
    } catch (err) {
      setStatusError(
        err instanceof Error
          ? err.message
          : 'Unable to load counter status.'
      );
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  // Poll live-status to keep serving state in sync
  useEffect(() => {
    refreshStatus();
    const id = setInterval(refreshStatus, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [refreshStatus]);

  const toggleStatus = () => {
    setStatuses((prev) => ({
      ...prev,
      [selectedCounter]:
        prev[selectedCounter] === 'active' ? 'closed' : 'active',
    }));
  };

  const handleCallNext = async () => {
    if (status === 'closed' || isCalling) return;
    setIsCalling(true);
    setActionError(null);
    try {
      const res: Token | null = await apiCallNext(selectedCounter);
      if (!res) {
        setActionError('No customers are waiting in the queue.');
        return;
      }
      setServing((s) => ({
        ...s,
        [selectedCounter]: {
          number: String(res.tokenNumber),
          name: res.user?.name ?? 'Customer',
        },
      }));
      setPendingCount((c) => Math.max(0, c - 1));
      setCallFlash(true);
      setTimeout(() => setCallFlash(false), 1000);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'Unable to call the next customer. Please try again.'
      );
    } finally {
      setIsCalling(false);
    }
  };

  const handleComplete = () => {
    if (!currentServing) return;
    setServing((s) => ({ ...s, [selectedCounter]: null }));
    setCompleteFlash(true);
    setTimeout(() => setCompleteFlash(false), 800);
    refreshStatus();
  };

  const dismissError = () => setActionError(null);

  return (
    <div className="animate-[fadeIn_0.4s_ease-out] w-full max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center shadow-lg">
            <Headphones className="w-6 h-6 text-teal-400" strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              Operator Dashboard
            </h2>
            <p className="text-sm text-slate-500">
              Manage your counter and serve customers efficiently
            </p>
          </div>
        </div>

        {/* Counter Selector dropdown */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Select Counter
          </label>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center justify-between gap-3 w-full sm:w-56 px-4 py-3 rounded-xl bg-white border-2 border-slate-200 shadow-sm transition-all duration-200 hover:border-slate-300 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center">
                <Store className="w-4 h-4 text-teal-600" />
              </div>
              <span className="text-base font-bold text-slate-800">
                Counter {selectedCounter}
              </span>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-full sm:w-56 rounded-xl bg-white border border-slate-200 shadow-xl shadow-slate-300/40 py-1.5 z-20 animate-[fadeIn_0.15s_ease-out]">
              {COUNTERS.map((c) => {
                const isActive = c === selectedCounter;
                const cStatus = statuses[c];
                return (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedCounter(c);
                      setDropdownOpen(false);
                      setActionError(null);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
                      isActive ? 'bg-teal-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Store
                        className={`w-4 h-4 ${
                          isActive ? 'text-teal-600' : 'text-slate-400'
                        }`}
                      />
                      <span
                        className={`text-sm font-semibold ${
                          isActive ? 'text-teal-700' : 'text-slate-700'
                        }`}
                      >
                        Counter {c}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          cStatus === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                      />
                      {isActive && (
                        <Check className="w-4 h-4 text-teal-600" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action error banner */}
      {actionError && (
        <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 animate-[fadeIn_0.2s_ease-out]">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-700">
              Something went wrong
            </p>
            <p className="text-xs text-red-600 mt-0.5 break-words">
              {actionError}
            </p>
          </div>
          <button
            onClick={dismissError}
            className="text-red-400 hover:text-red-600 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Status connection error banner */}
      {statusError && !loadingStatus && (
        <div className="mb-5 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700 flex-1">
            Live status unavailable: {statusError}. Retrying automatically.
          </p>
          <button
            onClick={() => {
              setLoadingStatus(true);
              setStatusError(null);
              refreshStatus();
            }}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Status + queue summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {/* Counter number */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5 text-teal-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Counter
            </p>
            <p className="text-xl font-bold text-slate-800 truncate">
              Counter {selectedCounter}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
              status === 'active' ? 'bg-emerald-50' : 'bg-red-50'
            }`}
          >
            <Power
              className={`w-5 h-5 ${
                status === 'active' ? 'text-emerald-600' : 'text-red-500'
              }`}
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Status
            </p>
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-bold ${
                status === 'active' ? 'text-emerald-600' : 'text-red-500'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  status === 'active'
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-red-500'
                }`}
              />
              {status === 'active' ? 'Active' : 'Closed'}
            </span>
          </div>
        </div>

        {/* Queue length */}
        <div className="col-span-2 sm:col-span-1 bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            {loadingStatus ? (
              <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
            ) : (
              <Users className="w-5 h-5 text-amber-600" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              In Queue
            </p>
            <p className="text-xl font-bold text-slate-800">
              {pendingCount}{' '}
              <span className="text-sm font-medium text-slate-400">
                waiting
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Main grid: serving card + call button */}
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4 sm:gap-6">
        {/* Currently Serving card */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 bg-white">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center">
                <Megaphone className="w-4 h-4 text-teal-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Currently Serving
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Counter {selectedCounter}
            </span>
          </div>

          {currentServing ? (
            <div
              key={currentServing.number}
              className="px-6 py-7 sm:py-8 text-center animate-[fadeIn_0.3s_ease-out]"
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
                Token Number
              </p>
              <div className="text-5xl sm:text-6xl font-black text-slate-800 tracking-tight tabular-nums leading-none mb-5 animate-[slideUpFade_0.4s_ease-out]">
                {currentServing.number}
              </div>

              {/* Customer details */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 w-full sm:w-auto justify-center">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">
                    {currentServing.name}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-teal-50 border border-teal-100 w-full sm:w-auto justify-center">
                  <Timer className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-semibold text-teal-700">
                    Served now
                  </span>
                </div>
              </div>

              {/* Complete button */}
              <button
                onClick={handleComplete}
                className={`mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all duration-200 ${
                  completeFlash
                    ? 'bg-emerald-600 shadow-emerald-500/40 scale-[1.02]'
                    : 'bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-600 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                Complete Current Token
              </button>
            </div>
          ) : (
            <div className="px-6 py-10 sm:py-14 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Hash className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-base font-semibold text-slate-500 mb-1">
                No customer being served
              </p>
              <p className="text-sm text-slate-400 mb-6">
                Press “Call Next Customer” to invite the next person in the
                queue.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Counter is ready and waiting</span>
              </div>
            </div>
          )}
        </div>

        {/* Call Next Customer panel */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-slate-300/40 flex flex-col">
          {/* Gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-teal-600 to-blue-600" />
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              callFlash ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-white/20" />
          </div>
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative px-6 py-7 sm:py-8 flex flex-col items-center justify-center text-center flex-1">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-5 backdrop-blur-sm">
              <Megaphone className="w-7 h-7 text-white" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-50 mb-2">
              {status === 'closed'
                ? 'Counter is closed'
                : pendingCount === 0
                ? 'Queue is empty'
                : `${pendingCount} customer${pendingCount === 1 ? '' : 's'} waiting`}
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-6 max-w-xs">
              Ready to serve the next customer?
            </h3>

            <button
              onClick={handleCallNext}
              disabled={status === 'closed' || isCalling}
              className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-lg transition-all duration-200 ${
                callFlash
                  ? 'bg-white text-teal-700 scale-[1.03] shadow-2xl'
                  : 'bg-white text-teal-700 shadow-2xl shadow-black/20 hover:scale-[1.02] hover:shadow-xl active:scale-100'
              } disabled:bg-white/40 disabled:text-white/60 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100`}
            >
              {isCalling ? (
                <>
                  <span className="w-6 h-6 border-2 border-teal-300 border-t-teal-700 rounded-full animate-spin" />
                  Calling…
                </>
              ) : (
                <>
                  <User className="w-6 h-6" />
                  Call Next Customer
                </>
              )}
            </button>

            {status === 'closed' && (
              <p className="mt-4 text-sm text-teal-50/80">
                Open this counter to start serving customers.
              </p>
            )}
            {status === 'active' && pendingCount === 0 && !isCalling && (
              <p className="mt-4 text-sm text-teal-50/80">
                New tokens will appear here automatically.
              </p>
            )}
          </div>

          {/* Toggle status footer */}
          <div className="relative border-t border-white/20 px-6 py-4">
            <button
              onClick={toggleStatus}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white/90 transition-colors hover:text-white"
            >
              <Power className="w-4 h-4" />
              {status === 'active' ? 'Close Counter' : 'Open Counter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
