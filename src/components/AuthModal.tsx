import React, { useState, useEffect, useRef } from 'react';
import { 
  signInWithPopup, 
  signInWithPhoneNumber, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInAnonymously,
  RecaptchaVerifier,
  ConfirmationResult
} from 'firebase/auth';
import { auth, googleProvider, ensureUserProfile } from '../utils/firebase';
import { translations } from '../utils/translations';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mail, 
  Lock, 
  Smartphone, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  Chrome, 
  CheckCircle2, 
  User,
  ArrowLeft
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ne';
}

type AuthMethod = 'select' | 'email' | 'phone';

export function AuthModal({ isOpen, onClose, lang }: AuthModalProps) {
  const t = translations[lang];
  const [method, setMethod] = useState<AuthMethod>('select');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Email Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // Phone Auth State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setMethod('select');
      setErrorMessage(null);
      setSuccessMessage(null);
      setLoading(false);
      setEmail('');
      setPassword('');
      setPhoneNumber('');
      setVerificationCode('');
      setConfirmationResult(null);
      setOtpSent(false);
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {}
        recaptchaVerifierRef.current = null;
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Google Account Login
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await ensureUserProfile(user.uid, user.email, user.phoneNumber, user.displayName, user.photoURL);
      setSuccessMessage(lang === 'en' ? "Successfully logged in with Google!" : "गुगल मार्फत सफलतापूर्वक लगइन भयो!");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Failed to log in with Google.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Guest Login
  const handleGuestSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await signInAnonymously(auth);
      setSuccessMessage(lang === 'en' ? "Entered in Guest Sandbox mode!" : "गेस्ट मोडमा सफलतापूर्वक प्रवेश!");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Failed to log in anonymously.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Email/Password Auth
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage(lang === 'en' ? "Please fill in all blanks." : "कृपया सबै विवरण भर्नुहोस्।");
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await ensureUserProfile(result.user.uid, result.user.email, result.user.phoneNumber, "Farmer App User", "");
        setSuccessMessage(lang === 'en' ? "Account created successfully!" : "खाता सफलतापूर्वक सिर्जना भयो!");
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await ensureUserProfile(result.user.uid, result.user.email, result.user.phoneNumber, result.user.displayName, result.user.photoURL);
        setSuccessMessage(lang === 'en' ? "Successfully logged in!" : "सफलतापूर्वक लगइन भयो!");
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error: any) {
      console.error(error);
      let NepalMessage = error.message;
      if (error.code === 'auth/wrong-password') NepalMessage = lang === 'en' ? "Incorrect password. Please try again." : "गलत पासवर्ड! कृपया पुन: प्रयास गर्नुहोस्।";
      if (error.code === 'auth/user-not-found') NepalMessage = lang === 'en' ? "No user profile found with this email." : "यो इमेलमा कुनै खाता फेला परेन।";
      if (error.code === 'auth/email-already-in-use') NepalMessage = lang === 'en' ? "Email is already registered. Please login." : "यो इमेल पहिले नै दर्ता भइसकेको छ।";
      setErrorMessage(NepalMessage);
    } finally {
      setLoading(false);
    }
  };

  // 4. Initialise Phone Invisible Recaptcha
  const initRecaptcha = () => {
    if (recaptchaVerifierRef.current) return;
    try {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-anchor', {
        size: 'invisible',
        callback: () => {
          // Solved
        },
        'expired-callback': () => {
          setErrorMessage(lang === 'en' ? "reCAPTCHA expired. Please retry." : "reCAPTCHA म्याद सकियो! पुन: प्रयास गर्नुहोस्।");
        }
      });
    } catch (e: any) {
      console.error("recaptcha init error", e);
    }
  };

  // 5. Send Verification Code SMS
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setErrorMessage(lang === 'en' ? "Please input a valid phone number." : "कृपया मान्य फोन नम्बर राख्नुहोस्।");
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      initRecaptcha();
      const appVerifier = recaptchaVerifierRef.current;
      if (!appVerifier) {
        throw new Error("reCAPTCHA component failed to initialize.");
      }

      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setSuccessMessage(t.otpSendSuccess);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Failed to send SMS OTP code.");
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (r) {}
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  // 6. Confirm Verification Code SMS
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || !confirmationResult) {
      setErrorMessage(lang === 'en' ? "Please enter a valid 6-digit code." : "कृपया ६ अंकको कोड राख्नुहोस्।");
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await confirmationResult.confirm(verificationCode);
      const user = result.user;
      await ensureUserProfile(user.uid, user.email, user.phoneNumber, "Phone User", "");
      setSuccessMessage(lang === 'en' ? "Phone verification successful!" : "फोन प्रमाणीकरण सफल भयो!");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(lang === 'en' ? "Incorrect or expired SMS verification code." : "गलत वा पुरानो एसएमएस कोड। पुन: प्रयास गर्नुहोस्।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-sm">
      {/* Target element for Invisible Recaptcha */}
      <div id="recaptcha-anchor" className="hidden"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white border border-emerald-800/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative z-10"
      >
        {/* Banner */}
        <div className="bg-emerald-900 px-5 py-4 text-white flex justify-between items-center border-b border-emerald-950">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-extrabold text-sm tracking-wide">{t.signInToCloud}</h2>
              <p className="text-[10px] text-teal-300 font-medium">Saroja Farm Secure OS Accounts</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 hover:bg-emerald-800/60 rounded-full transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          
          {/* Messages block */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2 bg-red-50 border border-red-200 p-3 rounded-xl text-red-700 text-xs font-bold leading-normal"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 text-xs font-semibold"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MAIN METHOD SELECTOR SCREEN */}
          {method === 'select' && (
            <div className="space-y-4 pt-1">
              <p className="text-[11px] text-gray-500 text-center font-medium leading-relaxed">
                {t.localSandboxDesc}
              </p>

              <div className="space-y-2.5">
                {/* 1. Google Link */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleSignIn}
                  className="w-full h-11 border border-gray-200 hover:border-emerald-700 bg-white hover:bg-emerald-50/20 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition active:scale-[0.99] cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-750" />
                  ) : (
                    <Chrome className="w-4 h-4 text-red-500" />
                  )}
                  <span>{t.googleSignIn}</span>
                </button>

                {/* 2. Phone Link */}
                <button
                  type="button"
                  onClick={() => setMethod('phone')}
                  className="w-full h-11 border border-gray-200 hover:border-emerald-700 bg-white hover:bg-emerald-50/20 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition active:scale-[0.99] cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>{t.phoneSignIn}</span>
                </button>

                {/* 3. Email Link */}
                <button
                  type="button"
                  onClick={() => setMethod('email')}
                  className="w-full h-11 border border-gray-200 hover:border-emerald-700 bg-white hover:bg-emerald-50/20 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition active:scale-[0.99] cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-amber-500" />
                  <span>{t.emailSignIn}</span>
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-[10px] uppercase font-black tracking-widest bg-white z-10 px-1">OR</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* 4. Guest button */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGuestSignIn}
                  className="w-full h-10 bg-gray-100 hover:bg-gray-250 text-gray-750 font-bold text-xs rounded-lg transition active:scale-[0.99] cursor-pointer"
                >
                  <span>{t.guestSandbox} &rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* EMAIL LOGIN / SIGNUP SCREEN */}
          {method === 'email' && (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <button 
                type="button" 
                onClick={() => setMethod('select')}
                className="flex items-center gap-1.5 text-[10px] uppercase font-black text-emerald-800 hover:text-emerald-950 cursor-pointer self-start"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Go Back</span>
              </button>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-450 block tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="farmer@saroja.com"
                      className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-xs placeholder:text-gray-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-450 block tracking-wider font-sans">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-xs placeholder:text-gray-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs rounded-xl shadow transition duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{isSignUp ? (lang === 'en' ? "Register Account" : "खाता दर्ता गर्नुहोस्") : (lang === 'en' ? "Sign In" : "लगइन गर्नुहोस्")}</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold hover:underline cursor-pointer"
                >
                  {isSignUp 
                    ? (lang === 'en' ? "Already have an account? Sign In" : "खाता छ? यहाँ लगइन गर्नुहोस्।") 
                    : (lang === 'en' ? "Don't have an account? Register here" : "खाता छैन? दर्ता गर्नुहोस्।")}
                </button>
              </div>
            </form>
          )}

          {/* PHONE SMS CONFIGURATION SCREEN */}
          {method === 'phone' && (
            <div className="space-y-4">
              <button 
                type="button" 
                onClick={() => setMethod('select')}
                className="flex items-center gap-1.5 text-[10px] uppercase font-black text-emerald-800 hover:text-emerald-950 cursor-pointer self-start"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Go Back</span>
              </button>

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-450 block tracking-wider">
                      {t.phoneNumberLabel}
                    </label>
                    <div className="relative">
                      <Smartphone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+977-98XXXXXXXX"
                        className="w-full pl-10 pr-3.5 py-3 border border-gray-200 rounded-xl text-xs placeholder:text-gray-400 focus:outline-none focus:border-emerald-600 font-black tracking-wide"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs rounded-xl shadow transition duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                  >
                    {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>{lang === 'en' ? "Send SMS Code" : "एसएमएस कोड पठाउनुहोस्"}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="rounded-xl bg-orange-50 border border-orange-200 p-3.5 text-xs text-orange-850 flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">SMS Dispatch Completed!</span>
                      <p className="text-[11px] text-orange-700 font-medium">Verification SMS generated to: <strong>{phoneNumber}</strong>. Please enter code below.</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-450 block tracking-wider">
                      {t.otpCodeLabel}
                    </label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="123456"
                        className="w-full pl-10 pr-3.5 py-3 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-emerald-600 font-black tracking-widest text-center"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setOtpSent(false)}
                      className="flex-1 h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs rounded-xl transition cursor-pointer"
                    >
                      Resend SMS
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] h-11 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs rounded-xl shadow transition duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                    >
                      {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                      <span>{lang === 'en' ? "Verify and Sign In" : "सत्यापन गर्नुहोस र साइन इन"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
