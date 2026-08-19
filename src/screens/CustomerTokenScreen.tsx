import { useState, useRef, useEffect } from 'react';
import {
  Ticket,
  User,
  Phone,
  Clock,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { generateToken, type Token } from '@/api/queueApi';

type IssuedToken = {
  number: string;
  name: string;
  phone: string;
  waitMinutes: number;
  issuedAt: Date;
};

export default function CustomerTokenScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [token, setToken] = useState<IssuedToken | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const tokenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token && tokenRef.current) {
      tokenRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [token]);

  const validate = () => {
    const next: { name?: string; phone?: string } = {};
    const trimmedName = name.trim();

    if (!trimmedName) {
      next.name = 'Please enter your name';
    } else if (trimmedName.length < 2) {
      next.name = 'Name must be at least 2 characters';
    }

    const digits = phone.replace(/\D/g, '');
    if (!phone.trim()) {
      next.phone = 'Please enter your phone number';
    } else if (digits.length !== 10) {
      next.phone = 'Enter a valid 10-digit phone number';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsGenerating(true);
    setSubmitError(null);
    try {
      const digits = phone.replace(/\D/g, '');
      const res: Token = await generateToken({
        name: name.trim(),
        phoneNumber: digits,
      });
      setToken({
        number: String(res.tokenNumber),
        name: res.user?.name ?? name.trim(),
        phone: res.user?.phoneNumber ?? digits,
        waitMinutes: res.estimatedWaitTimeInMins ?? 0,
        issuedAt: new Date(res.createdAt ?? Date.now()),
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Unable to generate token. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setToken(null);
    setName('');
    setPhone('');
    setErrors({});
    setSubmitError(null);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="animate-[fadeIn_0.4s_ease-out]">
      <div className="w-full max-w-md mx-auto">
        {!token ? (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            {/* Intro */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-xs font-medium text-teal-700">
                  Walk-in friendly · No appointment needed
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                Get Your Queue Token
              </h2>
              <p className="text-slate-500 mt-2 text-sm">
                Fill in your details below to receive a token number and your
                estimated wait time.
              </p>
            </div>

            {/* Form card */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-7"
            >
              {/* Name */}
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Customer Name
                </label>
                <div className="relative">
                  <User
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                      errors.name ? 'text-red-400' : 'text-slate-400'
                    }`}
                  />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name)
                        setErrors((p) => ({ ...p, name: undefined }));
                    }}
                    placeholder="e.g. John Smith"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 bg-slate-50/50 text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 ${
                      errors.name
                        ? 'border-red-300 focus:border-red-500 focus:bg-white'
                        : 'border-slate-200 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600 animate-[fadeIn_0.2s_ease-out]">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="mb-6">
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                      errors.phone ? 'text-red-400' : 'text-slate-400'
                    }`}
                  />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone)
                        setErrors((p) => ({ ...p, phone: undefined }));
                    }}
                    placeholder="e.g. 9876543210"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 bg-slate-50/50 text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 ${
                      errors.phone
                        ? 'border-red-300 focus:border-red-500 focus:bg-white'
                        : 'border-slate-200 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600 animate-[fadeIn_0.2s_ease-out]">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Submit error */}
              {submitError && (
                <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 animate-[fadeIn_0.2s_ease-out]">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-red-700">
                      Could not generate token
                    </p>
                    <p className="text-xs text-red-600 mt-0.5 break-words">
                      {submitError}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold shadow-lg shadow-teal-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isGenerating ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Ticket className="w-5 h-5" />
                    Get Token
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 mt-5">
              Your information is used only to issue your token.
            </p>
          </div>
        ) : (
          /* Token Card */
          <div
            ref={tokenRef}
            className="animate-[fadeInUp_0.6s_ease-out] bg-white rounded-2xl shadow-2xl shadow-slate-300/50 border border-slate-100 overflow-hidden"
          >
            {/* Top banner */}
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-5 relative">
              <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full bg-white/10" />
              <div className="absolute bottom-0 left-0 w-24 h-24 -ml-12 -mb-12 rounded-full bg-white/10" />
              <div className="relative flex items-center gap-2.5">
                <CheckCircle2 className="w-6 h-6 text-white" />
                <div>
                  <p className="text-white font-semibold text-sm">
                    Token Issued Successfully
                  </p>
                  <p className="text-teal-50 text-xs">
                    Issued · {formatTime(token.issuedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Token number */}
            <div className="px-6 pt-7 pb-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                Your Token Number
              </p>
              <div className="inline-block relative">
                <div className="text-5xl sm:text-6xl font-extrabold text-slate-800 tracking-tight tabular-nums animate-[popIn_0.5s_ease-out]">
                  {token.number}
                </div>
              </div>

              {/* Notch divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-slate-50 rounded-xl p-3.5 text-left border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Estimated Wait Time</span>
                  </div>
                  <p className="text-lg font-bold text-slate-800">
                    ~{token.waitMinutes}{' '}
                    <span className="text-sm font-medium text-slate-500">
                      min
                    </span>
                  </p>
                </div>
              </div>

              {/* Customer info */}
              <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 border border-teal-100">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-medium text-teal-800">
                    {token.name}
                  </span>
                </div>
                <span className="hidden sm:inline text-teal-300">·</span>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-medium text-teal-800 tabular-nums">
                    {token.phone}
                  </span>
                </div>
              </div>

              {/* Wait message */}
              <div className="mt-4 flex items-center justify-center gap-2 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <p className="text-sm font-medium">Please wait for your turn</p>
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-6 pb-6 pt-1">
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm transition-all duration-200 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50/50"
              >
                Issue Another Token
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
