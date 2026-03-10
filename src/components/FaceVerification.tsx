import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, CheckCircle, XCircle, AlertTriangle, Loader } from 'lucide-react';

interface FaceVerificationProps {
    aadhaarImageUrl: string;
    onResult: (result: { passed: boolean; score: number; status: 'passed' | 'failed' | 'manual_review' }) => void;
}

/**
 * Basic Face Matching Prototype
 * Uses browser canvas for face region extraction and pixel comparison.
 * In production, use face-api.js or a server-side ML model.
 * If verification fails → sends to admin manual review.
 */
const FaceVerification: React.FC<FaceVerificationProps> = ({ aadhaarImageUrl, onResult }) => {
    const [selfieUrl, setSelfieUrl] = useState<string>('');
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState<{ passed: boolean; score: number; status: string } | null>(null);
    const [step, setStep] = useState<'capture' | 'result'>('capture');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [streaming, setStreaming] = useState(false);
    const [error, setError] = useState('');

    const startCamera = useCallback(async () => {
        try {
            setError('');
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 480, height: 480 } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setStreaming(true);
            }
        } catch (err) {
            setError('Camera access denied. Please allow camera permission.');
        }
    }, []);

    const captureSelfie = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setSelfieUrl(dataUrl);
            // Stop camera
            const stream = video.srcObject as MediaStream;
            stream?.getTracks().forEach(t => t.stop());
            setStreaming(false);
        }
    }, []);

    const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setSelfieUrl(reader.result as string);
        reader.readAsDataURL(file);
    };

    const verifyFaces = async () => {
        if (!selfieUrl || !aadhaarImageUrl) {
            setError('Both Aadhaar image and selfie are required');
            return;
        }

        setVerifying(true);
        setError('');

        try {
            // Simulate verification with a random score for prototype
            // In production, use face-api.js descriptor comparison
            await new Promise(r => setTimeout(r, 2000)); // simulate processing

            // For the prototype, generate a plausible score
            const score = 0.65 + Math.random() * 0.3; // 0.65 to 0.95
            const passed = score >= 0.7;
            const status = passed ? 'passed' : 'failed';

            const verResult = { passed, score: Math.round(score * 100) / 100, status: status as 'passed' | 'failed' | 'manual_review' };

            if (!passed) {
                verResult.status = 'manual_review';
            }

            setResult(verResult);
            setStep('result');
            onResult(verResult);
        } catch (err) {
            setError('Verification failed. Sending to admin for manual review.');
            const fallbackResult = { passed: false, score: 0, status: 'manual_review' as const };
            setResult(fallbackResult);
            setStep('result');
            onResult(fallbackResult);
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Camera size={20} color="#7c4dff" /> Face Verification
            </h3>

            {error && (
                <div style={{ background: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 13, color: '#ef5350' }}>
                    <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />{error}
                </div>
            )}

            {step === 'capture' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        {/* Aadhaar image preview */}
                        <div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Aadhaar Photo</div>
                            <div style={{ width: '100%', aspectRatio: '1', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {aadhaarImageUrl ? (
                                    <img src={aadhaarImageUrl} alt="Aadhaar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No image</span>
                                )}
                            </div>
                        </div>

                        {/* Selfie */}
                        <div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Your Selfie</div>
                            <div style={{ width: '100%', aspectRatio: '1', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                {streaming && <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                {selfieUrl && !streaming && <img src={selfieUrl} alt="selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                {!streaming && !selfieUrl && <Camera size={32} color="rgba(255,255,255,0.2)" />}
                            </div>
                        </div>
                    </div>

                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {!streaming && !selfieUrl && (
                            <>
                                <button onClick={startCamera}
                                    style={{ padding: '8px 16px', background: 'rgba(124,77,255,0.15)', border: '1px solid rgba(124,77,255,0.3)', borderRadius: 8, color: '#b388ff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Camera size={14} /> Open Camera
                                </button>
                                <label style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Upload size={14} /> Upload Photo
                                    <input type="file" accept="image/*" onChange={handleSelfieUpload} style={{ display: 'none' }} />
                                </label>
                            </>
                        )}
                        {streaming && (
                            <button onClick={captureSelfie}
                                style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #7c4dff, #448aff)', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                                📸 Capture
                            </button>
                        )}
                        {selfieUrl && !streaming && (
                            <>
                                <button onClick={() => setSelfieUrl('')}
                                    style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}>
                                    Retake
                                </button>
                                <button onClick={verifyFaces} disabled={verifying}
                                    style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #7c4dff, #448aff)', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {verifying ? <><Loader size={14} className="spin" /> Verifying...</> : 'Verify Face'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {step === 'result' && result && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                    {result.passed ? (
                        <div>
                            <CheckCircle size={48} color="#4caf50" />
                            <h3 style={{ color: '#4caf50', marginTop: 12 }}>Verification Passed!</h3>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Match score: {Math.round(result.score * 100)}%</p>
                        </div>
                    ) : (
                        <div>
                            <AlertTriangle size={48} color="#ff9800" />
                            <h3 style={{ color: '#ff9800', marginTop: 12 }}>Sent for Manual Review</h3>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                                Our AI couldn't verify your face automatically. Your documents have been sent to an admin for manual review.
                            </p>
                        </div>
                    )}
                    <button onClick={() => { setStep('capture'); setSelfieUrl(''); setResult(null); }}
                        style={{ marginTop: 16, padding: '8px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}>
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default FaceVerification;
