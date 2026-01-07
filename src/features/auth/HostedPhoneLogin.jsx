import React, { useState, useEffect } from 'react';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Phone, CheckCircle, Loader } from 'lucide-react';
import { getFirebaseInstances } from '../../services/firebase';

const HostedPhoneLogin = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [step, setStep] = useState('init'); // init, otp, name, verifying, success, error
    const [error, setError] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [redirectUrl, setRedirectUrl] = useState('');
    const [userCredential, setUserCredential] = useState(null);
    const [successName, setSuccessName] = useState('');

    useEffect(() => {
        // Parse query params
        const params = new URLSearchParams(window.location.search);
        const phoneParam = params.get('phone');
        const redirectParam = params.get('redirect');

        if (phoneParam) {
            setPhoneNumber(phoneParam);
        }
        if (redirectParam) {
            setRedirectUrl(redirectParam);
        }

        // Initialize Recaptcha
        const { auth } = getFirebaseInstances();
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                    console.log("reCAPTCHA solved");
                }
            });
        }
    }, []);

    const handleSendOTP = async () => {
        if (!phoneNumber) {
            setError("Phone number is missing");
            return;
        }

        try {
            setStep('sending');
            setError('');
            const { auth } = getFirebaseInstances();
            const appVerifier = window.recaptchaVerifier;

            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            setConfirmationResult(confirmation);
            setStep('otp');
        } catch (err) {
            console.error("Error sending OTP:", err);
            setError(err.message);
            setStep('init');
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }

        try {
            setStep('verifying');
            setError('');
            // alert('Starting verification...'); // Debug

            // 1. Verify OTP
            const result = await confirmationResult.confirm(otp);
            setUserCredential(result); // Save user credential
            setStep('name'); // Go to Name step

        } catch (err) {
            console.error("Error verifying OTP:", err);
            alert(`Error: ${err.message}`); // Show error to user
            setError(err.message);
            setStep('otp');
        }
    };

    const handleNameSubmit = async (skipped = false) => {
        try {
            setStep('verifying');
            console.log("STARTING TOKEN EXCHANGE - VERSION: FETCH_METHOD");
            const user = userCredential.user;
            const idToken = await user.getIdToken();

            // Use fetch to call the public Cloud Run endpoint directly
            const functionUrl = "https://exchangetoken-344365593313.us-central1.run.app";

            console.log("STARTING TOKEN EXCHANGE - VERSION: DIRECT_CLOUD_RUN");
            console.log("Target URL:", functionUrl);

            const response = await fetch(functionUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idToken,
                    name: skipped ? null : name
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            const data = await response.json();
            const { firebaseCustomToken, name: returnedName } = data;

            console.log("Token Exchange Success! Name:", returnedName);

            // Show success state with name
            setStep('success');
            // We can store the name in a state variable if we want to display it, 
            // but for now let's just use a local variable or update the UI to show it.
            // Since we don't have a 'successName' state, let's just alert it or update the UI text dynamically.
            // Actually, let's update the UI to show the name.

            // Hack: Update the 'Verified!' text to include the name by setting a temporary state or just relying on the UI update.
            // Let's add a new state for successName in the component.
            setSuccessName(returnedName);

            // Delay redirect slightly so user can see the welcome message
            setTimeout(() => {
                if (redirectUrl) {
                    let finalUrl;
                    // Fix: Check if we are on the web (localhost or web.app)
                    // If redirectUrl is 'mydukaan://', it only works on mobile with the app installed.
                    // If we are testing on web, we should just redirect to the root or a web route.
                    const isWeb = window.location.protocol === 'http:' || window.location.protocol === 'https:';
                    const isAppScheme = redirectUrl.startsWith('mydukaan://');

                    if (isWeb && isAppScheme) {
                        // We are on web, but trying to open app scheme -> Redirect to web root instead
                        console.log("Web environment detected: Preventing app scheme redirect. Redirecting to root.");
                        // Append the token as a query param so the main app can pick it up if needed, 
                        // though typically on web we might just reload the state. 
                        // But for consistency with the app flow:
                        finalUrl = `/?token=${encodeURIComponent(firebaseCustomToken)}`;
                    } else {
                        // Native app or proper web url
                        finalUrl = `${redirectUrl}?token=${encodeURIComponent(firebaseCustomToken)}`;
                    }

                    console.log("Redirecting to:", finalUrl);
                    window.location.href = finalUrl;
                    window.finalRedirectUrl = finalUrl;
                } else {
                    setError("No redirect URL found");
                    setStep('error');
                }
            }, 2000); // 2 second delay

        } catch (err) {
            console.error("Error exchanging token:", err);
            alert(`Error: ${err.message}`);
            setError(err.message);
            setStep('name'); // Go back to name step on error
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {step === 'name' ? 'Enter Your Name' : 'Verify Phone Number'}
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {step === 'init' || step === 'sending' ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        value={phoneNumber}
                                        readOnly
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    onClick={handleSendOTP}
                                    disabled={step === 'sending'}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {step === 'sending' ? (
                                        <>
                                            <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                            Sending OTP...
                                        </>
                                    ) : (
                                        'Send OTP'
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : step === 'otp' ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Enter OTP
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="123456"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    onClick={handleVerifyOTP}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Verify OTP
                                </button>
                            </div>
                        </div>
                    ) : step === 'name' ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Your Name (Optional)</label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleNameSubmit(true)}
                                    className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={() => handleNameSubmit(false)}
                                    className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    ) : step === 'verifying' ? (
                        <div className="text-center">
                            <Loader className="mx-auto h-12 w-12 text-indigo-500 animate-spin" />
                            <p className="mt-2 text-sm text-gray-500">Finalizing login...</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                            <h3 className="mt-2 text-xl font-medium text-gray-900">Welcome, {successName || 'User'}!</h3>
                            <p className="mt-1 text-sm text-gray-500">Redirecting back to app...</p>
                            <button
                                onClick={() => {
                                    if (window.finalRedirectUrl) {
                                        window.location.href = window.finalRedirectUrl;
                                    }
                                }}
                                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                            >
                                Click here if not redirected
                            </button>
                        </div>
                    )}

                    <div id="recaptcha-container"></div>
                </div>
            </div>
        </div>
    );
};

export default HostedPhoneLogin;
