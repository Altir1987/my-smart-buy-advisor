import { useEffect, useRef, useState } from 'react';

export default function useSpeechRecognition(onResult) {
    const recognitionRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => setIsRecording(true);
            recognition.onend = () => setIsRecording(false);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                onResult(transcript); // передаём в родитель
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                alert('Voice input error: ' + event.error);
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
        } else {
            alert('Your browser does not support voice input.');
        }
    }, [onResult]);

    const toggleRecognition = () => {
        if (!recognitionRef.current) return;
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    return {
        isRecording,
        toggleRecognition,
    };
}
